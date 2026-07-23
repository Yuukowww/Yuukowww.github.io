---
title: Kernel Method
date: 2026-07-22
updated: 2026-07-22
description: 核学习与线性表示
categories: LLM
tag: [kernel method, Representation Learning]
cover: picture/asuna3.jpg
---

# Riesz 表示定理

对于Hilbert空间 $\mathcal{H}$ 上的连续线性泛函 
$$
L:\mathcal{H}\to \mathbb{R}
$$

都存在唯一的 $g_L \in \mathcal{H}$


$$
L(f) = \left<f,g_L\right>_\mathcal{H}, \forall f\in \mathcal{H}
$$
且 $\|L\| = \|g_L\|$

对于给定的 $\mathcal{H}\subseteq \left\{f:\mathcal{X}\to \mathbb{R}\right\}$, 对于 $x\in \mathcal{X}$， 点值泛函满足
$$
\delta_x(f) = f(x)
$$

根据Riesz 表示定理，存在唯一$k_x\in\mathcal{H}$, 满足
$$
f(x)= \delta_x(f) = \left<f,k_x\right>_\mathcal{H} = \left<f,k\left(\,\cdot,x\right)\right>_\mathcal{H}
$$






