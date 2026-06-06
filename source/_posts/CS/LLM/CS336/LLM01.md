---
title: LLM学习:01--Transformer
date: 2026-05-03
description: CS336 LLM学习Record 1
tag: [CS336,LLM,基模]
categories: LLM
math: true
cover: picture/amiya1.jpg
---

# Attention is All You Need

## 模块

### Attention与 Multi-Head Attention
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



#### 多头注意力Multi-Head Attention
多头注意力本质是将多个Attention的输出结合与归并的过程，相比单Attention需要多训练一个输出矩阵 $W_O$，满足
$$
\begin{dcases}
h_i =\mathrm{Attention}(XW_{Q,i},XW_{K,i},XW_{V,i}) =\mathrm{Softmax}(\frac{Q_iK_i^T}{\sqrt{d_i}})\cdot V_i\\
\mathrm{MHA}(X) = \mathrm{Concat}_{i\leq n}(h_i)\cdot W_O
\end{dcases}
$$
其中结合函数`Concat`为一个简单嵌入
$$
\mathrm{Concat}(h_1,\cdots,h_n) = \left(h_1,\cdots,h_n\right)
$$
