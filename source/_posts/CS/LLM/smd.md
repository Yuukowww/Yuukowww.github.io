---
title: Spherical motion dynamic -- 球面动力学
date: 2026-05-17
update: 2026-05-17
description: 论文笔记
categories: LLM
math: true
cover: picture/kasuga3.jpg
---
# Spherical motion dynamic
本文主要介绍了归一化神经网络在训练中，在 Weight Decay 的约束下，**权重范数（Weight Norm）和角度更新步长（Angular Update）** 会以线性速率收敛到由超参数决定的平衡态值。

## 基本假设

> **Hypothesis 1.** 稳定性假设
>
> - 学习率远小于1 $\eta \ll 1$
> - 达到**稳定态**时(即权重范数收敛时)， 有 $\|w_{t}\|\simeq\|w_{t+1}\|$


> **Scaling-Invarient**
>
> $$
> \forall k, \mathcal{L}(kw) = \mathcal{L}(w)
> $$
> 基于这个假设可以得到两个基本性质



**Property 1.** 权重方向与Loss的梯度向量的方向正交
$$
\left<w_t,\nabla_{w}\mathcal{L}(w_t) \right> = 0
$$
**Proof:**
由于Scaling-Invarient Property, $f(k) = \mathcal{L}(kw)$是关于$k$ 的常函数，则
$$
\frac{\mathrm{d} \mathcal{L}(kw)}{\mathrm{d} k } =\sum_{j}\frac{\partial \mathcal{L}(kw)}{\partial w_i}\frac{\mathrm{d}(kw_i)}{\mathrm{d}k} = \sum_i \frac{\partial \mathcal{L}(kw)}{\partial w_i} \cdot w_i = \left<w,\nabla_w\mathcal{L}(w)\right> = 0
$$
对于任何$w = w_t$均成立

**Corollary 1.** 没有Weight Decay的优化器的权重范数是严格增的

**Proof:**
$$
\begin{aligned}
\|w_{t+1}\|^2&=\|w_t-\eta \nabla_w\mathcal{L}(w)\|^2\\
&= \|w_t\|^2 +\|\eta\nabla_w\mathcal{L}(w)\|^2 -\eta\left<w_t,\nabla_w\mathcal{L}(w)\right> \\
&=\|w_t\|^2 +\|\eta\nabla_w\mathcal{L}(w)\|^2 \geq  0 
\end{aligned}
$$
这说明如果没有Weight Decay, 优化器在有限步梯度下降中难以实现权重范数收敛



**Property 2.** Gradient Homogeneity
$$
\nabla_{kw}\mathcal{L}(kw) = \frac{1}{k} \nabla_w \mathcal{L}(w)
$$
**Proof:**
$$

\nabla_w \mathcal{L}(w) = \nabla_w\mathcal{L}(kw) = \left(\frac{\partial \mathcal{L}(kw)}{\partial w_i}\right)_{i\leq n} = k\left(\frac{\partial \mathcal{L}(kw)}{\partial (kw_i)}\right)_{i\leq n} =k\nabla_{kw}\mathcal{L}(kw) 
$$
即
$$
\nabla_{kw}\mathcal{L}(kw) = \frac{1}{k} \nabla_w \mathcal{L}(w)
$$
或者记为
$$
\nabla \mathcal{L}(kw) = \frac{1}{k}\nabla\mathcal{L}(w)
 $$



## 分析对象

本文主要的分析对象是优化器的梯度与优化前后的向量夹角。做如下定义

**Definition 1.** SGD的归一化梯度与归一化学习率

这个的计算需要基于向量的模长已经收敛的假设，即 $\|w_{t+1}\| \simeq \|w_t\|$

对于最朴素的随机梯度下降，有
$$
w_{t+1} = w_t - \eta \nabla_w\mathcal{L}(w_t):=w_t - \eta\cdot  g_t
$$

取归一化向量梯度下降$\tilde{w_t} = \dfrac{w_t}{\|w_t\|}$, 根据**Property2**与模长收敛 , 有
$$
\tilde{w}_{t+1} = \tilde{w}_{t} - \frac{\eta}{\|w_t\|} \nabla_w \mathcal{L}(w_t) = \tilde{w}_t - \frac{\eta}{\|w_t\|^2} \nabla\mathcal{L}(\tilde{w}_t):= \tilde{w}_t -\frac{\eta}{\|w_t\|^2}\cdot \tilde{g}_t
$$
记
$\eta_{err} = \dfrac{\eta}{\|w_t\|^2}$ 为修正后的学习率

**Definition 2。** 夹角更新量
$$
\Delta_t = \arccos \left(\frac{\left< w_t,w_{t+1}\right>}{\|w_t\|\|w_{t+1}\|}\right)
$$
对于充分小的学习率$\eta$且 $\|w_t\|\simeq \|w_{t+1}\|$时，有
$$
\Delta_t = \frac{\|\eta\cdot g_t\|}{\|w_t\|} = \frac{\eta}{\|w_t\|}\nabla\mathcal{L}(w_t)
$$


## Core Concept

**Theorem 1.** SGD 的稳定态

考虑带WD的SGD
$$
w_{t+1} = w_{t} - \eta(g_t+\lambda w_t)
$$
取模得
$$
\begin{aligned}
\|w_{t+1}\|^2 &= \|w_t\|^2 +\eta^2 \|g_t+\lambda w_t\|^2 - 2\eta w_t(g_t+\lambda w_t)\\
& = \|w_t\|^2 +\eta^2\|g_t\|^2 + \eta^2\lambda^2 \|w_t\|^2 -2\eta\lambda \|w_t\|^2\\
& = \left(1-\eta\lambda \right)^2\|w_t\|^2 +\frac{\eta^2\|\tilde{g}_t\|^2}{\|w_t\|^2}
\end{aligned}
$$

取$x_t = \|w_t\|^2$, 此时需要一个 $\|\tilde{g}_t\|^2$ 的下界保证 $\|\tilde{g}_t\|^2> l$, 以保证分子为$t$无关的常数，则
$$
x_{t+1} \geq (1-2\eta\lambda)x_t + \frac{\eta^2 l}{x_t}
$$
对于递推
$$
x_{t+1} \geq Ax_t + \frac{B}{x_t}\quad A>0,B>0
$$
正不动点为
$$
x^* = Ax^* + \frac{B}{x^*}
$$
即
$$
x^* = \sqrt{\frac{B}{1-A}}
$$
对于充分大的$t$， 有
- $\forall t,x_t< x^*$
则
$$
\begin{aligned}
x^* -x_{n+1}&\leq x^* -Ax_n -\frac{B}{x_n}\\ 
& = x^* -Ax_n - \frac{(1-A)x^{*2}}{x_n}\\
& = x^* -x_n +(1-A)x_n -\frac{(1-A)x^{*2}}{x_n}\\
& = (x^*-x_n)  \left(1-\frac{(1-A)(x_n+x^*)}{x_n}\right)\\
& = (x^*-x_n) \left(A -\frac{(1-A)x^*}{x_n} \right)\leq A(x^*-x_n)
\end{aligned}
$$
因此
$$
x_t \geq x^* - A^{t-1}|x^*-x_1|
$$
- $\exists t, x_t> x^*$

$$
x_t>x^*> x^* - A^{t-1}|x^*-x_1|
$$

因此SGD 的不动点为
$$
x^* = \sqrt{\frac{\eta l }{2\lambda}} 
$$
即
$$
\|w_t\| = \sqrt[4]{\frac{\eta l }{2\lambda}}
$$
且对于某个充分大的$t_0, \,t>t_0$时有
$$
x_t > \sqrt{\frac{\eta l}{2\lambda}} - (1-2\eta\lambda)^{t-1}\left|\sqrt{\frac{\eta l}{2\lambda}} - x_1\right|
$$

