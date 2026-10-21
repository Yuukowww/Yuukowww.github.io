---
title: RLEngine 02 -- Verl 的基本算法实现
date: 2026-10-21
updated: 2026-10-2
categories: RL
tag: [RL,Infra]
description: verl的底层实现 -- GRPO、GAE等算法
cover: picture/kanade3.jpg
---


# KLController
`AdaptiveKLController`的实现[@ziegler2020finetuninglanguagemodelshuman]
对冻结的KL散度相对偏差率绝对值限制在0.2
$$
e =\mathrm{clip}\left( \frac{\mathsf{KL}_{cur}-\mathsf{KL}_{target}}{\mathsf{KL}_{target}}\right) \in[-0.2,0.2]
$$
用截断的参数$e$ 更新惩罚参数, $h$ horizon是调整的尺度
$$
\beta_{t+1} = \beta_t(1+e\frac{n_{step}}{h}) =\beta_t(1+K_\beta e_t)
$$

# Advantage Estimation
`compute_gae_advantage_return`的实现
{% post_link CS/AI/RL/Markov 单步TD误差%}
$$
\hat A\approx  \delta_t = r_t+\gamma V_{t+1}-V_t
$$
