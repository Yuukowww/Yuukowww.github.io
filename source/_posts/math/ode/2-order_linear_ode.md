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

考虑初值
$$
\begin{dcases}
y(0) = y_0\\
y'(0) = \dot{y}_0
\end{dcases}
$$
带入通解满足
$$
\begin{dcases}
C_1+C_2 = y_0\\
mC_1 +n C_2 = \dot{y}_0
\end{dcases}
$$
得
$$
\begin{dcases}
C_1 = \frac{ny_0 - \dot{y}_0}{n-m}\\
C_2 = \frac{my_0 - \dot{y}_0}{m-n}
\end{dcases}
$$

## Laplace Transform

进行Laplace 变换可得:
$$
\begin{aligned}
&-\dot{y}_0+s\mathcal{L}(y') + p\left[-y_0 +sY(s)\right] + qY(s) = 0\\
\Longleftrightarrow \,& -\dot{y}_0 + s(-y_0 + sY(s)) -py_0 +psY(s) +qY(s) = 0\\
\Longleftrightarrow \,&  Y(s)(s^2+ps+q)  = y_0s+py_0+\dot{y}_0
\end{aligned}
$$

$$
\begin{aligned}
Y(s) &= \frac{y_0s +py_0+ \dot{y}_0}{s^2+ps+q} \\
&= \frac{y_0s +py_0+ \dot{y}_0}{m-n} \left[ \frac{1}{s-m}- \frac{1}{s-n}\right]\\
& = \frac{1}{m-n} \frac{y_0(s-m)+py_0+\dot{y}_0+ my_0}{s-m} - \frac{1}{m-n} \frac{y_0(s-n)+py_0+\dot{y}_0+ ny_0}{s-n}\\
& = \frac{1}{m-n}\frac{py_0+\dot{y}_0+ my_0}{s-m} - \frac{1}{m-n} \frac{py_0+\dot{y}_0+ ny_0}{s-n}\\
\end{aligned}
$$

Laplace 逆变换得
$$
\begin{aligned}
y(t) &= \frac{py_0+\dot{y}_0+ my_0}{m-n} e^{mt} + \frac{py_0+\dot{y}_0+ ny_0}{n-m} e^{nt}\\
& = \frac{-n y_0 + \dot{y}_0}{m-n}e^{mt} + \frac{-my_0+\dot{y}_0}{n-m} e^{nt}
\end{aligned}
$$

这个结论和前文的直接换元的方法的结果是一致的

