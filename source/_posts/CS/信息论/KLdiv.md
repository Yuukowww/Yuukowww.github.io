---
title: KL散度、最大似然估计和VAE
date: 2026-09-14
updated: 2026-09-14
categories: information
tag: [AI,概率论,信息论]
description: KL散度及概率论背景
cover: picture/yuuko3.jpg
---
# 最大似然估计
对于一个由参数 $\theta$ 驱动的随机事件, 发生$n$次的样本满足独立同分布
$$
X_i\sim F(x;\theta)
$$

如何基于观测的$n$ 个样本的输出，求解对于一个优化度量意义下模型的最优参数 $\hat \theta$, 这是优化任务的目标。

似然函数定义为
$$
L(\theta\mid X_1,\cdots,X_n) = \prod_{i=1} f(X_i;\theta)
$$

$\theta$ 的最大似然估计 $\hat \theta$ 满足
$$
\hat{\theta} = \argmax_\theta \prod_{i=1}^nf(X_i\mid \theta)
$$

求导

$$
\ln L(\theta|X_1,\cdots,X_n) = \sum_{i=1}^n \ln f(X_i;\theta)
$$

$$
\frac{\partial}{\partial \theta}L(\theta|X_1,\cdots,X_n) =  \sum_{i=1}^n \frac{f_\theta'(X_i;\theta)}{f(X_i,\theta)} = 0
$$

如果方程存在解且不为边界，则 $\hat\theta$ 为最大似然估计，否则可能是满足的边界极值条件。


# 交叉熵和KL散度


