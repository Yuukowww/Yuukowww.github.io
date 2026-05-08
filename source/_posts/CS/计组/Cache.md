---
title: Cache
date: 2026-05-08
description: 计算机组成 -- 高速缓存 Cache
categories: 计组
math: true
cover: picture/neuro2.png
---
# Cache

## Cache的基本工作原理

Cache由若干个数据块和数据块地址构成，每一行都只有一段数据块地址与数据块。

Cache的数据块和主存的某一个数据块一一匹配，但是Cache的数据块数目远小于主存的数据块数量。Cache 的数据块地址的第一段标记地址指向主存内匹配数据块的地址。

Cache的数据块地址内的后段为块内地址。数据块通常为长数据，块内地址指向这个数据块。块内地址的长度取决于数据块的编码方式，当数据块编码方式为字节编码且数据块大小为 $2^n \,\text{B}$, 则块内地址的长度为 $n$

### Cache 的命中率
CPU访问Cache的时候，如果目标内容在Cache中找到吗，则称为**Cache 命中**，否则称为**Cache 未命中**。相对应的命中概率称为**命中率**

设Cache 命中次数为$N_c$, 访问主存次数为$N_m$ , 则命中率定义为
$$
H = \frac{N_c}{N_c+N_m}
$$

Cache命中时，CPU读取数据的时间称为命中时间$T_c$; Cache未命中时，从CPU读取Cache数据到再次访问主存找到数据的整个时间为$T_m+T_c$, 其中$T_m$ 为缺失损失，表示访问主存的时间

## Cache 和 主存之间的映射方式


### 直接映射

