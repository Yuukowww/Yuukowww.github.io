---
title: 多任务优化与帕累托最优
date: 2026-08-11
updated: 2026-08-29
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


**几种Edgeworth-Pareto 最优**
- 弱 Edgeworth-Pareto 最优 -- Pareto Set 关于不同维度的边缘的并集，比如
$$
\mathcal{P} = \prod_{i=1}^n [a_i,b_i]
$$
其弱 Edgeworth-Pareto 最优集为
$$
\mathcal{WP} = \left\{(x_1,\cdots,x_n):\bigcup_i \prod_{k<i}[a_k,b_k]\left\{x_i\right\}\prod_{k> i}[a_k,b_k]\right\}
$$

- Properly Edgeworth-Pareto 最优

设 $\bar x\in S$。称 $\bar x$ 为 Properly Edgeworth-Pareto 最优点，当且仅当：

1. $\bar x$ 是 Edgeworth-Pareto 最优点；
2. 存在一个对所有目标和可行点都统一有效的常数 $\mu>0$，使得

$$
\begin{aligned}
&\exists \mu>0,\quad
\forall i\in\{1,\ldots,m\},\quad
\forall x\in S\text{ satisfying }f_i(x)<f_i(\bar x),\\
&\exists j\in\{1,\ldots,m\}\text{ satisfying }f_j(x)>f_j(\bar x),\quad
\frac{f_i(\bar x)-f_i(x)}{f_j(x)-f_j(\bar x)}\leq\mu.
\end{aligned}
$$

Proper EP 要求改善任意一个目标时，至少有另一个目标恶化，并且“改善量 / 恶化量”的交换比率存在统一的有限上界。这里 $j$ 可以随 $i$ 和 $x$ 改变，但 $\mu$ 不可以。

## Weighted Sum Approach

Weighted Sum Approach 通过目标函数的非负线性组合，将多目标优化问题转化为单目标优化问题：

$$
\min_{x\in S}f(x)
\quad\longrightarrow\quad
\min_{x\in S}\sum_{i=1}^m t_i f_i(x),
\qquad t_i\geq 0,\quad t\neq 0.
$$

因为把所有权重同时乘以同一个正数不会改变最优解，所以可以额外归一化为 $\sum_{i=1}^m t_i=1$。这个归一化不是定理成立的必要条件。

### 正权重的加权和解是 Proper EP 点

如果所有权重都严格为正，即 $t_1,\ldots,t_m>0$，并且

$$
\bar x\in\mathop{\arg\min}_{x\in S}\sum_{i=1}^m t_i f_i(x),
$$

则 $\bar x$ 是原多目标优化问题的 Properly Edgeworth-Pareto 最优点。

**证明。** 首先证明 $\bar x$ 是 EP 点。若不是，则存在 $x\in S$ 满足

$$
f_k(x)\leq f_k(\bar x)\quad(k=1,\ldots,m),
$$

并且至少一个不等式严格成立。由于每个 $t_k>0$，于是

$$
\sum_{k=1}^m t_k f_k(x)
<
\sum_{k=1}^m t_k f_k(\bar x),
$$

这与 $\bar x$ 是加权和问题的最优解矛盾。因此 $\bar x$ 是 EP 点。

用反证法证明 $\bar x$ 还是 Proper EP 点。只需讨论 $m\geq2$；$m=1$ 时结论是平凡的。假设 $\bar x$ 不是 Proper EP 点。取

$$
\mu_0:=(m-1)
\max_{p,q\in\{1,\ldots,m\}}
\frac{t_q}{t_p}>0.
$$

由 Proper EP 条件的否定，存在某个 $i\in\{1,\ldots,m\}$ 和某个 $x\in S$，使得 $f_i(x)<f_i(\bar x)$，并且对每个满足 $f_j(x)>f_j(\bar x)$ 的 $j$ 都有

$$
\frac{f_i(\bar x)-f_i(x)}{f_j(x)-f_j(\bar x)}>\mu_0.
$$

记

$$
A:=f_i(\bar x)-f_i(x)>0,
\qquad
\Delta_j:=f_j(x)-f_j(\bar x).
$$

对任意 $j\neq i$，都有

$$
A>(m-1)\frac{t_j}{t_i}\Delta_j.
$$

当 $\Delta_j>0$ 时，它由反证假设和 $\mu_0\geq(m-1)t_j/t_i$ 得到；当 $\Delta_j\leq0$ 时，右端非正而 $A>0$，不等式也自然成立。

将上式乘以 $t_i/(m-1)$，再对全部 $j\neq i$ 求和。左端一共出现 $m-1$ 次，因此

$$
t_iA>
\sum_{\substack{j=1\\j\neq i}}^m
t_j\Delta_j.
$$

又因为 $\Delta_i=f_i(x)-f_i(\bar x)=-A$，所以

$$
\sum_{j=1}^m t_j\bigl(f_j(x)-f_j(\bar x)\bigr)
=-t_iA+
\sum_{\substack{j=1\\j\neq i}}^m t_j\Delta_j
<0.
$$

也就是说

$$
\sum_{j=1}^m t_jf_j(x)
<
\sum_{j=1}^m t_jf_j(\bar x),
$$

这再次与 $\bar x$ 的加权和最优性矛盾。因此 $\bar x$ 必为 Proper EP 点。

因此

$$
\text{正权重加权和的最优解}\quad\Longrightarrow\quad\text{Proper EP 点}.
$$

一般情况下不能直接写成等价关系。按照 Jahn 的 Corollary 11.19，只有进一步假设上像集

$$
f(S)+\mathbb R_+^m
$$

是凸集时，才有

$$
\bar x\text{ 是 Proper EP 点}
\quad\Longleftrightarrow\quad
\exists\,t_1,\ldots,t_m>0,
\quad
\bar x\in\mathop{\arg\min}_{x\in S}\sum_{i=1}^m t_if_i(x).
$$

反向结论依赖凸性与分离定理
