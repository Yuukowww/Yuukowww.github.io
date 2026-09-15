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

Stiefel流形在 $O(n)$ 的左作用下稳定且传递，且流形在 $p\mathrel{<}n$ 时

取 $Q\in O(n), X\in \mathrm{St}_p(n), p\mathrel{<}n$

$$
(QX)^T(QX) = X^T Q^T QX = X^TI_n X = X^TX = I_p
$$

$QX\in \mathrm{St}_p(n)$

当 $p=n$ 时，正交群 $O(n)$ 有两个连通分支，分别对应反射作用下的两支。因此 $\mathrm{St}_p(n)$ 不连通且有两个连通分支，$\det A = \pm 1$






