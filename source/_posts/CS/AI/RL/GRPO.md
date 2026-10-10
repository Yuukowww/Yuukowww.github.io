---
title: CS336 02 -- RL
date: 2026-10-05
updated: 2026-10-05
categories: 强化学习
tag: [LLM,RL,CS336]
description: Assignment 5 强化学习, 围绕 PPO、GRPO和math RL
cover: picture/mika1.jpg
---

{% post_link CS/AI/RL/Markov Bellman方程 %}中提及Q函数的更新，一系列如QL、DQN的算法得到的策略是固定的。对于基于策略的强化学习，通过优化策略的本身而非策略的Q value，给定参数 $\theta$ 对策略参数化，并使用神经网络优化 $\theta$
# PPO -- Proximal Policy Optimization

我们的优化目标是
$$
\max_{\theta}J(\theta) = \max_\theta E_{\tau \sim \theta}R(\tau) = \max_{\theta}\sum_\tau P(\tau;\theta) R (\tau)
$$

$\tau$ 是agent的交互状态-动作轨迹, 为策略链上每一节状态和动作概率的乘积



$$
P(\tau;\theta) = \prod_{t=0}^T P(s_{t+1}|s_t,a_t)\pi_\theta(a_t|s_t)
$$

目标变为
$$
\max_{\theta}\sum_\tau P(\tau;\theta) R (\tau) = \max_{\theta}\sum_\tau\prod_{t=0}^T P(s_{t+1}|s_t,a_t)\pi_\theta(a_t|s_t)R(\tau)
$$
求导
$$
\begin{aligned}
\nabla_\theta\sum_\tau P(\tau;\theta) R (\tau) &=\sum_{\tau}\nabla_\theta P(\tau;\theta)R(\tau)\\
& = \sum_r R(\tau)P(\tau;\theta) \nabla_\theta \log P(\tau;\theta)\\
& = E_{\tau\sim \pi_\theta}R(\tau) \nabla_\theta \log P(\tau;\theta)\\
& = E_{\tau\sim \pi_\theta} R(\tau)\nabla_\theta\sum_{t=0}^T[\log P(s_{t+1}|s_t,a_t)+\log\pi_\theta(a_t|s_t)]\\
& = E_{\tau\sim \pi_\theta} R(\tau)\nabla_\theta\sum_{t=0}^T \log\pi_\theta(a_t|s_t)
\end{aligned}
$$
也就是一阶条件
$$
\nabla_\theta J(\theta) = E_{\tau\sim \pi_\theta} R(\tau)\nabla_\theta\sum_{t=0}^T \log\pi_\theta(a_t|s_t) = 0
$$
通过策略梯度更新的方式将 $\theta$ 逐步优化到最优的 $\hat\theta$ 上。

$$
\theta \gets \theta + \alpha \nabla_\theta J(\theta)
$$

梯度的样本近似, 取样$m$ 条轨迹, 使用样本均值近似样本期望
$$
\nabla _\theta J(\theta)\simeq \frac{1}{m}\sum_{k=1}^m R(\tau^{(k)})\nabla_\theta \log P(\tau^{(k)};\theta)
$$
根据上面的对数求导展开，并联合每一个样本轨迹的step 联合均值
$$
\begin{aligned}
\hat g= &\frac{1}{m}\sum_{k=1}^m R(\tau^{(k)})\nabla_\theta \sum_{t^{(k)}=1}^{T^{(k)}} \log \pi_\theta(a_{t^{(k)}}|s_{t^{(k)}})\\
\hat g_{step} = & \frac{1}{n}\sum_{k,t} R(\tau^{(k)}) \nabla \log \pi_\theta (a_{t^{(k)}}|s_{t^{(k)}})
\end{aligned}
$$
其中总step 数满足
$$
n = \sum_{k=1}^m T^{(k)}
$$
逐样本的梯度和逐step的梯度之间相差样本的step长度均值
$$
\hat g = \frac{n}{m} \hat g_{step}
$$


不同的策略 $\pi_\theta$ 决定了不同的梯度的计算方式。总结而言，RL关心的问题涵盖

| 关键问题 | 具体内容 |
|---|---|
| **任务与目标如何定义** | 状态、动作、奖励、终止条件、折扣因子；最大化什么回报 |
| **策略如何表示** | 使用什么策略分布；是否学习价值函数或环境模型 |
| **如何采样与探索** | 用哪种策略收集数据；如何探索；是否复用旧数据，是否需要重要性采样 |
| **如何评价动作** | 估计 \(V,Q,A\)；怎样把延迟奖励归因到之前的动作，即信用分配 |
| **如何估计梯度** | 用样本近似期望；控制估计的偏差与方差，例如 baseline、优势估计 |
| **如何稳定更新** | 学习率、度量与预条件、KL 约束或惩罚、PPO 概率比裁剪、梯度范数裁剪 |

## 常见的策略
{% post_link CS/AI/RL/Markov Agent策略 %} 中计算了，任何策略满足的条件只有对全动作空间的累积为 $1$ 。 对于离散动作空间
$$
\sum_{a\in \mathcal A_s} \pi_\theta(a|s) = 1
$$
连续动作空间
$$
\int_{a\in\mathcal A_s} \pi_\theta(a|s)\,\mathrm{d} a = 1
$$
### Softmax 策略
Softmax 自然有
$$
\displaystyle \sum_j\frac{e^{x_j}}{\sum e^{x_k}} = 1
$$
可以诱导出离散动作空间的Softmax策略

Softmax 策略定义为
$$
\pi_\theta (s,a) = \dfrac{e^{\phi(s,a)^T\theta}}{\displaystyle \sum_{a'\in\mathcal A_s} e^{\phi(s,a')^T\theta}}
$$

### 高斯策略

高斯策略是基于高斯分布生成的连续动作空间策略

$$
\pi_\theta(a|s) = \frac{1}{\sqrt{2\pi}\sigma_\theta} e^{-\frac{(a-\mu_\theta)^2}{2\sigma_m^2}}
$$
$$
\mu_\theta = \phi(s,a)^T\theta
$$

### Diffusion 策略

Diffusion 基于高斯策略通过 Normalizing Flow 生成更加复杂的分布

... To Be Continued


## TRPO


## PPO Penalty

## PPO-Clip

# GRPO -- Group Relative Policy Optimization

