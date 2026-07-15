---
title: Optimizer From SGD to Muon
date: 2026-07-15
update: 2026-07-15
description: 优化器与数学优化原理
categories: AI
tag: [AI,LLM,Optimizer]
cover: picture/ruri2.jpg
---

统一记 $g_t = \nabla\mathcal{L}_t$

# SGD

SGD 满足
$$
\theta_{t+1} = \theta_t -\eta_t g_t
$$

## SGD-W

添加权重衰减因子$\lambda\geq0$
$$
\theta_{t+1} =(1-\eta_t\lambda)\theta_t-\eta_tg_t = \theta_t -\eta_t(g_t+ \lambda \theta_t)
$$

考虑 $L_2$ 正则化
$$
\tilde{\mathcal{L}}(\theta) = \mathcal{L}(\theta)+ \frac{\lambda }{2} \|\theta\|_2^2
$$

$$
\nabla \tilde {\mathcal{L}} = \nabla \mathcal{L} + \lambda \theta
$$
因此
$$
\theta_{t+1} = \theta_t - \eta_t \nabla \tilde{\mathcal{L}} = \theta_t - \eta_t(g_t+\lambda \theta_t)
$$

# Momentum

满足
$$
\begin{dcases}
\theta_{t+1} = \theta_t -\eta_t v_t\\
v_t = \beta v_{t-1}+g_t 
\end{dcases}
$$

动量更新具有类似 Markov 的“状态递推”结构，历史梯度被压缩在当前动量 $v_{t−1}$ 中。
$$
v_t = \sum_{j=1}^{t-1} \beta^{t-1-j}v_j
$$




