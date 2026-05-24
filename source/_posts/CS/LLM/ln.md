---
title: Transformer 中的 Layer Normalization与梯度稳定性
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


## Post-Layer Normalization 的 梯度爆炸现象与 Warm-up
本文对于Multi Head Attention 的梯度阶估计过程提出了一个简化计算的模型，再通过实验论证这样的假设对于完整的MHA Residue Flow 也成立。

初始权重使用Xavier初始化，每个神经元权重$w$满足
$$
\mathrm{Var}(w) = \frac{2}{n_{in}+n_{out}} 
$$


Post-LN 层的一次前向传播的公式
$$
\begin{dcases}
\tilde{x}_t = \mathrm{LN}(x_t+\mathrm{MHA}(x_t))\\
x_{t+1} = \mathrm{LN}(\tilde{x}_t+ \mathrm{FFN}(\tilde{x}_t))
\end{dcases}
$$
Pre-LN 层的一次前向传播的公式
$$
\begin{dcases}
\tilde{x}_t = x_t + \mathrm{MHA}(\mathrm{LN}(x_t))\\
x_{t+1} = \tilde{x}_t+\mathrm{FFN}(\mathrm{LN}(\tilde{x_t}))
\end{dcases}
$$

记
$$
J_{\mathrm{LN}}(x) = \frac{\partial \mathrm{LN}(x)}{\partial x}
$$
为 $\mathrm{LN}$层的Jacobian 矩阵

则
$$
\begin{aligned}
\mathrm{d}\tilde{x}_t &= J_{\mathrm{LN}}(x_t+\mathrm{MHA}(x_t))\cdot (\mathrm{d} x_t+ \mathrm{d} \mathrm{MHA}(x_t))\\
&=J_{\mathrm{LN}}(x_t+\mathrm{MHA(x_t)})\cdot(I+J_{\mathrm{MHA}}(x_t)) \cdot \mathrm{d}x_t
\end{aligned}
$$
$$
\begin{aligned}
\mathrm{d} x_{t+1} = J_\mathrm{LN}(\tilde{x}_t+\mathrm{FFN}(\tilde{x}_t))\cdot (I+J_\mathrm{FFN}(\tilde{x}_t))\mathrm{d}\tilde{x}_t
\end{aligned}
$$


### MHA贡献的梯度流动
基于本文关于MHA的假定，有$W_Q = W_K = 0$, 因此单一Attention头的输出为
$$
\begin{aligned}
h &= \mathrm{Softmax}(\frac{QK^T}{\sqrt{d}})\cdot V\\
& = \mathrm{Softmax}(\bold{0}) \cdot X\cdot W_V\\
& = \frac{1}{n}X\cdot W_V\\
& = \frac{1}{n} \sum_{j=1}^n x^j w_{V}^j
\end{aligned}
$$
$$
\mathrm{MHA}(X) = \mathrm{Concat}(h_1,\cdots, h_n)\cdot W_O
$$

计算MHA的微分
$$
\begin{aligned}
\mathrm{d\,MHA}(X)&= \mathrm{d\,Concat}(h_1,\cdots, h_n)\cdot W_O+ \mathrm{Concat}(h_1,\cdots, h_n)\cdot \mathrm{d}W_O \\
& = \mathrm{Concat}(\mathrm{d}h_1,\cdots,\mathrm{d}h_n)\cdot W_O + \mathrm{Concat}(h_1,\cdots, h_n)\cdot \mathrm{d}W_O\\
& = \mathrm{Concat}(\mathrm{d}X \cdot W_V^i)\cdot W_O\\
& = \mathrm{d}X\cdot \mathrm{Concat}(W_V^i)\cdot W_O\\
& = \frac{1}{n}\sum_{j=i}^n\left(\mathrm{d}x^j\right)\cdot \mathrm{Concat}(W_V^i)\cdot W_O\\
& :=\frac{1}{n}\sum_{j=i}^n\left(\mathrm{d}x^j\right) W_{V,l}
\end{aligned}
$$
其中 $W_{V,l}^i$ 是等效的随机矩阵
$$
W_{V,l} = \mathrm{Concat}(W_V^i)\cdot W_O 
$$

### LN层Jacobian矩阵谱范数的阶估计

根据上文推导，计算一次训练的整体梯度下降需要评估LN层的Jacobian矩阵的大小。在此我们只考虑未仿射变换的归一化映射的梯度，因为仿射变换后只需要进行梯度的线性缩放。

$$
\mathrm{LN}(x) = \frac{x-\mu}{\sigma}
$$
取无偏向量
$$
y = x(I-\frac{1}{n}\bold{1}^T\bold{1}) = \begin{pmatrix}
x_1 - \frac{1}{n}\sum x_i\\[1em]
x_2 - \frac{1}{n}\sum x_i\\[1em]
\vdots\\[1em]
x_n - \frac{1}{n}\sum x_i
\end{pmatrix}
$$

其中
$$
\begin{aligned}
\|y\| &= \sqrt{\frac{1}{n}\sum_i (x_i-\mu)^2}\\
&=\sqrt{\frac{1}{n} \sum_i (x_i^2-2\mu x_i+\mu^2)}\\
& = \sqrt{\frac{1}{n}\sum_i x_i^2-\frac{2\mu}{n}\sum x_i + \mu^2}\\
&=\sqrt{\frac{1}{n}\sum_i x_i^2-\mu^2}
\end{aligned}
$$
有$\mathcal{O}(\|y\|) = \mathcal{O}(\|x\|)$

因此
$$
\mathrm{LN}(x) = \frac{y}{\sqrt{\frac{1}{n}\sum y_j^2}}
$$

$$
\begin{aligned}
\frac{\partial \mathrm{LN}(x)_i}{\partial y_j} & = \sqrt{n} \frac{\delta_{i,j} \sqrt{\sum y_j^2} - y_i\frac{y_j}{\sqrt{\sum y_j^2}}}{\sum y_j^2}\\
& = \frac{\sqrt{n}}{\|y\|}\left(\delta_{i,j} -\frac{y_iy_j}{\|y\|^2} \right)
\end{aligned}
$$


因此
$$
\begin{aligned}
J_{\mathrm{LN}}(x) &= \frac{\partial \mathrm{LN}(x)}{\partial y}\frac{\partial y}{\partial x}\\
&=\frac{\sqrt{n}}{\|y\|^2}\left(I-\frac{y_iy_j}{\|y\|}\right)(I- \bold{1}^T\bold{1})
\end{aligned}
$$
$$
\|J_\mathrm{LN}(x)\| = \mathcal{O}(\frac{\sqrt{n}}{\|y\|^2}) = \mathcal{O}(\frac{\sqrt{n}}{\|x\|^2})
$$