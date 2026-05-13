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
& = \sum_{ij} x_i W_{ij} x_j
\end{aligned}
$$
是关于$x$的双线性型