from midi2audio import FluidSynth
from pydub import AudioSegment
import os

try:
  fls = FluidSynth('soundfont/Nice-Steinway-v3.8.sf2')
except:
  fls = None

def synthesize_midi(midi_date, midi_id):
  midi_path = os.path.join(
    './midis/composed/{}'.format(midi_date), 
    '{}.midi'.format(midi_id)
  )
  if fls is not None:
    try:
      output_dir = './audios/composed/{}'.format(midi_date)
      if not os.path.exists(output_dir):
        os.makedirs(output_dir)
      
      output_wav_path = os.path.join(output_dir, '{}.wav'.format(midi_id))
      output_mp3_path = output_wav_path.replace('.wav', '.mp3')
      fls.midi_to_audio(midi_path, output_wav_path)
      wav = AudioSegment.from_wav(output_wav_path)
      wav.export(output_mp3_path, format='mp3')
      os.remove(output_wav_path)
    except:
      pass # do nothing
  else:
    pass # do nothing

  return