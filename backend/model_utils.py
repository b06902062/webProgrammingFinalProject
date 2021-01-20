import os, sys, random
sys.path.append('../vae_transformer')

import torch
from generate_utils import get_latent_embedding_fast, generate_on_latent_ctrl_vanilla
from io_utils import numpy_to_tensor

gpuid = None

def setup_gpu(_gpuid):
  global gpuid
  torch.cuda.set_device(_gpuid)
  gpuid = _gpuid
  return

def load_model(ckpt_path):
  model = torch.load(ckpt_path).cuda(gpuid)
  model.use_attr_cls = True
  model.eval()
  print ('[model loaded]', type(model), 'on device:', next(model.parameters()).device)
  return model

def compose(model, data_dict, event2idx, idx2event, r_cls, p_cls, tempo=119):
  for k in data_dict.keys():
    if not torch.is_tensor(data_dict[k]):
      data_dict[k] = numpy_to_tensor(data_dict[k], gpuid)
    else:
      data_dict[k] = data_dict[k].cuda(gpuid)

  latents = get_latent_embedding_fast(model, data_dict, 'cuda:{}'.format(gpuid))
  primer = ['Bar_None', 'Beat_0', 'Tempo_{}'.format(tempo)]
  song, time_used = generate_on_latent_ctrl_vanilla(
    model, latents, r_cls, p_cls, 
    event2idx, idx2event, 
    max_events=1920, primer=primer, 
    _device='cuda:{}'.format(gpuid)
  )

  return song, time_used