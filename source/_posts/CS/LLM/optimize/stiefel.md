---
title: Stiefel 流形
categories: AI
tag: [Geometry,Optimizer,AI]
date: 2026-09-14
updated: 2026-09-21
description: Stiefel流形的性质，及其在优化器与训练动力学中的应用
cover: picture/Kanami2.jpg
---
![opthistory](/picture/optimizer/stiefel/history.png)
# Stiefel 流形的基本特征
Stiefel 流形是正交非方阵构成的微分流形，在本文中均讨论实Stiefel 流形
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
\dim \mathrm{St}_p(n) = \frac{n(n-1)}{2} - \frac{(n-p)(n-p-1)}{2} = np - \frac{p(p+1)}{2}
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
群作用等价类
$$
[Q] = \left\{Q\begin{pmatrix}I_p&0\\0&Q_{n-p}\end{pmatrix}:Q\in O(n),Q_{n-p}\in O(n-p)\right\}
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

一个最简单直观的例子 $\mathrm{St}_2(3)\simeq O(3)/ O(1)$ 这是三维空间单位球面 $S^2$ 上的单位切丛 $T^1S^2$. 根据右手定则，三维球面任意切平面的有向正交单位基可以确定其法向量构成一个三维正交基，因此$2-3$ Stiefel流形等价于三维旋转的姿态
$$
R = (u,v,u\times v)\in SO(3)
$$
$$
\mathrm{St}_2(3)\simeq T^1S^2 \simeq SO(3) \simeq O(3)/O(1)
$$

## Stiefel 流形的切空间形态

取流形上的一点$X_0$为一个path的起点 $\gamma(0)$,
$$
X^T(\gamma(t))X(\gamma(t))=I_p
$$

微分得
$$
[\dot{X}^T(\gamma(t))X(\gamma(t))+X^T(\gamma(t))\dot{X}(\gamma(t))]\gamma'(t) = 0
$$
$$
\dot{X}^T(\gamma(t))X(\gamma(t))+X^T(\gamma(t))\dot{X}(\gamma(t)) = 0
$$
代入 $t=0$ 得
$$
\dot{X}(0)\in \left\{Z\in \mathbb{R}^{n\times p}:Z^TX_0+X^T_0Z = 0\right\}
$$
因此
$$
T_X\mathrm{St}_p(n) =\left\{Z\in \mathbb{R}^{n\times p}:Z^TX+X^TZ = 0\right\}
$$

这进一步能说明 $X^TZ$ 是反对称矩阵
$$
\forall Z\in T_X\mathrm{St}_p(n), X^TZ\in \mathfrak{so}(p)
$$

对切空间正交补分解
$$
\begin{aligned}
\dot X  &= XX^T\dot X + (I-XX^T)\dot X
\end{aligned}
$$
且
$$
X^T (I-XX^T) = X^T-X^T = 0
$$
$$
\mathrm{Im}(I_n-XX^T) = \ker X^T=\mathrm{Span}(X_\bot)\Longrightarrow  (I-XX^T)\dot X = X_\bot K
$$
取 $\Omega := X^T\dot X,$ Stiefel映射的切空间给出 $\Omega$ 为反对称矩阵，因此

$$
T_X\mathrm{St}_p(n)= \left\{X\Omega+X_\bot K: \Omega +\Omega ^T = 0\right\}
$$



更特殊的，对于实正交群 $O(n)$, 其切空间为
$$
T_XO(n) = \left\{Z=X\Omega\in\mathbb{R}^{n\times n}:\Omega^T+\Omega=0\right\} = X\mathcal{S}_\mathrm{skew}(n)
$$
$\mathcal{S}_\mathrm{Skew}(n)$ 即 $n$ 阶实反对称矩阵



### 切丛

Stiefel流形的切丛也即
$$
T\mathrm{St}_p(n)\simeq \bigsqcup_{X\in \mathrm{St}_p(n)} T_X \mathrm{St}_p(n)
$$

## 法空间和法丛

Stiefel 流形的法空间是其切空间在 $\mathbb{R}^{n\times p}$ 的正交补

映射
$$
F:\mathbb{R}^{n\times p}\to \mathrm{Sym}(p)\quad F(X) = X^TX-I_p
$$
其微分为
$$
\mathrm{d}F_X(Z) = X^TZ+Z^TX
$$

$$
\ker \mathrm{d}F_X = T_X\mathrm{St}_p(n)
$$

法空间与切空间在Frobenius 内积意义下互为正交补，考虑内积诱导的伴随映射

$$
\left<\mathrm{d}F_X(Z),U\right>_F = \left<Z,(\mathrm{d} F_X)^\ast(U)\right>_F
$$

$$
N_X\mathrm{St}_p(n) = (\ker \mathrm{d}F_X)^{\bot} = \mathrm{Im}\,(\mathrm{d}F_X)^\ast
$$

其中
$$
\begin{aligned}
\left<\mathrm{d}F_X(Z),U\right>_F &= \mathrm{tr}((X^TZ+Z^TX)^TU)\\
& = 2\mathrm{tr}(Z^TXU)\\
& = \left<Z,2XU\right>_F
\end{aligned}
$$
因此
$$
(\mathrm{d}F_X)^\ast(U) = 2XU
$$
Stiefel一点上的法空间为
$$
N_X\mathrm{St}_p(n) = \left\{XS:S\in\mathrm{Sym}(p)\right\}
$$
同样的，法丛为逐点法空间粘起的向量丛
$$
N\mathrm{St}_p(n) = \bigsqcup_{X\in \mathrm{St}_p(n)} N_X\mathrm{St}_p(n)
$$


## Stiefel 流形上的黎曼度量和梯度

前文中，伴随映射 $(dF_X)^\ast$ 的定义通常依赖于Frobenius 内积。Frobenius 内积是普通欧氏向量内积在矩阵空间上的自然推广，将其限制到 Stiefel 流形的各个切空间，便得到该嵌入所诱导的欧式Riemann度量。


流形的梯度也依赖于度量的选择
$$
f\to df_X \in T_X^\ast M \overset{Metric}{\longrightarrow} \mathrm{grad}f(X) \in T_XM
$$
Riemann 度量是对光滑流形 $ M$ 与一点 $X\in  M$ 上的对称正定 $2-0$张量
$$
g_X(-,-) :T_XM\otimes T_XM \to \mathbb R
$$

带有Riemann度量的流形称为Riemann 流形。连通Riemann流形上的两点总可以定义分段光滑的路径连接，其定义了Riemann流形的测地线距离.

对于Riemann流形 $(M,g)$ 上道路 $\gamma:[a,b]\to M$

$$
L(\gamma) = \int_a^b \sqrt{g(\dot \gamma (t),\dot \gamma (t))}\,\mathrm{d}t
$$

测地线距离为
$$
\mathrm{dist}: M\times M \to\mathbb R :(x,y)\to\inf_{\gamma \in P_{xy}} L(\gamma)
$$

### Frobenius 度量
前文提及来Frobenius 度量在构建伴随映射和梯度中的作用

Frobenius度量诱导的欧氏度量
$$
\begin{aligned}
g_c(A,B)=\left<X\Omega_1+X_\bot K_1, X\Omega_2+X_\bot K_2\right>_F &= \mathrm{tr}[(X\Omega_1+X_\bot K_1)^T(X\Omega_2+X_\bot K_2)]\\
& = \mathrm{tr} [(\Omega_1^TX^T+K_1^TX_\bot^T)(X\Omega_2+X_\bot K_2)]\\
& = \mathrm{tr}[\Omega_1^TX^TX\Omega_2+K_1^TX_\bot^T X\Omega_2+\Omega_1^TX^TX_\bot K_2+K_1^TX_\bot^TX_\bot K_2]\\
& = \mathrm{tr}(\Omega_1^T\Omega_2+K_1^T K_2)\\
& = \left<\Omega_1,\Omega_2\right>_F+\left<K_1,K_2\right>_F
\end{aligned}
$$

因此
$$
\|A\|_{g_c}=\|X\Omega+X_\bot K\|_F = \||\Omega\|_F+\|K\|_F
$$

### 典范度量
Edelman[@edelman1998geometryalgorithmsorthogonalityconstraints]提及的Stiefel流形上的典范度量来自齐性空间的商度量
$$
\mathrm{St}_p(n)\simeq O(n)/O(n-p)
$$




### Riemann 梯度

对于Riemann流形 $M$,流形上的一点 $X\in M$，流形上的一个光滑标量场 $f$, 其梯度定义为
$$
\mathrm{grad} f(X): g_X(\mathrm{grad}f(X),\xi) = \mathrm{d}f(X)[\xi], \xi \in T_XM
$$
归一化 $\hat \xi = \dfrac{\xi}{\|\xi\|_g}$

$$
\mathrm{grad} f(X): g_X(\mathrm{grad}f(X),\hat\xi) = \mathrm{d}f(X)[\hat \xi], \hat \xi \in T_XM\cap S^{\dim M-1}
$$

右者正是常见的**方向导数**
$$
\mathrm{d}f_X[\xi]=\mathrm{d}f(\gamma(t))\Big|_{t=0}
$$

由Cauchy-Schwarz 不等式, 梯度正是方向导数的最大变化方向的变化量
$$
\mathrm{d}f(X)[\hat \xi] = g_X(\mathrm{grad}f(X),\hat\xi)\leq \|\mathrm{grad}f(X)\|_g\cdot \|\hat \xi\|_g = \|\mathrm{grad}f(X)\|_g
$$
取等条件为
$$
\hat \xi = \frac{\mathrm{grad}f(X)}{\|\mathrm{grad}f(X)\|_g}
$$



# Appendix

## 线性代数Review

**Frobenius 内积**
$$
\left<A,B\right>_F =\mathrm{tr} A^TB
$$


**正交补，伴随映射和赋范线性空间的对偶**
$$
\ker A^T
$$
