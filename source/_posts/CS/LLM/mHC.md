---
title: From ResNet to mHC
date: 2026-05-23
update: 2026-06-01
description: LLM的信息流范式
categories: LLM
math: true 
cover: picture/miku4.jpg
---

# Tensor Flow 的 演化历程

## Plain Chain
最原始的信息流就是层的复合，满足 $x_{l+1} = \mathcal{F}_{l}(x_l,\theta_l)$, 这样的深层网络的微分就是
$$
\frac{\partial x_{l+1}}{\partial x_0} = \prod_{i = 1}^l \frac{\partial \mathcal{F}_i}{\partial x_i}
$$
Gradient of Loss Function
$$
\frac{\partial \mathcal{L}}{\partial x_l} = \frac{\partial \mathcal{L}}{\partial x_L}\prod_{i=l}^{L-1}J_{\mathcal{F}_i}(x_i)
$$
Plain Chain 容易出现梯度消失或者梯度爆炸的现象。 随着梯度的模大于0或者小于0，指数发散(爆炸)或者收敛到0(消失)


## ResNet
$$
x_{l+1} = x_{l} + \mathcal{F}_{l}(x_l,\theta_l)
$$
将模型的更新量作为线性可加的残差，将整体的复合非线性映射变为了一个恒等映射+微小扰动量的形式。

![resnet](/picture/mHC/resnet.png)

# Manifold-Constrained Hyper-Connections



