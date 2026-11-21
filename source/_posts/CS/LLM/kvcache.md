---
title: KVCache
categories: LLM
tag: [LLM,MLsys]
date: 2026-11-19
updated: 2026-11-19
description: KV Cache 形成原理，时间局部性和空间局部性优势和实现
cover: picture/claudechan1.png
---

# KVCache

KV Cache 本质是一个空间换时间的策略


$z_i$ 为 token ID，$x_i$ 为该位置的投影输入。Prefill 将 prompt 的 $x_i$ 按行堆叠为 $X$

$$
Q = XW_Q,\qquad K = XW_K,\qquad V = XW_V.
$$

由于注意力是单向的，这保证KV可复用且Q每一个token只使用一次。KV Cache 将输入token的KV缓存

$$
q_t = x_tW_Q,\qquad k_t = x_tW_K,\qquad v_t = x_tW_V.
$$

沿序列维度更新缓存。
$$
K_{\le t} =
\begin{bmatrix}K_{<t}\\ k_t\end{bmatrix}
\in\mathbb R^{t\times d_k},
\qquad
V_{\le t} =
\begin{bmatrix}V_{<t}\\ v_t\end{bmatrix}
\in\mathbb R^{t\times d_v}.
$$

softmax 沿序列维度计算单头注意力输出
$$
o_t =
\underbrace{\mathrm{Softmax}\!\left(
\frac{q_t K_{\le t}^{\top}}{\sqrt{d_k}}
\right)}_{1\times t}
\underbrace{V_{\le t}}_{t\times d_v}
\in\mathbb R^{1\times d_v}.
$$

$h_t$ 为位置 $t$ 的最终隐藏向量，$\ell_t$ 为词表 logits。
$$
\ell_t = h_tW_{\mathrm{vocab}},\qquad
p(z_{t+1}\mid z_{1:t}) = \mathrm{Softmax}(\ell_t)_{z_{t+1}}.
$$

Prefill 用 prompt 末位的 logits 选出首个生成 token，下一次 forward 才写入该 token 的 K/V。
