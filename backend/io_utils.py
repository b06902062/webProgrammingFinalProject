import torch
import pickle, io
from base64 import encodebytes
from PIL import Image

def get_response_image(image_path):
    pil_img = Image.open(image_path, mode='r')
    byte_arr = io.BytesIO()
    pil_img.save(byte_arr, format='JPEG')
    encoded_img = encodebytes(byte_arr.getvalue()).decode('ascii')
    return encoded_img

def numpy_to_tensor(arr, gpuid):
  return torch.tensor(arr).cuda(gpuid).float()

def tensor_to_numpy(tensor):
  return tensor.cpu().detach().numpy()

def pickle_load(f):
  return pickle.load(open(f, 'rb'))

def pickle_dump(obj, f):
  pickle.dump(obj, open(f, 'wb'), protocol=pickle.HIGHEST_PROTOCOL)
