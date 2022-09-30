---
title: 'tensorflow 준비'
date: '2022-02-21'
categories:
  - 'memo'
---

## 그래픽 드라이버

- nvidia 최신 드라이버 설치
- cuda 11.3 설치 [https://developer.nvidia.com/cuda-toolkit-archive](https://developer.nvidia.com/cuda-toolkit-archive)
- cuDNN v8.2.1 (June 7th, 2021), for CUDA 11.x [https://developer.nvidia.com/rdp/cudnn-archive](https://developer.nvidia.com/rdp/cudnn-archive)
- cuDNN 압축풀어서 cuda 설치폴더에 붙여넣기 C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v11.3

## python 설치

- miniconda3 설치 [https://docs.conda.io/en/latest/miniconda.html](https://docs.conda.io/en/latest/miniconda.html)
- miniconda 관리자권한으로 실행
- python 환경생성

```bash
conda create -n tensor python=3.8
conda activate tensor
```

### 텐서플로우 설치

```bash
pip install tensorflow-gpu>=2.5.0,<2.7.0
```

[https://www.tensorflow.org/install/gpu](https://www.tensorflow.org/install/gpu)

- gpu 인식테스트

```bash
python
```

```python
import tensorflow
from tensorflow.python.client import device_lib
print(device_lib.list_local_devices())
```

```bash
2022-02-22 00:17:37.198723: I tensorflow/core/platform/cpu_feature_guard.cc:142] This TensorFlow binary is optimized with oneAPI Deep Neural Network Library (oneDNN) to use the following CPU instructions in performance-critical operations:  AVX AVX2
To enable them in other operations, rebuild TensorFlow with the appropriate compiler flags.
2022-02-22 00:17:37.882632: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1510] Created device /device:GPU:0 with 9440 MB memory:  -> device: 0, name: NVIDIA GeForce RTX 3080 Ti, pci bus id: 0000:23:00.0, compute capability: 8.6
[name: "/device:CPU:0"
device_type: "CPU"
memory_limit: 268435456
locality {
}
incarnation: 5050334808703057182
, name: "/device:GPU:0"
device_type: "GPU"
memory_limit: 9898950656
locality {
  bus_id: 1
  links {
  }
}
incarnation: 6738684737477047134
physical_device_desc: "device: 0, name: NVIDIA GeForce RTX 3080 Ti, pci bus id: 0000:23:00.0, compute capability: 8.6"
```

gpu가 안나오면 cuda/cudnn 설치확인
