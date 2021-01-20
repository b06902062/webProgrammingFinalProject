#############################################
# This file contains mock functions which return input songs as is.
# The real model is not yet released.
#############################################

from io_utils import tensor_to_numpy

def get_latent_embedding_fast(model, data_dict, device):
  return 0

def generate_on_latent_ctrl_vanilla(model, latents, r_cls, p_cls, event2idx, idx2event,
                                    max_events=256, 
                                    primer=None,
                                    _device='cpu', 
                                    data_dict=None):
    time_used = 0.5
    if data_dict is not None:
      print (data_dict['dec_input'])
      return (
        tensor_to_numpy(data_dict['dec_input'].long()).tolist(), 
        time_used
      )
    else:
      return None, time_used