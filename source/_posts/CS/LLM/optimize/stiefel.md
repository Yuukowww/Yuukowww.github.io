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

非退化情况则是商流形
$$
\mathrm{St}_p(n) \simeq  O(n)/O(n-p)
$$

因此
$$
\dim \mathrm{St}_p(n) = \frac{n(n-1)}{2} - \frac{(n-p)(n-p-1)}{2} = np - \frac{p(p-1)}{2}
$$

Stiefel流形在 $O(n)$ 的左作用下不变且传递的，因此Stiefel流形是齐性空间。流形在 $p\mathrel{<}n$ 时

取 $Q\in O(n), X_0\in \mathrm{St}_p(n), p\mathrel{<}n$

$$
(QX_0)^T(QX_0) = X_0^T Q^T QX_0 = X_0^TI_n X_0= X_0^TX_0 = I_p
$$

$QX_0\in \mathrm{St}_p(n)$

另一方面，考虑 $Q$ 作用下的稳定子群, $X_0 = (e_i)_{i\leq p}$ 的每一个向量都是$Q$的特征1特征向量

$$
Qe_i = e_i
$$

假设
$$
Q = \begin{pmatrix}
A&B\\
C&D
\end{pmatrix}
$$

考虑$Q$ 的前$p$ 行，左上分块$A$为单位阵$I_p$ 且右上分块$B$为$0$，此时满足 $X_0$ 的前$p$ 维保持。由于 $Q^TQ = I_n$, 即 $D^T D = I_{n-p}$, 因此
$$
\mathrm{Stab}(X_0)\simeq I_{n-p}
$$

因此
$$
\mathrm{St}_p(n) = Q\cdot X_0\simeq O(n)/O(n-p)
$$

当 $p=n$ 时，正交群 $O(n)$ 有两个连通分支，分别对应反射作用下的两支。因此 $\mathrm{St}_p(n)$ 不连通且有两个连通分支，$\det A = \pm 1$

另一特殊情况，当 $p = 1$ 时，满足
$$
\alpha^T\alpha = 1, \alpha^n\in \mathbb R^n
$$
Stiefel流形退化为单位球面
$$
\mathrm{St}_1(n) = S^{n-1}\simeq  O(n)/O(n-1)
$$




