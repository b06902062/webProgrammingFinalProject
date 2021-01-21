import os, sys, random
sys.path.append('./torch_mock')

import torch

from generate_utils import get_latent_embedding_fast, generate_on_latent_ctrl_vanilla
from io_utils import numpy_to_tensor
from mock_ai_composer import MockAIComposer
gpuid = None

def setup_gpu(_gpuid):
  global gpuid
  if _gpuid is not None and _gpuid != '':
    _gpuid = int(_gpuid)
    torch.cuda.set_device(_gpuid)
    gpuid = _gpuid
  return

def load_model(ckpt_path):
  if gpuid is not None:
    try:
      model = torch.load(ckpt_path).cuda(gpuid)
    except:
      model = MockAIComposer().cuda(gpuid)
  else:
    try:
      model = torch.load(ckpt_path)
    except:
      model = MockAIComposer()

  model.use_attr_cls = True
  model.eval()
  print ('[model loaded]', type(model))

  return model

def compose(model, data_dict, event2idx, idx2event, r_cls, p_cls, tempo=119):
  for k in data_dict.keys():
    if not torch.is_tensor(data_dict[k]):
      data_dict[k] = numpy_to_tensor(data_dict[k], gpuid)
    elif gpuid is not None:
      data_dict[k] = data_dict[k].cuda(gpuid)

  device = 'cuda:{}'.format(gpuid) if gpuid is not None else 'cpu'
  latents = get_latent_embedding_fast(model, data_dict, device)
  primer = ['Bar_None', 'Beat_0', 'Tempo_{}'.format(tempo)]
  song, time_used = generate_on_latent_ctrl_vanilla(
    model, latents, r_cls, p_cls, 
    event2idx, idx2event, 
    max_events=1920, primer=primer, 
    _device=device, data_dict=data_dict
  )

  return song, time_used