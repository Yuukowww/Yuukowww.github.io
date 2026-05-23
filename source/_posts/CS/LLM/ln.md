---
title: On Layer Normalization in the Transformer Architecture
date: 2026-05-23
update: 2026-05-23
description: 层归一化位置与训练稳定性
categories: LLM
math: true
cover: picture/amiya1.jpg
---

# On Layer Normalization in the Transformer Architecture

本文介绍了Pre-LN, 将归一化层放置在残差分支，以降低训练初始状态的训练梯度爆炸的现象。通过Post-LN架构进行训练刚需Warm-up(即通过初始降低学习率的方式进行训练)， 本文提出的Pre-LN通过迁移LN层位置的方式降低了整体梯度的稳定性与相对大小。将模型从Warm-up 中解脱出来。 

## Layer Normalization 的作用

$$
\mathrm{LN}(x) = \gamma \odot \frac{x-\mu}{\sqrt{\sigma^2+\varepsilon}}+\beta
$$

其中 $\gamma, \beta$ 是可学习的参数。

整个 $\mathrm{LN}$层的作用可视为一个归一化与一个仿射变换作用，内层归一化可表示为
$$
\mathrm{Normal}: x\to \frac{x-\mu}{\sqrt{\sigma^2+\varepsilon}}
$$
归一化的 $\mathrm{Normal}(x)$变为期望$0$, 方差$1$的标准向量
$$
\begin{aligned}
\mathrm{Var}(\mathrm{Normal}(x)) &= \frac{\sigma^2}{\sigma^2+\varepsilon}\to 1 \\
\mathrm{E}(\mathrm{Normal}(x)) &= 0
\end{aligned}
$$

可学习的参数 $\gamma, \beta$ 能改变向量的整体期望与均值以增强 $\mathrm{LN}$ 层的调节能力。


## Pre-Layer Normalization 的 梯度爆炸现象与 Warm-up

Pre-LN 层的一次前向传播的公式
$$
\begin{dcases}
\tilde{x}_t = \mathrm{LN}(x_t+\mathrm{MHA}(x_t))\\
x_{t+1} = \mathrm{LN}(\tilde{x}_t+ \mathrm{FFN}(\tilde{x}_t))
\end{dcases}
$$

记
$$
J_{\mathrm{LN}}(x) = \frac{\partial \mathrm{LN}(x)}{\partial x}
$$
为 $\mathrm{LN}$层的Jacobian 矩阵
