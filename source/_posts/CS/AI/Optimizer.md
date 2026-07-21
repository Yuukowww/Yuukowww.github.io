---
title: Optimizer From SGD to Muon
date: 2026-07-15
update: 2026-07-15
description: 优化器与数学优化原理
categories: AI
tag: [AI,LLM,Optimizer]
cover: picture/ruri2.jpg
---

统一记 $g_t = \nabla_\theta \ell_t$

# SGD

SGD 满足
$$
\theta_{t+1} = \theta_t -\eta_t g_t
$$

传统意义上的SGD分为:
- Single Sample Gradient Descent -- 每个epoch选择一个样本进行梯度下降，这样会将模型局限在一个样本的拟合中，噪声大且梯度更新频繁。
- Batch Gradient Descent -- 每个epoch选择全体样本进行全量的均值计算与梯度下降，这样的计算量相对最大，但是效果最好

## Mini-Batch SGD

Mini-batch SGD 的 基本理念是随机取样小样本进行随机梯度下降，再均值合并损失。

通过取样区域进行随机梯度下降能保证对于取样空间的拟合效果比较好，对于mini batch有限覆盖整个训练集后对于整个训练集的训练效果都比较好，相对单样本随机梯度下降能降低单个样本梯度噪声的影响。

取样集合
$$
\mathcal{B}_t = \left\{i_1,\cdots, i_n\right\}
$$

$$
\mathcal{L}_{\mathcal{B}_t}(\theta) = \frac{1}{\mathcal{B}} \sum_{i\in \mathcal{B}}\ell_i(\theta)
$$

对应的梯度为
$$
g_t = \nabla_\theta \mathcal{L} = \frac{1}{\mathcal{B}}\sum_{i\in\mathcal{B}}\ell_t(\theta_t)
$$

梯度下降

$$
\theta_{t+1} = \theta_t - \eta g_t
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



