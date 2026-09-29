---
title: Optimizer From SGD to Muon
date: 2026-07-15
updated: 2026-07-22
description: 优化器与数学优化原理
categories: AI
tag: [AI,LLM,Optimizer]
cover: picture/ruri2.jpg
---



# SGD
参考苏剑林[@kexuefm-11196]

SGD 满足
$$
L(w+\Delta w)-L(w) =\left <g,\Delta w\right> = \nabla_wL(w)\cdot \Delta w
$$
此处度量是未确定的，后一个梯度的给出依赖于前者的度量的选择

## SGD的超球面优化

取单次优化Step移动步的范数范围为
$$
\rho(\Delta w) = \left<\Delta w,\Delta w\right> \leq \eta
$$
优化器的优化目标为
$$
\min_{\rho(\Delta w)\leq \eta}\left<g,\Delta w\right>
$$
由于目标优化为下降，梯度为负。取绝对值并归一化
$$
\Delta w = -\kappa\varphi,\,\rho(\varphi)=1
$$

$$
\max_{\kappa\in(0,\eta],\rho(\varphi)=1}\kappa\left<g, \varphi\right> = \max_{\rho(\varphi)=1}\left<g, \varphi\right>
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


