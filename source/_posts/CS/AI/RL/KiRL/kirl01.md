---
title: KiRL 开发日记 01 -- DDP and FSDP
date: 2026-11-10
updated: 2026-11-10
categories: MLsys
tag: [MLsys,RL,training]
description: Data Parallel in training
cover: picture/tsumugi2.png
---


# FSDP 分片方式
假设一个Dense Transformer 架构构成为
```
Attention Block - SwiGLU FFN - ...
```
在一个 Transformer Layer 中，存在的参数Tensor


| tensor | 形状 | 参数量 |
| --- | --- | --- |
| $Q$ | $H\times H$ | $H^2$ |
| $K$ | $H\times H$ | $H^2$ |
| $V$ | $H\times H$ | $H^2$ |
| $O$ | $H\times H$ | $H^2$ |
| Gate | $I\times H$ | $IH$ |
| Up | $I\times H$ | $IH$ |
| Down | $I\times H$ | $IH$ |
| $2\times$ RMSNorm | $H$ | $2H$ |

FSDP sharding的基本单位是一个 unit, 通常对应的是一个 Transformer Block，unit 内均匀分块为若干个 rank

将二维Tensor切片后并列顺序存储为一个一维的 Tensor, 展成的一整个一维Tensor长度为
$$
L = 4H^2 + 3IH+ 2H
$$

每一个rank 对整体一维平展Tensor 均匀分块
$$
\mathrm{len}(Rank_i) = \frac{L}{n}
$$

如果平展Tensor长度不整除n，最后一个rank 需要填充元素，但是不影响计算。



||GPU0|GPU1|GPU2|GPU3|
| --- | --- | --- | --- | --- |
|unit0|rank0|rank1|rank2|rank3|
|unit1|rank0|rank1|rank2|rank3|
|unit2|rank0|rank1|rank2|rank3|


实际计算过程需要 all gather ranks, 每一个rank 都维护了完整的autograd 计算图

在Forward 阶段 逐unit gather后前向(此时unit0的每一个rank都是全量参数，但是其他的unit仍然是sharding的状态)，得到forward激活值保留再reshard rank

在Backward 阶段，根据连接顺序反向逐unit gather进行反向计算，将unit的梯度sharding 并reshard rank.

在Backward得到的梯度shard 和rank的尺寸是对应的，Optimazer step 基于对齐rank直接减法运算就能更新参数




# 开发中问题

## `_prepare_reference_policy` FSDP的参数扁平化
FSDP中的参数不是普通的`nn.Parameter`, 是扁平化并分片