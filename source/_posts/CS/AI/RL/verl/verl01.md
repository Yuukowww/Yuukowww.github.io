---
title: RLEngine 01 -- Verl 的数据协议
date: 2026-10-20
updated: 2026-10-20
categories: RL
tag: [RL,Infra]
description: verl的底层实现 -- 底层数据协议
cover: picture/kasuga5.jpg
---

整个protocol.py 中的最核心的对象是`DataProto`类，作为各模块之间的统一数据交换协议。

`DataProtoItem` 类包装了三个对象，作为`DataProto`类下的元信息
- `batch` -- 按样本排列的张量
- `non_tensor_batch` -- 按样本排列的非张量数据，值为 NumPy 数组
- `meta_info` -- 整批数据的配置或附加信息

`DataProto` 是主要的类对象，包含功能
- `save_to_disk` 写入磁盘
- `load_from_disk` 根据路径读取磁盘
- `check_consistency` 核验数据结构是否符合约定。检查`batch`的`batch_size`的维度是否为1
```python
# 合法的batch结构
batch.batch_size = [8]
input_ids:  [8, 128]
scores:     [8]
embeddings: [8, 128, 768]
```
`non_tensor_batch`的值是否是Numpy数组
`meta_info`中规定的类型检测，以及`batch`与`non_tensor_batch` 的维度是否对齐。
`check_consistency`在 `__post_init__` 中实现，因此在`DataProto`创建时就进行校验，后续修改`DataProto`后需要手动校验

- `from_single_dict`/`from_dict`/`from_tensordict` -- 从内存中对应字典的三个基本数据对象写入类对象中

- `to` 绑定device

- `select` 从已经存在的`Dataproto`对象根据传入字段创建新的对象
- `make_iteration` 从`Dataproto`构建minibatch, 能设置minibatch size, epoch, 随机seed。
- `padding` 序列token补齐，根据第一条或者最后一条进行填充
- `chunk` 沿着样本维度切分`Dataproto`, 根据chunk 均分，返回一个Dataproto type list
- `concat` 将`Dataproto`list 拼接为一个`Dataproto`


`BatchData`类区分了三种type TensorDict, KVBatchMeta, BatchMeta, 调用链为 KVBatchMeta的分区+样本 keys+所需字段的字段信息，查询 BatchMeta 的批metadata，再通过`async_get_data`提取原始tensor info

`all_gather_data_proto` 将进程内的proto对象合并