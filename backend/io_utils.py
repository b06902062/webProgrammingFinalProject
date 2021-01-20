import torch
import pickle

def numpy_to_tensor(arr, gpuid):
  if gpuid is not None:
    return torch.tensor(arr).cuda(gpuid).float()
  else:
    return torch.tensor(arr).float()

def tensor_to_numpy(tensor):
  return tensor.cpu().detach().numpy()

def pickle_load(f):
  return pickle.load(open(f, 'rb'))

def pickle_dump(obj, f):
  pickle.dump(obj, open(f, 'wb'), protocol=pickle.HIGHEST_PROTOCOL)
