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
\bar{p} (x;\theta) = \mathbb{E}_{x} [p(x;\theta)]\in \Delta^n， \sum_{i=1}^n \bar{p}(x;\theta)_i = 1
$$


目的是选择一个**凸的负载优化器** $\phi : \Delta^n \to \Delta^n$ 满足
$$
\argmin_m\phi(m) = \left(\frac{1}{n},\cdots, \frac{1}{n}\right)
$$

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
\nabla_q F_t(q) = p_t - \nabla_q\phi^*(q) 
$$
取对偶梯度为
$$
m_t := \nabla_q \phi^*(q)
$$

### Mirror-ascent 与 Bregman 距离约束
Single batch 的一次共轭上升对象为
$$
F_t(q) = \left<p_t,q\right> - \phi^*(q)
$$

对其Taylor展开
$$

$$







