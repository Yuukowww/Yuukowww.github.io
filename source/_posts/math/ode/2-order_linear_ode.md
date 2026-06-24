---
title: 二阶线性微分方程与Laplace变换
date: 2026-06-24
update: 2026-06-24
categories: 数学
tag: [ODE,控制]
description: 常微分方程和振动理论的复习
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



# 简谐振动

不含一阶项的二阶系统称为简谐系统
$$
m\ddot{x} +  k x = 0
$$

特征根为两个共轭虚根
$$
\lambda_{1,2} = \pm\sqrt{\frac{k}{m}} i
$$
因此通解结构为
$$
\begin{aligned}
x &= C_1e^{\sqrt{\frac{k}{m}}it} + C_2 e^{-\sqrt{\frac{k}{m}}it}\\
& = (C_1+C_2) \cos\left( \sqrt{\frac{k}{m}}t\right) - i(C_1-C_2) \sin \left(\sqrt{\frac{k}{m}}t\right)\\
& = A_1 \cos \lambda t + A_2 \sin \lambda t
\end{aligned}
$$

$\omega_n: = \lambda = \sqrt{\frac{k}{m}}$ 称为固有圆频率

$$
A_1 = x_0\quad A_2 = \frac{x'_0}{\lambda}
$$

因此
$$
\|x\| = \|A_1\cos\lambda t+ A_2\sin \lambda t\| = \sqrt{A_1^2+A_2^2} = \sqrt{x_0^2+\frac{x_0'^2}{\lambda^2}} = \sqrt{x_0^2+\frac{x_0'^2}{\omega_n^2}}
$$
$$
\arg x = \arctan \frac{A_1}{A_2} = \arctan \frac{\lambda x_0}{x_0'} = \arctan \frac{\omega_nx_0}{x_0'}
$$



## 线性阻尼系统

考虑线性阻尼$f = -cv = -c\dot{x}$, 牛顿第二定律改写为
$$
m\ddot{x} + c\dot{x} + kx = 0 \Longleftrightarrow \ddot{x}+\frac{c}{m}\dot x + \frac{k}{m}x = 0
$$

令 $ \omega_n = \sqrt\frac{k}{m}$, $\zeta = \frac{c}{2m\omega_n} = \frac{c}{2\sqrt{mk}}$, 则有
$$
\ddot{x} + 2\zeta \omega_n \dot x + \omega_n^2 x = 0
$$

$$
s_{1,2} = -\zeta\omega_n\pm \sqrt{\zeta^2-1} \omega_n
$$

根据$\zeta$ 和0，1 的相对关系，可以将二阶系统分为过阻尼/欠阻尼/负阻尼/临界阻尼等状态

Laplace 变换得
$$
X(s)(s^2+2\zeta\omega_n s+\omega_n^2)=0
$$


$$
s^2+2\zeta\omega_n s+\omega_n^2 = (s+\zeta\omega_n)^2+\omega_n^2(1-\zeta^2)
$$

欠阻尼情况下($0<\zeta <1$), 有
$$
s_{1,2} = -\zeta\omega_n \pm \omega_n \sqrt{1-\zeta^2}i
$$

因此对应的通解结构为
$$
x = Ae^{-\zeta\omega_n} \sin(\omega_n \sqrt{1-\zeta^2}t+\varphi)
$$

得到含线性阻尼的等效圆频率
$$
\omega_d = \omega_n \sqrt{1-\zeta^2}
$$

阻尼导致的系统稳定性由特征根的复平面分布相关

- $|\zeta|<1$, 特征根为复根， 此时系统为正弦震荡发散(不稳定)/正弦震荡收敛(稳定)曲线，根据指数项正负确定
- $|\zeta|>1$， 特征根为实根， 此时系统为指数发散或者指数收敛。$\zeta >1$时过阻尼单调衰减， $\zeta < -1$时，负阻尼单调发散

- $\zeta = 0$ 零阻尼系统，系统为标准正弦震荡
- $\zeta = 1$ 临界阻尼系统， 系统为指数单调衰减