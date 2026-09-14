---
title: Stiefel 流形
categories: AI
tag: [Geometry,Optimizer,AI]
date: 2026-09-14
updated: 2026-09-14
description: Stiefel流形的性质，及其在优化器与训练动力学中的应用
cover: picture/Kanami2.jpg
---

Stiefel 流形是正交非方阵构成的微分流形
$$
\mathrm{St}_p(n) = \left\{X\in\mathbb{R}^{n\times p}, X^TX=I_p, p\leq n\right\}
$$

Stiefel 流形是实正交群 $O(n)$ 的自然推广，$p=n$ 时退化
$$
\mathrm{St}_n(n)\simeq O(n)
$$

非退化情况则是齐性商流形
$$
\mathrm{St}_p(n) \simeq  O(n)/O(n-p)
$$

Stiefel 流形的维度
$$
\dim \mathrm{St}_p(n)= np -
$$
