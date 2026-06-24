---
title: 二阶线性微分方程与Laplace变换
date: 2026-06-24
update: 2026-06-24
categories: 数学
tag: [ODE]
description: 常微分方程和控制理论的复习
cover: picture/ruri1.jpg
---
# 二阶常系数齐次线性微分方程的解结构

对于微分方程
$$
y'' + py' + qy = 0
$$

## 朴素换元法

令$u = y' - my$，代入原方程待定系数：

$$
u' - nu = (y'-my)' - n(y'-my) = y'' - (m+n)y' + mny = 0
$$

对比 $y'' + py' + qy = 0$，只需

$$
m+n = -p,\quad mn = q
$$

即 $m,n$ 是特征方程 $r^2+pr+q=0$ 的两个根。此时原方程化为：

$$
\begin{cases}
y' = my + u \\
u' = nu
\end{cases}
$$

$$
\frac{\mathrm{d}u}{\mathrm{d}t} = nu\Longrightarrow \ln u  = nt+ C\Longrightarrow u = C_1e^{nt}
$$

$$
\begin{aligned}
&\frac{\mathrm{d}y}{\mathrm{d}t}-my = C_1 e^{nt}\\
\Longleftrightarrow\,& \mathrm{d}y -my \mathrm{d}t = C_1 e^{nt}\mathrm{d}t\\
\Longleftrightarrow\,& \mathrm{d}\left(\frac{y}{e^{mt}}\right) = C_1 e^{(n-m)t}\mathrm{d}t\\
\Longleftrightarrow\,& y = C_1 e^{nt}+ C_2 e^{mt}
\end{aligned}
$$

其中方程
$$
\lambda^2 +p\lambda + q = 0
$$
为常微分方程的特征方程，根据韦达定理，两个根$m,n$ 为特征根，作为通解的指数基的幂次。


> **线性代数视角**：令 $X=\begin{pmatrix} y \\ y' \end{pmatrix}$，则 $X' = \begin{pmatrix} 0 & 1 \\ -q & -p \end{pmatrix} X$。换元 $u=y'-my$ 即坐标变换 $Z=\begin{pmatrix} y \\ u \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ -m & 1 \end{pmatrix}X$，将系统矩阵**上三角化**为 $\begin{pmatrix} m & 1 \\ 0 & n \end{pmatrix}$，实现逐步解耦：$u'=nu \;\to\; y'=my+u$。本质上就是算子因式分解 $(D-n)(D-m)y=0$。



