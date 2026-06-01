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
整体的发展脉络分为四类
- 跨层深度连接 Depth Connection
- 同层广度连接 Width Connection
- 把层看成动力系统 Continuous-Implicit Flow
- 不同样本/token 走不同路径 Routing Connection 
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

## DenseNet

DenseNet在ResNet的Skip Connections的基础上,将加性结构换为高维嵌入, 每一层的输入都是前面所有层输出的Concat, 即
$$
x_{l+1} = \mathcal{F}_l(\mathrm{Concat}[x_0,\cdots,x_l])
$$

![densenet](/picture/mHC/densenet.png)
DenseNet的性能开销和维度爆炸无疑是相当恐怖的。在CV领域DenseNet取得了不错的效果，但是在LLM中，其结构无法合适的Scaling-Up

## Post-LN、Pre-LN及相关的衍生架构 -- 深度Transformer 中的 residual stream与稳定化
 {% post_link CS/LLM/ln %} 与 {% post_link CS/LLM/deepnet %} 对相关的架构进行了讨论。在ResNet的基础结构上，研究LayerNorm的位置对于整体训练的效果、收敛的速度与稳定性的优化

## Neural ODE

## Deep Equilibrium Model



# Hyper-Connections

# Manifold-Constrained Hyper-Connections



