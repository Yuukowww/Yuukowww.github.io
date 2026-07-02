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

令 $\omega_n = \sqrt\frac{k}{m}$, $\zeta = \frac{c}{2m\omega_n} = \frac{c}{2\sqrt{mk}}$, 则有
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

## 简谐激励的二阶系统响应

对于
$$
m\ddot{x} + c\dot{x} + kx = F_0 \sin \omega t
$$
特解总是 $\sin \omega t$ 和 $\cos \omega t$ 的线性组合， 可以假设特解为 $\tilde{x} = X\sin (\omega t-\varphi)$, 代入得

$$
X(k-m\omega^2)\sin (\omega t-\varphi) + c\omega X\cos (\omega t-\varphi) =  F_0\sin \omega t = F_0 \cos \varphi \sin(\omega t - \varphi)  + F_0 \cos \varphi \sin(\omega t -\varphi)
$$

$$
\left[X(k-m\omega^2)-F_0\cos\varphi\right]\sin(\omega t-\varphi) + \left[ c\omega X-F_0\sin\varphi\right] \cos(\omega t -\varphi) = 0
$$

$$
\begin{dcases}
F_0\cos\varphi = X(k-m\omega^2)\\
F_0\sin \varphi = c\omega X
\end{dcases}
\Longleftrightarrow F_0^2 = X^2\left(k-m\omega^2\right)^2+(c\omega)^2X^2
$$

特解的幅值
$$
X = \frac{F_0}{\sqrt{(k-m\omega^2)^2+(c\omega)^2}}
$$
相位滞后
$$
\varphi = \arctan \frac{c\omega}{k-m\omega^2}
$$


由于 $\omega_n^2 = \frac{k}{m}$, $2\zeta\omega_n = \frac{c}{m}$ 换元得
$$
\begin{dcases}
X = \frac{F_0}{k\sqrt{(1-(\frac{\omega}{\omega_n})^2)^2+ (2\zeta\frac{\omega}{\omega_n})^2}}\\
\varphi = \arctan \frac{2\zeta \frac{\omega}{\omega_n}}{1-\frac{\omega^2}{\omega_n^2}}
\end{dcases}
$$

特解为
$$
\tilde{x}(t) =  \frac{\frac{F_0}{k}}{\sqrt{(1-(\frac{\omega}{\omega_n})^2)^2+ (2\zeta\frac{\omega}{\omega_n})^2}}\sin \left(\omega t- \arctan \frac{2\zeta \frac{\omega}{\omega_n}}{1-\frac{\omega^2}{\omega_n^2}}\right)
$$

记 $\lambda = \frac{\omega}{\omega_n}$ 为频率比

当系统为静力激励时
$$
m\ddot x + c\dot x + kx = F_0
$$

特解
$$
X_0 = \frac{F_0}{k}
$$


其中 $\frac{F_0}{k}$ 称为零频率挠度， $\lambda = \frac{\omega}{\omega_n}$ 称为频率比

因此视相对静力激励的幅值放大称为幅值放大因子 $\beta = \frac{X}{X_0} = \dfrac{1}{\sqrt{(1-\lambda^2)^2+ (2\zeta\lambda)^2}}$ , 有

$$
\tilde{x} (t) = \beta X_0 \sin \left(\omega t - \arctan \frac{2\zeta\lambda}{1-\lambda^2}\right)
$$

## 任意周期激励的二阶系统响应
对于周期为 $T$ 的激励 $F(t)$, 满足
$$
m\ddot x+ c\dot x + kx  = F(t)
$$

记 $\omega_n = \dfrac{2\pi n}{T}$ 对输入周期信号Fourier展开
$$
F(t) = \sum_{-\infty}^{+\infty} c_n e^{i\omega_n t} = a_0  +  \sum_{n =1}^{+\infty} a_n \sin\omega_n t + \sum _{n=1}^{+\infty} b_n \cos \omega_n t 
$$

$$
a_n =\frac{1}{T}\int_{-\frac{T}{2}}^{\frac{T}{2}} F(t)\sin \omega_n t  \mathrm{d}t\quad b_n = \frac{1}{T}\int_{-\frac{T}{2}}^{\frac{T}{2}} F(t)\cos \omega_n t \mathrm{d}t
$$

特解满足
$$
x = x_0 + \sum_{n= 1}^{+\infty} (x_{c,n} + x_{s,n})
$$

且
$$
\begin{dcases}
m\ddot x_0 + c\dot x_0 + kx_0 = a_0\\
m\ddot x_{s,n} + c\dot x_{s,n} + kx_{s,n} = b_n\sin \omega_n t\\
m\ddot x_{c,n} + c\dot x_{c,n} + kx_{c,n} = b_n\cos \omega_n t

\end{dcases}
$$

## 阶跃激励下的二阶系统响应

考虑
$$
m\ddot {x} + c\dot x+ kx = \hat{F}\delta(t)
$$

Laplace 变换得
$$
(ms^2+cs+k)X(s) = \hat{F}
$$

$$
\begin{aligned}
X(s) &= \frac{\hat{F}}{ms^2+cs+k} \\
& = \frac{\hat{F}}{m} \frac{1}{s^2+2\zeta \omega_n s+\omega_n^2}\\
& = \frac{\hat{F}}{m} \frac{1}{(s+\zeta\omega_n)^2+\omega_n^2(1-\zeta^2)}\\
& = \frac{\hat{F}}{m(s_1-s_2)}\left[\frac{1}{s-s_1}-\frac{1}{s-s_2}\right]\\
x(t)& = \frac{\hat{F}}{2m\omega_n \sqrt{1-\zeta^2}i}( e^{s_1 t}- e^{s_2t})\\
& = \frac{\hat{F}}{m\omega_n \sqrt{1-\zeta^2}} e^{-\zeta\omega_nt} \sin \omega_n\sqrt{1-\zeta^2}t \\
& = \frac{\hat{F}}{m\omega_d} e^{-\zeta \omega_n t }\sin \omega_ d t
\end{aligned}
$$

记单位阶跃响应函数为
$$
h(t) = 
\begin{dcases}
\frac{1}{m\omega_d} e^{-\zeta \omega_m t}\sin \omega_d t & t > 0\\
0 & t\leq 0
\end{dcases}
$$

考虑阶跃点的平移

$$
m\ddot x+ c\dot x+ kx = \delta(t-t_0)
$$

$$
\begin{aligned}
X(s) & = \frac{e^{-t_0s}}{ms^2+cs+k}\\
& = \frac{1}{m(s_1-s_2) }\left[\frac{e^{-t_0s}}{s-s_1}- \frac{e^{-t_0 s}}{s-s_2}\right]\\
x(t)& = \frac{1}{m(s_1-s_2)} u(t-t_0) (e^{s_1(t-t_0)}-e^{s_2(t-t_0)})\\
& = \frac{u(t-t_0)}{m\omega_n \sqrt{1-\zeta^2}} e^{-\zeta\omega_n t} \sin \left[\omega_n \sqrt{1-\zeta^2}(t-t_0)\right]
\end{aligned}
$$

因此有
$$
h(t-t_0) = 
\begin{dcases}
\frac{1}{m\omega_ d} e^{-\zeta\omega_n t} \sin \omega_d(t-t_0)  &t> t_0\\
0 & t< t_0
\end{dcases}
$$

视非周期激励为逐点采样的力的激励和，那么激励函数表示为
$$
I(t) = (IF)(t) =  \int_0^{+\infty} F(\tau)\delta(t-\tau)\mathrm{d}\tau
$$
满足
$$
m\ddot x + c\dot x + kx = I(t)
$$

记算子
$$
L_t = m\frac{\mathrm{d}^2}{\mathrm{d}t^2} + c\frac{\mathrm{d}}{\mathrm{d}t} + k
$$

激励响应
$$
\begin{aligned}
\hat{x}(t) &= L_t^{-1} \int_0^{+\infty} F(\tau) \delta(t-\tau)\mathrm{d} \tau\\
& = \int_{0}^{+\infty} F(\tau) L_t^{-1} (\delta(t-\tau))\mathrm{d}\tau\\
& = \int_0^{+\infty}F(\tau) h(t-\tau)\mathrm{d}\tau\\
& = \frac{1}{m\omega_ d} \int_0^t F(\tau)  e^{-\zeta\omega_n t} \sin \omega_d(t-t_0) \mathrm{d}\tau
\end{aligned}
$$

系统响应为
$$
x(t) = \bar{x}(t) + \hat{x}(t) = e^{-\zeta \omega_n t }(A_1\cos \omega_dt + A_2 \sin \omega_d t) + \frac{1}{m\omega_ d}  \int_0^t F(\tau)  e^{-\zeta\omega_n t} \sin \omega_d(t-t_0) \mathrm{d}\tau
$$



## 二自由度自由振动

$$
\begin{dcases}
ml^2\ddot{\theta}_1 = -mgl\theta_1 + ka(\theta_2-\theta_1)a\\
ml^2\ddot{\theta}_2 = -mgl\theta_2 - ka(\theta_2-\theta_1)a\\
\end{dcases}
$$

改写
$$
\begin{bmatrix}
ml^2&0\\
0&ml^2
\end{bmatrix}
\begin{bmatrix}
\ddot \theta_1\\
\ddot \theta_2
\end{bmatrix}
 + \begin{bmatrix}
mgl+ka^2&-ka^2\\
-ka^2&mgl+ka^2
 \end{bmatrix}
 \begin{bmatrix}
 \theta_1\\
\theta_2
\end{bmatrix}
=
\begin{bmatrix}
0\\0
\end{bmatrix}
$$

取
$$
\theta_i = u_i f(\theta)\quad \lambda=-\frac{\ddot f(\theta)}{f(\theta)} = \omega^2
$$

即
$$
\begin{bmatrix}
-\omega^2ml^2+mgl+ka^2&-ka^2\\
-ka^2& -\omega^2ml^2 +mgl+ka^2
\end{bmatrix}
\begin{bmatrix}
\theta_1\\
\theta_2
\end{bmatrix}
=0
$$

非零解条件为
$$
\Delta (\omega^2) = \begin{vmatrix}
-\omega^2ml^2+mgl+ka^2&-ka^2\\
-ka^2& -\omega^2ml^2 +mgl+ka^2
\end{vmatrix} = 0
$$

展开得
$$
(mgl+ka^2-ml^2\omega^2)^2-(ka^2)^2 = 0
$$
$$
w^2_{1,2} = \frac{mgl+ka^2\mp ka^2}{ml^2} 
$$

$$
\begin{dcases}
r_1 = \frac{\theta_2^1}{\theta_1^1} = \frac{mgl+ka^2-\omega_1^2ml^2}{-ka^2} = \frac{-ka^2}{-\omega_1^2ml^2+mgl+ka^2} = 1 \\[2em]
r_2= \frac{\theta_2^2}{\theta_1^2} = \frac{mgl+ka^2-\omega_2^2ml^2}{-ka^2} = \frac{-ka^2}{-\omega_2^2ml^2+mgl+ka^2} =-1
\end{dcases}
$$

初值设定 $\theta_1(0) = \theta_0, \theta_2(0) = 0, \dot{\theta_1}(0)=\dot{\theta_2}(0) = 0  $

对应两个解状态有
$$
\begin{dcases}
\theta_1(t) =  \frac{\theta_0}{2}\cos \omega_1 t  + \frac{\theta_0}{2}\cos \omega_2 t\\[1em]
\theta_2(t) =  \frac{\theta_0}{2}\cos \omega_1 t  - \frac{\theta_0}{2}\cos \omega_2 t
\end{dcases}
$$


