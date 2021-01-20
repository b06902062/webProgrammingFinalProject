import os

from io_utils import pickle_load
from event2midi import event_to_midi

import miditoolkit.midi.parser as midi_parser

event2idx, idx2event = pickle_load('event_vocab/vocab.pkl')
event2idx['PAD_None'] = len(event2idx)
idx2event[ len(idx2event) ] = 'PAD_None'

###########################
# data utilities
###########################
def word2event(word_seq):
  return [ idx2event[w] for w in word_seq ]

def get_first_tempo(midi_obj, overwrite_tempo=False):
  first_tempo = midi_obj.tempo_changes[0].tempo

  if overwrite_tempo:
    midi_obj.tempo_changes = [midi_obj.tempo_changes[0]]

  return first_tempo

def midi2json(midi_obj):
  notes = []
  for n in midi_obj.instruments[0].notes:
    notes.append({
      'key': n.pitch,
      'velocity': n.velocity,
      'start_tick': n.start,
      'duration': n.end - n.start
    })
  return notes


###########################
# API helpers
###########################
def load_dataset(data_dir=None):
  if not data_dir:
    data_dir = './tmp_init_samples'
  dset = [os.path.join(data_dir, p) for p in os.listdir(data_dir)]
  return dset

def get_sample(dataset, idx, return_raw=False):
  data_dict = pickle_load(dataset[idx])
  events = word2event(data_dict['dec_input'].tolist())
  midi_obj = event_to_midi(events)

  tempo = get_first_tempo(midi_obj)
  notes_json = midi2json(midi_obj)
  rfreq_cls = data_dict['rhymfreq_cls_bar'].tolist()
  polyph_cls = data_dict['polyph_cls_bar'].tolist()

  return tempo, notes_json, rfreq_cls, polyph_cls

def get_recommended_composition(midi_path):
  midi_obj = midi_parser.MidiFile(midi_path)
  song_json = midi2json(midi_obj)
  return song_json

def convert_composition(song_words):
  song_events = word2event(song_words)
  midi_obj = event_to_midi(song_events)
  tempo = get_first_tempo(midi_obj, overwrite_tempo=True)
  song_json = midi2json(midi_obj)

  return song_json, midi_obj, tempo

def sort_recom_cmp_rating(recom_obj):
  if (recom_obj['likes'] + recom_obj['dislikes']) == 0:
    return 0.5

  return recom_obj['likes'] / (recom_obj['likes'] + recom_obj['dislikes'])

def sort_recom_cmp_rater_cnt(recom_obj):
  return recom_obj['likes'] + recom_obj['dislikes']