---
title: Transformer 中的 Layer Normalization与梯度稳定性
date: 2026-05-23
update: 2026-05-24
description: 层归一化位置与训练稳定性
categories: LLM
math: true
cover: picture/yuki2.jpg
---
# On Layer Normalization in the Transformer Architecture

本文介绍了Pre-LN, 将归一化层放置在残差分支，以降低训练初始状态的训练梯度爆炸的现象。通过Post-LN架构进行训练刚需Warm-up(即通过初始降低学习率的方式进行训练)， 本文提出的Pre-LN通过迁移LN层位置的方式降低了整体梯度的稳定性与相对大小。将模型从Warm-up 中解脱出来。

## Layer Normalization的作用

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

## Post-Layer Normalization 的 梯度爆炸与 Warm-up
本文对于Multi Head Attention 的梯度阶估计过程提出了一个简化计算的模型，再通过实验论证假设对于完整的MHA Residue Flow 也成立。

初始权重使用Xavier初始化，每个权重$w$满足
$$
\mathrm{Var}(w) = \frac{2}{n_{in}+n_{out}} 
$$


Post-LN 层的一次前向传播的公式
$$
\begin{dcases}
\tilde{x}^{post}_t = \mathrm{LN}(x^{post}_t+\mathrm{MHA}(x^{post}_t))\\
x^{post}_{t+1} = \mathrm{LN}(\tilde{x}^{post}_t+ \mathrm{FFN}(\tilde{x}^{post}_t))
\end{dcases}
$$
Pre-LN 层的一次前向传播的公式
$$
\begin{dcases}
\tilde{x}^{pre}_t = x^{pre}_t + \mathrm{MHA}(\mathrm{LN}(x^{pre}_t))\\
x^{pre}_{t+1} = \tilde{x}^{pre}_t+\mathrm{FFN}(\mathrm{LN}(\tilde{x}^{pre}_t))
\end{dcases}
$$

记
$$
J_{\mathrm{LN}}(x) = \frac{\partial \mathrm{LN}(x)}{\partial x}
$$
为 $\mathrm{LN}$层的Jacobian 矩阵

则Post-LN满足
$$
\begin{aligned}
\mathrm{d}\tilde{x}^{post}_t &= J_{\mathrm{LN}}(x^{post}_t+\mathrm{MHA}(x^{post}_t))\cdot (\mathrm{d} x^{post}_t+ \mathrm{d} \mathrm{MHA}(x^{post}_t))\\
&=J_{\mathrm{LN}}(x^{post}_t+\mathrm{MHA}(x^{post}_t))\cdot(I+J_{\mathrm{MHA}}(x^{post}_t)) \cdot \mathrm{d}x^{post}_t
\end{aligned}
$$
$$
\begin{aligned}
\mathrm{d} x^{post}_{t+1} = J_\mathrm{LN}(\tilde{x}^{post}_t+\mathrm{FFN}(\tilde{x}^{post}_t))\cdot (I+J_\mathrm{FFN}(\tilde{x}^{post}_t))\mathrm{d}\tilde{x}^{post}_t
\end{aligned}
$$
$$
\frac{\partial x^{post}_{t+1}}{\partial x^{post}_{t}} = J_\mathrm{LN}(\tilde{x}^{post}_t+\mathrm{FFN}(\tilde{x}^{post}_t))\cdot (I+J_\mathrm{FFN}(\tilde{x}^{post}_t))\cdot J_{\mathrm{LN}}(x^{post}_t+\mathrm{MHA}(x^{post}_t))\cdot(I+J_{\mathrm{MHA}}(x^{post}_t))
$$

Pre-LN满足
$$
\begin{aligned}
\mathrm{d} \tilde{x}^{pre}_{t} &= (I + J_{\mathrm{MHA}}(\mathrm{LN}(x^{pre}_t))\cdot J_{\mathrm{LN}}(x^{pre}_t))\mathrm{d}x^{pre}_t\\
\mathrm{d} x^{pre}_{t+1}&=(I + J_{\mathrm{FFN}}(\mathrm{LN}(\tilde{x}^{pre}_t))\cdot J_{\mathrm{LN}}(\tilde{x}^{pre}_t))\mathrm{d}\tilde{x}^{pre}_t
\end{aligned}
$$
$$
\frac{\partial x^{pre}_{t+1}}{\partial x^{pre}_t} = (I + J_{\mathrm{FFN}}(\mathrm{LN}(\tilde{x}^{pre}_t))\cdot J_{\mathrm{LN}}(\tilde{x}^{pre}_t))\cdot(I + J_{\mathrm{MHA}}(\mathrm{LN}(x^{pre}_t))\cdot J_{\mathrm{LN}}(x^{pre}_t))
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
其中 $W_{V,l}$ 是等效的随机矩阵
$$
W_{V,l} = \mathrm{Concat}(W_V^i)\cdot W_O 
$$
对应Jacobian矩阵为
$$
J_{\mathrm{MHA}} = \frac{1}{n}\bold{1}\bold{1}^T\otimes W_{V,l}
$$
残差梯度流为
$$
I+J_\mathrm{MHA} = I+\frac{1}{n}\bold{1}\bold{1}^T\otimes W_{V,l}
$$
### LN层Jacobian矩阵谱范数的阶估计

根据上文推导，需要计算LN层的Jacobian矩阵的大小。在此我们只考虑未仿射变换的归一化映射的梯度，因为仿射变换后只需要进行梯度的线性缩放。

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
&=\frac{\sqrt{n}}{\|y\|}\left(I-\frac{y_iy_j}{\|y\|^2}\right)(I- \bold{1}^T\bold{1})
\end{aligned}
$$
$$
\|J_\mathrm{LN}(x)\| = \mathcal{O}(\frac{\sqrt{n}}{\|y\|}) = \mathcal{O}(\frac{\sqrt{n}}{\|x\|})
$$

基于以上结果进行主定理的叙述

>**Definition 1.1**: 随机变量的 $(\varepsilon,\delta)$-Bounded
>
> 对于实随机变量 $Z\geq 0$, 如果$Z$满足
> $$
> \mathbb{P}\left(\frac{Z-\mu}{\mu}\leq \varepsilon\right) \geq 1-\delta
> $$
> 也即
> $$
> \mathbb{P}\left(\frac{Z-\mu}{\mu}\geq \varepsilon\right) \leq \delta
> $$
> 其中$\varepsilon > 0, 0<\delta <1$, 则称随机变量$Z$是 $(\varepsilon-\delta)$-Bounded

这个结论和Chebyshev不等式的结构相似, Chebyshev不等式能说明对方差有界随机变量都是 $(\varepsilon, \frac{\sigma^2}{\varepsilon^2})$-Bounded的

### 整体损失函数梯度谱范数
Post-LN架构的损失函数定义为顶部第$L$层的交叉熵
$$
\mathcal{L}(x^{post}_{L+1,i}) = -\log \mathrm{softmax}_{y_i} (W^{emb}x^{post}_{L+1,i}) = -\log(\mathbb{P}(\mathrm{Softmax}(W^{emb}x^{post}_{L+1,i})|\, y_i))
$$
Pre-LN架构尾部多一个LN块，损失函数为
$$
\mathcal{L}(x^{pre}_{final,i}) = -\log\mathrm{softmax}_{y_i}(W^{emb}x^{pre}_{final,i}) = -\log(\mathbb{P}(\mathrm{Softmax}(W^{emb}x^{pre}_{final,i})|\, y_i))
$$
其中
$$
x^{pre}_{final,i} = \mathrm{LN}(x^{pre}_{L+1,i})
$$
**Theorem 1.** 假设 $\|W^{post}_{L+1,i}\|$, $\|W^{pre}_{L+1,i}\|$ 均为$(\varepsilon,\delta)$-Bounded的。 则Post-LN与Pre-LN结构的梯度谱范数满足
$$
\begin{dcases}
\left\|\frac{\partial\tilde{\mathcal{L}} (x^{post}_{L+1})}{\partial W^{2,L}}\right\|_F= \mathcal{O}(d\sqrt{\ln d})\\[2em]
\left\|\frac{\partial\tilde{\mathcal{L}}(x^{pre}_{final})}{\partial W^{2,L}}\right\|_F=\mathcal{O}(d\sqrt{\frac{\ln d}{L}}) 
\end{dcases}
$$
其中 $W^{2,L}$ 是FFN中的参数矩阵

**Proof:**
由链式法则
$$
\begin{aligned}
\frac{\partial\tilde{\mathcal{L}} (x^{post}_{L+1})}{\partial W^{2,L}}&= \frac{\partial \tilde{\mathcal{L}}(x^{post}_{L+1})}{\partial x^{post}_{L+1}}\left(\prod_{k=l}^L\frac{\partial x^{post}_{k+1}}{\partial x^{post}_{k}}\right)\frac{\partial x^{post}_l}{W^{2,L}} 
\end{aligned}
$$
$\dfrac{\partial\tilde{L}}{\partial x^{post}_{L+1}}$ 是有界的，因为 $x^{post}_{L+1}$ 是 $(\varepsilon,\delta)$-Bounded的
$$
\left|\dfrac{\partial\tilde{L}}{\partial x^{post}_{L+1}}\right| = \left|\frac{\partial \mathbb{P}(\mathrm{Softmax}(W^{emb}x^{post}_{L+1}|y_i))}{\mathbb{P}(\mathrm{Softmax}(W^{emb}x^{post}_{L+1}|y_i))\cdot\partial x^{post}_{L+1}}\right|= \mathcal{O}(1)
$$
(此处略相关递推的阶估计，上文有相关Jacobian矩阵，只需进行估阶即可)关键在于
$$
\begin{dcases}
\text{Post-LN:}&\left\|J_{\mathrm{LN}}(x^{post}_{L+1})\right\|^2 = \mathcal{O}(\frac{n}{\|x^{post}_{L+1}\|^2}) = \mathcal{O}(1)\\[2em]
\text{Pre-LN:}&\left|J_{\mathrm{LN}}(x^{pre}_{final})\right\|^2 = \mathcal{O}(\frac{n}{\|x^{pre}_{final}\|^2}) = \mathcal{O}(\frac{1}{L}) 
\end{dcases}
$$
Theorem 1 的结论证明了：在初始化时刻，Post-LN 的梯度规模是常数阶，这意味着它与模型深度 $L$ 无关，无法感知并抑制深层带来的不稳定因素；而 Pre-LN 的梯度规模具有 $O(\frac{1}{\sqrt{L}})$ 的衰减性，能随着模型深度的增加降低初始梯度强度，减弱了对 warmup 的依赖。