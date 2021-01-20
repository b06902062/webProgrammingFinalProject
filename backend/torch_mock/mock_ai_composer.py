import torch
from torch import nn

class MockAIComposer(nn.Module):
  def __init__(self):
    super(MockAIComposer, self).__init__()
    self.module_name = 'mock_model'