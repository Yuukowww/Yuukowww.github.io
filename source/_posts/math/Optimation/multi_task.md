---
title: 多任务优化与帕累托最优
date: 2026-08-11
updated: 2026-08-22
categories: optimation
tag: [convex geometry,optimation]
description: 多任务最优化
cover: picture/mutsumi1.png
---
# 多任务最优化
**向量逼近问题** 考虑实线性空间$X$, 非空集合 $S\subset X$，给定一个映射$f: S\to Y$, 在偏序锥$C_Y$的序关系下，求最小元 $\bar{x}\in S$
$$
\forall x\in S, f(x)\succeq_{C_Y} f(\bar{x})
$$
对于常见的范数锥
$$
Y=X\times\mathbb{R},\quad C_Y = \left\{ (x,t)| \|x\|_p\leq t\, , p\geq 1\right\}
$$
向量逼近问题就是求
$$
\bar{x}\in\argmin_{x\in S} \|x-x_0\|_p
$$

## Pareto 集与 Pareto 优化

对于向量最优化问题，朴素的想法是:
$$
\argmin_{x\in S}f = \bigcap_{i} \argmin_{x\in S} f_i
$$
这样能保证向量的每一个维度都是最优的，但是后者不一定存在, 比如多个目标之间存在 trade-off，在相同区域内一个目标增长，一个目标减少。Pareto Set就是在这样的情况下减弱为一个的minimal solution 的集合，满足
$$
\mathcal P=\left\{\bar{x}\in S:\nexists x\in S,(\forall i, f_i​(x)\leq f_i​(\bar x))\wedge(\exists j, f_j​(x)<f_j​(\bar x))\right\}
$$
这是 $\mathbb{R}_+^n$ 上的偏序关系

**Example**:
考虑约束集
$$
S:=\left\{(x_1,x_2)\in\mathbb{R}^2\mid x_1^2-x_2\leq 0,\quad x_1+2x_2-3\leq 0\right\}
$$
以及向量函数 $f:S\to\mathbb{R}^2$，其中对于所有 $(x_1,x_2)\in S$，
$$
f(x_1,x_2)=
\begin{pmatrix}
-x_1\\
x_1+x_2^2
\end{pmatrix}.
$$
求目标的最小优化

可行域为
$$
x_1^2\leq x_2\leq \frac{3-x_1}{2}
$$
对应
$$
x_1 \in \left[-\frac{3}{2},1\right]
$$
基于主元 $x_1$ 计算目标边界条件
$$
f_2(x_1,x_2) = x_1+x_2^2\geq x_1+x_1^4
$$

$$
\varphi(x)=x+x^4, \varphi'(x) = 1+4x^3
$$
下边界函数在 $[-\frac{3}{2},-\frac{\sqrt[3]2}2]$ 减，$[-\frac{\sqrt[3]2}2,1]$ 增。 在 $[-\frac{3}{2},-\frac{\sqrt[3]2} 2]$ 目标$f_1$ 和目标$f_2$的下边界单调性相同，只有在 $[-\frac{\sqrt[3]2}2,1]$ 存在 trade-off, 因此Pareto 集为
$$
\mathcal P
=
\left\{
(x_1,x_2)\in\mathbb R^2
\;\middle|\;
x_1\in
\left[-\frac{\sqrt[3]{2}}2,1\right],
\quad x_2=x_1^2
\right\}
$$

### Pareto 前沿

Pareto 前沿是Pareto集关于 $f$ 的像。 代入
$$
\begin{dcases}
y_1 = -x_1\\
y_2 = x_1+x_2^2 = x_1+x_1^4 = -y_1+y_1^4
\end{dcases}
$$

可知 $\displaystyle y_1\in\left[-1, \frac{\sqrt[3]2}{2}\right]$

$$
T = \left\{(y_1,y_2)\in\mathbb{R}^2:y_1\in \left[-1, \frac{\sqrt[3]2}{2}\right],y_2 = -y_1+y_1^4 \right\}
$$


最大值点出现在左边界上
$$
f\left(-\frac{3}{2},\frac{9}{4}\right) = \left(\frac{3}{2},\frac{57}{16}\right)
$$


![pareto](/picture/pareto/pareto_set_example.png)