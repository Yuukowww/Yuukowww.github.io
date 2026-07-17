---
title: 凸集
date: 2026-07-15
update: 2026-07-15
categories: 凸几何
description: 凸几何入门
cover: picture/miku5.jpeg
---

# 凸几何基础

## 凸组合、锥组合与仿射组合
### 凸组合
> **凸集**
>
> 集合$C$满足
>$$
x_1,x_2\in C,\forall \theta\in \mathbb{R},\theta x_1+(1-\theta)x_2\in C
>$$
> 称$C$为仿射集
>
> $\theta$限制为$\theta\in[0,1]$时，称集合$C$ 为凸集

> **凸组合**
> 
> 满足
> $$
x = \sum_{i=1}^k \theta_i x_i , \, \sum_{i=1}^k \theta_i = 1, \, \theta_i\geq 0\ (i=1,\ldots,k)
> $$
>则称 点$x$ 是k-点对 $(x_1,x_2,\cdots, x_k)$ 的凸组合
> 
> 进一步称, 集合$S$ 的所有凸组合为集合$S$的凸包，记为$\text{Conv}S$
### 锥组合
锥组合相对弱于凸组合，通过$L_1$ 归一化可以将锥组合转换为凸组合，即

如果
$$
\text{Conv} S\subseteq S
$$
则集合$S$为凸集

$$
\varphi: \sum_{i=1}^k \theta_i x_i \to \sum_{i}^k \frac{\theta_i}{S} x_i, \, S = \sum_{i=1}^k \theta_i
$$

也称为单纯形归一化，通常记单纯形
$$
\Delta^{n-1}:=\left\{\lambda\in \mathbb{R}^n: \lambda_i\geq 0,\sum \lambda_i =1\right\}
$$

集$S$的 所有锥组合的点集称为锥包，记为 $\text{Cone}S$, 如果
$$
\text{Cone}S\subseteq S
$$
则称$S$为凸锥

锥的定义
$$
\forall x\in C,  \forall \lambda>0, \lambda x\in C
$$
即锥对数乘封闭

### 仿射组合
仿射组合在参数范围上弱于凸组合，满足
$$
x = \sum_{i=1}^{k} \theta_i x_i , \theta_i \in \mathbb{R}, \sum_{i=1}^k \theta_i = 1
$$
则$x$是k-点组 $(x_1,x_2,\cdots, x_k)$ 的仿射组合

同样的，仿射包为集合$S$的仿射组合的闭包，记为 $\text{Affine}S$


## 超平面与半空间

超平面是线性方程约束的高维平面
$$
H = \left\{x\in \mathbb{R}^n|a\neq 0, a^Tx-b=0\in\mathbb{R}\right\}
$$
也即
$$
b= \sum_{i=1}^n a_i x_i
$$

因此超平面是仿射泛函 $\varphi(x) = a^Tx-b$ 的水平集

对于超平面$H$, 选择$x,y\in H$, 有
$$
a^T x=b, a^T y =b
$$
考虑凸组合 $z = \lambda x + (1-\lambda)y$,
$$
\begin{aligned}
a^Tz &=  a^T(\lambda x)+ a^{T}((1-\lambda)y)\\
&=\lambda a^Tx+(1-\lambda) a^T y\\
& = \lambda b+(1-\lambda )b=b
\end{aligned}
$$
因此$H$是仿射集与凸集。

根据线性空间基本定理，超平面总是$n-1$ 维的。


半空间是线性规划约束的分半空间，满足
$$
R = \left\{x\in\mathbb{R}^n| a\neq 0,a^T x-b\leq 0\in \mathbb{R}\right\}
$$

即
$$
\sum_{i=1}^n a_i x_i \leq b
$$
半空间总是凸集，但不是仿射集。直观而言半空间有单侧性，而仿射集的组合参数可负导致组合可能在相对的半平面。

> **Theorem** 分离超平面定理 -- 两个凸集合总能嵌入到两个相对半空间并由一个超平面分离
> 
> 给定相互不交的凸集$C,D$,则存在非零向量 $a$ 与常数$b$ ，满足
>$$
\begin{dcases}
a^Tx\leq b & \forall x\in C\subseteq H_{-}\\
a^Tx\geq b & \forall x\in D\subseteq H_{+}
\end{dcases}
>$$
> 满足此条件称凸集$C,D$是弱可分离的， 超平面$\left\{ x\Big|a^T x=b\right\}$ 分离了凸集 $C,D$。 当满足
> $$
\begin{dcases}
a^Tx< b & \forall x\in C\subseteq H_{-}\\
a^Tx> b & \forall x\in D\subseteq H_{+}
\end{dcases}
> $$
> 则称凸集$C,D$是严格可分离的。若进一步存在一致的正间隔，即
> $$
> \sup_{x\in C}a^Tx<\inf_{x\in D}a^Tx,
> $$
> 则称凸集$C,D$是强可分离的。

点集拓扑指出在局部紧的Hausdorff空间，紧集与不相交的闭集可分离。因此对于欧式空间中不相交的凸集$C$ 与$D$，若一个是闭凸集、另一个是紧凸集，则二者可以强分离。

当 $\operatorname{dist}(C,D)=0$ 时，任何一致连续的映射 $\phi$ 都保留这种零距离，即
$$
\operatorname{dist}(\phi(C),\phi(D)) = 0
$$
因此无法使映射后的两个集合获得正间隔。




**Question**: 是否有两个凸集在当前维超平面强不可分但是非线性嵌入高维空间后超平面强可分的例子

例如在 $\mathbb{R}^2$ 中取两个闭凸集
$$
C=\left\{(x,y)\mid y\geq e^x\right\},\qquad
D=\left\{(x,y)\mid y\leq 0\right\}.
$$
二者不相交，但是
$$
(-n,e^{-n})\in C,\qquad (-n,0)\in D,
$$
两点的距离 $e^{-n}\to 0$，因此 $\operatorname{dist}(C,D)=0$，在原空间中不存在具有正间隔的分离超平面。

考虑非线性嵌入
$$
\phi(x,y)=\left(x,y,e^{-x}y\right)\in\mathbb{R}^3.
$$
记第三个坐标为 $z=e^{-x}y$，则
$$
(x,y)\in C\Longrightarrow z\geq 1,
\qquad
(x,y)\in D\Longrightarrow z\leq 0.
$$
因此映射后的两个集合可以被超平面 $z=\frac{1}{2}$ 强分离。这个映射不是全局一致连续的，因此与上述结论不矛盾。

### 与表征学习的联系

在表征学习中，编码器 $f_\theta$ 将原始输入映射为表征
$$
x\longmapsto z=f_\theta(x),
$$
再使用线性分类头 $w^Tz+b$ 分类。其几何目标之一，就是学习一个非线性特征映射，使原空间中难以线性分离的类别，在表征空间中可以被超平面分离。线性探针则是对这种线性可分性的直接检验。

对于有限二分类样本，设两类表征集合为 $Z_+$ 和 $Z_-$，则存在具有正间隔的线性分类器当且仅当
$$
\operatorname{Conv}(Z_+)\cap\operatorname{Conv}(Z_-)=\varnothing.
$$
因此超平面分离定理可以用来描述“表征是否能被线性读出”。


## 多面体

多面体是有限个超平面/半空间的交空间，即
$$
P= \left\{ x\in \mathbb{R}^n | Ax\leq b, Cx=d\right\}
$$

## 一些例子

范数锥
$$
A= \left\{(x,t)| \|x\|\leq t \right\}
$$

半正定锥
$$
S^n_+ = \left\{ X\in S^n| X\succeq 0\,(z\in \mathbb{R}^n, z^* Xz\geq 0) \right\}
$$

半正定锥总是闭凸锥:
$$
\forall X,Y\in S^n_+, \,U = a\lambda X+b(1-\lambda)Y
$$
$$
z^* U z = a\lambda z^*Xz +b (1-\lambda )z^*Yz\geq 0
$$
因此$S^n_+$是凸锥

# 保凸变换

## 仿射变换

仿射变换
$$
f(x)= Ax+b
$$
是保凸的

设凸集$S$, 
$$
\forall x,y\in S, z = \theta x+(1-\theta)y
$$

$$
\begin{aligned}
f(z) &=  A(\theta x+ (1-\theta)y) +b\\
& = \theta (Ax+b) +(1-\theta)(Ay +b) \in S
\end{aligned}
$$

## 透视变换

透视变换 $P:\mathbb{R}^{n+1}\to \mathbb{R}^n$
$$
P(x,t)  = \frac{x}{t}
$$

$$
\text{dom}P = \left\{(x,t) | t>0\right\}
$$

透视变换实际是一个齐次化锥

## 分式线性变换

$$
f(x) = \frac{Ax+b}{c^Tx+d}
$$

$$
\text{dom}f = \left\{x| c^Tx+d>0\right\}
$$

# 适当锥


> **适当锥**
>
> 一个凸锥 $K\subseteq\mathbb{R}^n$ 称为适当锥，如果它还满足：
>
> - $K$ 是闭集；
> - $K$ 是实心的，即 $\operatorname{int}K\neq\varnothing$；
> - $K$ 是尖的，即 $K$ 不含非平凡直线。等价地，若 $x\in K$ 且 $-x\in K$，则必有 $x=0$。

一个典型的范例是雪糕筒锥的Partial
$$
C = \partial K = \left\{(x,t)\Big| \|x\|_p=1, t\geq 0 \right\}
$$
这个锥不满足两个条件： 这既不是凸锥，也不是实心锥


# 对偶锥
对于锥$K$ 可以诱导出其对偶锥
$$
K^* =\left\{ y\in \Omega | \left<x,y\right>\geq 0, x\in K\right\}
$$

考虑范数锥
$$
K = \left\{ (x,t)| \|x\|_p\leq t\, , p\geq 1\right\}
$$
其对偶锥满足Hölder 对偶关系，即
$$
K^* = \left\{(y,s)\,\Big|\left<x,y\right>+ts\geq 0, \, q\geq 1\right\}\Longleftrightarrow \left\{(y,s)\Big| \|y\|_q\leq s , \frac{1}{p}+\frac{1}{q}=1\right\}
$$ 


充分性:

假设 $\|y\|_q\leq s$, 由
$$
\begin{aligned}
\left<y,x\right>+ts&\geq - \|x\|_p\|y\|_q+ts\\
&=-t\|y\|_q +ts\\
&=t(s-\|y\|_q)\geq 0
\end{aligned}
$$
即 
$$
\left\{(y,s)\Big| \|y\|_q\leq s \right\}\subseteq K^\ast
$$

必要性：

假设 $(y,s)\in K^\ast$, 有
$$
\left<y,x\right>+st\geq 0
$$

取 $\tilde x= \dfrac{x}{t}$ 进行单位化，因此

$$
\left<y,\tilde x\right>+s\geq 0
$$

$$
s\geq -\left<y,\tilde{x}\right>
$$
由球面的紧性
$$
s\geq \sup_{\|\tilde x\|_p\leq 1} -\left<y,\tilde x\right> = \|y\|_q
$$



### 对偶锥

> **对偶锥的性质**
>
> 设 $K$ 是一个锥，$K^*$ 是其对偶锥，则满足：
>
> - $K^*$ 是锥，即使 $K$ 不是锥，该结论也成立；
> - $K^*$ 始终是闭集和凸集；
> - 若 $\operatorname{int}K\neq\varnothing$，则 $K^*$ 是尖锥，即内部不含有直线；
> - 若 $K$ 是尖锥，则 $\operatorname{int}K^*\neq\varnothing$；
> - 若 $K$ 是适当锥，则 $K^*$ 也是适当锥；
> - 二次对偶锥 $K^{**}$ 是 $K$ 的闭凸锥包，即 $K^{**}=\operatorname{cl}\operatorname{cone}(\operatorname{conv}K)$。特别地，若 $K$ 是闭凸锥，则 $K^{**}=K$。



### 对偶不等式与广义对偶不等式

对于适当锥$K$ 定义偏序广义不等式
$$
\begin{dcases}
x\preceq_{K} y \Longleftrightarrow y-x \in K\\
x\prec_K y \Longleftrightarrow y-x \in \operatorname{int}K
\end{dcases}
$$

适当锥的对偶锥$K^*$ 也可以诱导出广义不等式
$$
\begin{dcases}
x\preceq_{K^*} y\Longleftrightarrow y-x \in K^*\\
x\prec_{K^*} y \Longleftrightarrow y-x \in \operatorname{int}K^*
\end{dcases}
$$
