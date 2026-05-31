---
title: DeepNet
date: 2026-05-24
update: 2026-05-24
categories: LLM
description: Post-LN/Pre-LN的性能研究与极深 Transformer 的归一化函数设计
cover: picture/Kanami1.png
math: true
---
# DeepNet

本篇文章作为Transformer 中的 Layer Normalization与梯度稳定性的后继文章，进一步进行Layer Normalization的相关学习


## DeepNet 的结构

```
 x_{t+1}
 |
 + --|
 |   |
 α  G,θ
 |---|
 |
x_t
```


**Lemma 1.**: 对于 $X=(\mathbf{x}_1,\cdots,\mathbf{x}_n)\in \mathbb{R}^{n\times d}$, $\mathrm{Var}(\mathbf{x}_i) = 1, \mathbf{E}(\mathbf{x}_i) = 0$, $q_i\in [0,1]$, 则有
$$
\mathrm{Softmax}(q_1,\cdots, q_n)\cdot X \asymp \mathbf{x}_i
$$
这里的 $\asymp$ 表示 equal bound of magnitude，即只比较数量级上的上下界，而不要求两个向量在方向或逐元素取值上相同。
**Proof:**
$$
\begin{aligned}
\mathrm{Softmax}(q_1,\cdots, q_n) \cdot X &= \left(\frac{\exp{q_i}}{\sum \exp{q_j}}\right)_{i}\cdot \left(\mathbf{x}_1,\cdots ,\mathbf{x}_n \right)^T\\
&=\sum \frac{\mathbf{x}_i\exp q_i}{\sum\exp q_j}
\end{aligned}
$$
由于
$$
n\leq\sum \exp q_j\leq ne
$$
有
$$
\frac{1}{\sum \exp q_j} = \Theta\left(\frac{1}{n}\right)
$$
因此可以写成凸集的形式
$$
\mathrm{Softmax}(q_1,\cdots,q_n)X
= \sum_{i=1}^n w_i\mathbf{x}_i,
\quad
w_i=\frac{\exp{q_i}}{\sum \exp q_j}=\Theta\left(\frac1n\right).
$$

因此，由 $w_i=\Theta\left(\frac1n\right)$ 可得
$$
\sum_{i=1}^n w_i\mathbf{x}_i
\asymp
\sum_{i=1}^n \frac1n\mathbf{x}_i .
$$
又因为每个 $\mathbf{x}_i$ 都满足 $\mathbf{E}(\mathbf{x}_i)=0$ 且 $\mathrm{Var}(\mathbf{x}_i)=1$，所以所有 $\mathbf{x}_i$ 具有相同的 magnitude bound。于是 $n$ 个同阶向量经过 $\frac1n$ 量级的权重加权求和后，其输出仍然具有与单个 $\mathbf{x}_i$ 相同的 magnitude bound，即
$$
\sum_{i=1}^n \frac1n\mathbf{x}_i \asymp \mathbf{x}_i .
$$
因此
$$
\mathrm{Softmax}(q_1,\cdots,q_n)X
= \sum_{i=1}^n w_i\mathbf{x}_i
\asymp \mathbf{x}_i .
$$
