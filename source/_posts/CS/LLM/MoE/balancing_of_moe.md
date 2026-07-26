---
title: φ - Balancing for Mixture-of-Experts Training
date: 2026-07-26
updated: 2026-07-26
categories: LLM
tag: [MoE, LLM]
description: 凸几何优化与专家负载均衡
cover: picture/koi1.jpeg
---

# φ - Balancing for Mixture of experts traning

MoE 总是倾向于每次Top-k 的 Experts 的负载均衡化.

每一个专家激活概率为 $p(x;\theta)_i$,$p(x;\theta) = \mathrm{Softmax}(W_rx)$,对应整体激活期望为
$$
\bar{p} (x;\theta) = \mathbb{E}_{x} [p(x;\theta)]\in \Delta^n,\qquad \sum_{i=1}^n \bar{p}(x;\theta)_i = 1
$$


目的是选择一个**凸的负载优化器** $\phi : \Delta^n \to \Delta^n$ 满足
$$
\argmin_m\phi(m) = \left(\frac{1}{n},\cdots, \frac{1}{n}\right)
$$

论文中给出了一系列凸优化器函数

![convex_optimation_function](/picture/moe/convex_opfun.png)

整体优化目标为
$$
\min_\theta [L_{task}(\theta) +\alpha \phi(\theta)] 
$$

$L_{task}$ 目标是对整体模型的任务优化，$\phi$ 用于控制模型的负载均衡化，通过超参数 $\alpha$ 进行目标侧重的控制。

## Fenchel 共轭

{% post_link math/Optimation/convex_set Fenchel共轭 %} 定义为
$$
L_{aux} := \phi(p) = \sup\left\{\left<p,q\right> - \phi^*(q)\right\}
$$

单独的均衡化优化为
$$
\min_\theta \max_q \left<m_\theta,q\right> - \phi^*(q)
$$


比如对于2 experts
$$
m = (\theta,1-\theta)
$$

假设 $L_{task}$ 的最优点为 $\theta = 0.6$ , Balancing 要求 $\theta = 0.5$

目标优化
$$
J(\theta) = 
(\theta-0.8)^2
+
\alpha(\theta-0.5)^2
$$

$$
\theta^* = \frac{1.6+\alpha}{2(1+\alpha)}
$$
$$
\lim_{\alpha\to +\infty} \theta^* = \lim_{\alpha\to+\infty}\frac{1.6+\alpha}{2+2\alpha} = 0.5
$$


整体的优化为
$$
\min_{\theta}\max_{q}[L_{task}(\theta)+\alpha (\left<m_\theta,q\right>-\phi^*(q))] = \min_{\theta}\max_{q}[L_{task}(\theta)+\alpha (\mathbb{E}_x\left< p(x;\theta),q\right>-\phi^*(q))]
$$

## Mini-batch 在线优化

取样一个mini-batch， 整体期望可以近似等于取样batch的均值

$$
\mathbb{E}_x\left<p(x;\theta),q\right> \simeq \frac{1}{|B_t|}\sum_{x\in B_t} \left<p(x;\theta_t),q\right> = \left<p_t,q\right>
$$

对于近似对象
$$
F_t(q) = \left<p_t,q \right> - \phi^*(q)
$$

$$
\nabla_q F_t(q) = p_t - \nabla_q\phi^*(q_t) 
$$
取对偶梯度为
$$
m_t := \nabla \phi^*(q_t)
$$
由Legendre对偶, 有
$$
q_t = \nabla\phi(m_t)
$$


### Mirror-ascent 与 Bregman 距离约束
Single batch 的一次共轭上升对象为
$$
F_t(q) = \left<p_t,q\right> - \phi^*(q)
$$

对其Taylor展开
$$
F_t(q) \simeq F_t(q_t) + \left<\nabla F_t(q_t), q-q_t\right>
$$
{% post_link math/Optimation/convex_set Bregman 距离 %} 作为距离惩罚项，其蕴含起点的平坦性信息与相对竖直距离的大小，在小范围内包含了二阶误差信息, 通过共轭函数生成Bregman距离惩罚

$$
\begin{aligned}
q_{t+1} &= \argmax_q\left\{F_t(q_t) + \left<\nabla F_t(q_t),q-q_t \right> -\frac{1}{\eta} D_{\phi^*}(q,q_t)\right\}\\
& = \argmax_q\left\{\left<\nabla F_t(q_t),q \right> -\frac{1}{\eta} D_{\phi^*}(q,q_t)\right\}
\end{aligned}
$$

在最优点 $q = q_{t+1}$ 有
$$
\nabla F_t(q_t)
-
\frac1\eta
\left[
\nabla\phi^*(q_{t+1})
-\nabla\phi^*(q_t)
\right]
=0
$$

即
$$
\nabla \phi^*(q_{t+1} ) = \nabla\phi^*(q_t) + \eta \nabla F_t(q_t) 
$$

整个优化动力系统表示为
$$
\begin{dcases}
m_{t+1} = m_t + \eta(p_t-m_t)\\
q_t = \nabla \phi(m_t)
\end{dcases}
$$

## StopGrad 



$$
L_{\mathrm{aux},t}
=
\left\langle
p_t(\theta),
\operatorname{StopGrad}(q_{t+1})
\right\rangle
=
\sum_{e=1}^{E}
p_{t,e}(\theta)
\operatorname{StopGrad}
\left(
\nabla\phi(m_{t+1})_e
\right).
$$



算法交替进行两个方向的更新：

$$
\begin{aligned}
q\text{-step}:&\quad
\text{固定 }\theta_t,\text{ 使用 mirror ascent 更新 }q_{t+1},\\
\theta\text{-step}:&\quad
\text{固定 }q_{t+1},\text{ 对 }\theta\text{ 做梯度下降}.
\end{aligned}
$$

因此在 $\theta$-step 中需要计算的是关于 $\theta$ 的偏导数：

$$
\nabla_\theta L_{\mathrm{aux},t}
=
\left(
\frac{\partial p_t}{\partial\theta}
\right)^\top q_{t+1}.
$$

$\operatorname{StopGrad}$ 并没有消除 $q_{t+1}$ 对路由器的影响。它只是阻止梯度继续穿过

$$
p_t
\longrightarrow
m_{t+1}
\longrightarrow
q_{t+1}
$$

这条对偶更新路径。

$q_{t+1}$ 仍作为每个 expert 的负载优化梯度：负载较高的 expert 具有更向均衡化的惩罚，最小化 $L_{aux}$ 会促使路由器减少分配给这些 expert 的概率。

如果不使用 StopGrad，那么由于

$$
q_{t+1}
=
\nabla\phi\left((1-\eta)m_t+\eta p_t\right),
$$

梯度还会包含由 $q_{t+1}$ 对 $p_t$ 的依赖产生的 Hessian 项：

$$
\nabla_{p_t}
\left[
p_t^\top\nabla\phi(m_{t+1})
\right]
=
q_{t+1}
+
\eta\nabla^2\phi(m_{t+1})p_t.
$$

若历史状态 $m_t$ 没有被截断，会形成跨训练步不断增长的计算图。

从包络定理也可以理解这一点：若 $q^*(\theta)$ 是内层最大化的精确解，则

$$
\nabla_\theta
\max_q \mathcal L(\theta,q)
=
\partial_\theta
\mathcal L(\theta,q^*(\theta)),
$$

计算外层梯度时不需要再对 $q^*(\theta)$ 关于 $\theta$ 求导。论文中的 $q_{t+1}$ 是对 $q^*(\theta_t)$ 的在线近似，StopGrad 保留了同样的交替优化结构。

