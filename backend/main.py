import os, random
from datetime import datetime

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import shortuuid as su

from model_utils import setup_gpu, load_model, compose
from data_utils import (
  load_dataset, 
  get_sample, 
  idx2event, 
  event2idx, 
  convert_composition,
  get_recommended_composition,
  sort_recom_cmp_rater_cnt,
  sort_recom_cmp_rating
)
from synthesize_utils import synthesize_midi
from io_utils import pickle_load

from flask_pymongo import PyMongo
from pymongo.collection import ReturnDocument

load_dotenv()
setup_gpu(os.getenv('WEBAPP_GPUID'))
model = load_model(os.getenv('WEBAPP_CKPT_PATH'))
dset = load_dataset()
app = Flask(__name__)
app.config['MONGO_URI'] = os.getenv('MONGO_URL')
mongo = PyMongo(app)
mongo_collection = mongo.db.muse_optimus
CORS(app)
print ('[mongo]', mongo)

@app.route('/')
def hello():
  print ('[status api] called')
  return jsonify({'data': 'Hello World'})

@app.route('/get_init_sample', methods=['GET', 'POST'])
def get_init_sample():
  if request.method == 'GET':
    piece_id = random.randint(0, len(dset) - 1)
  else:
    req_params = request.get_json(force=True)
    if 'ref_id' not in req_params.keys() or req_params['ref_id'] >= len(dset):
      piece_id = random.randint(0, len(dset) - 1)
    else:
      piece_id = req_params['ref_id'] 

  tempo, notes_json, rfreq_cls, polyph_cls = get_sample(dset, piece_id)

  return jsonify({
    'ref_id': piece_id,
    'tempo': tempo,
    'notes': notes_json,
    'attr_cls': {
      'rhythm': rfreq_cls,
      'polyph': polyph_cls
    }
  })

@app.route('/compose', methods=['GET', 'POST'])
def cond_compose():
  req_params = request.get_json(force=True)
  print ('[compose_params]', req_params)
  compose_uuid = su.uuid()
  
  # compose
  piece_dict = pickle_load(dset[ req_params['ref_id'] ])
  song, time_used = compose(
                      model, piece_dict, event2idx, idx2event,
                      req_params['attr_cls']['rhythm'],
                      req_params['attr_cls']['polyph'],
                      tempo=req_params['tempo']
                    )
  song_json, song_midi_obj, song_tempo = convert_composition(song)

  # create database entry
  timestamp = datetime.utcnow()
  utc_date, utc_time =\
    timestamp.strftime('%Y-%m-%d'), timestamp.strftime('%H:%M:%S')
  mongo_collection.insert_one({
    'utc_date': utc_date,
    'utc_time': utc_time,
    'composed_id': compose_uuid,
    'ref_id': req_params['ref_id'],
    'attr_cls': {
      'rhythm': req_params['attr_cls']['rhythm'], 
      'polyph': req_params['attr_cls']['polyph']
    },
    'tempo': song_tempo,
    'chroma_cluster': -1,
    'likes': 0,
    'dislikes': 0,
    'downloads': 0
  })

  # save MIDI for future use
  midi_dir = './midis/composed/{}/'.format(
    utc_date
  )
  if not os.path.exists(midi_dir):
    os.makedirs(midi_dir)
  song_midi_obj.dump(
    os.path.join(midi_dir, '{}.midi'.format(compose_uuid))
  )

  return jsonify({
    'composed_id': compose_uuid,
    'tempo': req_params['tempo'],
    'notes': song_json,
    'compose_time': round(time_used, 2),
    # 'pianoroll_base64': pianoroll_json
  })

@app.route('/rate', methods=['GET', 'POST'])
def rate_composition():
  req_params = request.get_json(force=True)
  print ('[rate]', req_params)
  composed_id = req_params['composed_id']
  delta_like, delta_dislike =\
    req_params['delta_like'], req_params['delta_dislike']
  
  db_result = mongo_collection.find_one_and_update(
    filter={
      'composed_id': composed_id
    },
    update={
      '$inc': {
        'likes': delta_like,
        'dislikes': delta_dislike
      }
    },
    return_document=ReturnDocument.AFTER
  )

  return jsonify({
    'composed_id': db_result['composed_id'],
    'likes': db_result['likes'],
    'dislikes': db_result['dislikes']
  })

@app.route('/retrieve', methods=['GET', 'POST'])
def retrieve_recommendations_by_ref():
  req_params = request.get_json(force=True)
  retrieval_id = req_params['ref_id']
  composed_id = req_params['composed_id']

  db_results = list(mongo_collection.find({
    '$and': [
      {'ref_id': retrieval_id},
      {'composed_id': {
        '$ne': composed_id
      }}
    ]
  }))
  if len(db_results) > 4:
    rand_back = random.randint(4, len(db_results) - 1)
    db_results[4], db_results[rand_back] =\
      db_results[rand_back], db_results[4]
  if len(db_results) == 0:
    db_results =\
      list(mongo_collection.aggregate([{ '$sample': { 'size': 6 } }]))
  db_results = db_results[:4]
  db_results = sorted(db_results, 
    key=lambda x: (sort_recom_cmp_rating(x), sort_recom_cmp_rater_cnt(x)),
    reverse=True
  )
  recommended_songs = []
  for i, r in enumerate(db_results):
    print (r)
    song_json = get_recommended_composition(
      'midis/composed/{}/{}.midi'.format(
        r['utc_date'], r['composed_id']
      )
    )
    recommended_songs.append({
      'ranking': i + 1,
      'composed_id': r['composed_id'],
      'notes': song_json,
      'tempo': r['tempo'],
      'likes': r['likes'],
      'dislikes': r['dislikes'],
      'downloads': r['downloads']
    })

  return jsonify({
    'ref_id': retrieval_id,
    'n_results': len(recommended_songs),
    'recommended_songs': recommended_songs
  })

@app.route('/download', methods=['GET', 'POST'])
def download_audio():
  req_params = request.get_json(force=True)
  composed_id = req_params['composed_id']
  ranking = req_params['ranking']
  
  if ranking == -1:
    songname = 'my_song'
  else:
    songname = str(ranking)

  db_result = mongo_collection.find_one_and_update(
    filter={
      'composed_id': composed_id
    },
    update={
      '$inc': {
        'downloads': 1
      }
    }
  )

  composed_date = db_result['utc_date']
  audio_path = os.path.join(
    './audios/composed/{}'.format(composed_date), 
    '{}.mp3'.format(composed_id)
  )

  if not os.path.exists(audio_path):
    synthesize_midi(composed_date, composed_id)

  attachment_filename='{}.mp3'.format(songname)

  ##########################################################################
  # use these codes when you don't have working FluidSynth & ffmpeg
  # (fall back to sending MIDI)
  ##########################################################################
  audio_path = os.path.join(
    './midis/composed/{}'.format(composed_date), 
    '{}.midi'.format(composed_id)
  )
  attachment_filename='{}.midi'.format(songname)
  ##########################################################################


  return send_file(
    audio_path,
    as_attachment=True,
    attachment_filename=attachment_filename
  )

if __name__ == "__main__":
  app.run(host='0.0.0.0', port=5000, use_reloader=False, threaded=True)