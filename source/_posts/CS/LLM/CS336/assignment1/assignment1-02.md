---
title: CS336 01.1 Assignment1 -- Transformer
date: 2026-05-03
updated: 2026-10-26
description: CS336 LLM学习Record 1
tag: [CS336,LLM]
categories: LLM
math: true
cover: picture/amiya1.jpg
---

# Attention is All You Need



## Attention与 Multi-Head Attention
输入向量 $x = (x_1,\cdots,x_n)\in\mathbb{R}^n$经过待训练的矩阵$W_Q, W_K, W_V\in\mathbb{R}^{n\times d}$得到三条输入向量$Q,K,V\in\mathbb{R}^d$

$$
\mathrm{Attention}(Q,K,V) = \mathrm{Softmax}\left(\frac{Q^TK}{\sqrt{d_k}}\right)V
$$

实际上, 对于向量$Q,K$, 展开得
$$
\begin{aligned}
Q^TK &= \left(\sum_i W_{Qi} x_i\right)^T\left(\sum_j W_{Kj}x_j\right)\\
& = \sum_{ij} x_i^T W_{Qi}^T W_{Kj} x_j\\
& = \sum_{ij} x_i R_{ij} x_j
\end{aligned}
$$
是关于$x$的双线性型


多头注意力本质是将多个Attention的输出结合与归并的过程，相比单Attention需要多训练一个输出矩阵 $W_O$，满足
$$
\begin{dcases}
O_i =\mathrm{Attention}(XW_{Q,i},XW_{K,i},XW_{V,i}) =\mathrm{Softmax}(\frac{Q_iK_i^T}{\sqrt{d_i}})\cdot V_i\\
\mathrm{MHA}(X) = \mathrm{Concat}_{i\leq n}(O_i)\cdot W_O
\end{dcases}
$$
其中结合函数`Concat`为一个简单嵌入
$$
\mathrm{Concat}(O_1,\cdots,O_n) = \left(O_1,\cdots,O_n\right)
$$


## 多查询注意力 MQA

MHA是将输出头concat，而MQA是共享Key and value, 输出头代表相同的key and value 下 product 了不同的 Query
$$
O_i = \mathrm{Softmax}\left(\frac{Q_iK^T}{\sqrt{d_i}}\right)V
$$

