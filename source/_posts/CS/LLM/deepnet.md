---
title: DeepNet
date: 2026-05-24
updated: 2026-05-31
categories: LLM
description: Post-LN/Pre-LN的性能研究与极深 Transformer 的归一化函数设计
cover: picture/Kanami1.png
math: true
---
# DeepNet

本篇文章作为Transformer 中的 Layer Normalization与梯度稳定性的后继文章，进一步进行Layer Normalization的相关学习

## Warm-up 与初始化方式对于梯度下降稳定性的影响
在本节设置了三个实验组进行对比
- **对照组1:** Post-LN + 标准Xavier初始化 + No Warm-up
- **对照组2:** Post-LN + 标准Xavier初始化 + Warm-up
- **对照组3:** Post-LN + Xavier缩放初始化 + Warm-up

Xavier的缩放初始化是对于第 $l$ 层，$l\in[1,N]$, 有随着深度递减的缩放因子$k_l = N+1-l$, 使得
$$
W_o^l\sim \mathcal{N}(0,\frac{1}{k_l^2d'})
$$
![scaling_init](/picture/DeepNet/ScalingInit.png)

其采用的评估指标为整个模型各轮训练的输出更新的模, $\theta_i$ 表示第$i$轮训练后的参数, $\theta_0$ 表示初始化参数
$$
\|\Delta F_i\| = \|F(x,\theta_i)-F(x,\theta_0)\|
$$
在图4.a中，对照组1 的Model Update在初始步就出现了爆炸。这一结论和 {% post_link CS/LLM/ln %} 中的结论是一致的。

通过图3的子图对比，作者将Model Update 而非梯度模作为评估梯度下降稳定性的评估指标，因为在对照组2、3的对比中，对照组3的梯度模更大，但是具有更好的收敛效果。
## DeepNet 的结构

本文的主体创新点，即DeepNorm 架构。相对于Pre-LN,就是在主输入信号处增加了一个可学习参数 $\alpha>1$, 对输入tensor进行了放大。

![deepnet_architecture](/picture/DeepNet/DeepNet_architecture.png)




**Lemma 1.**: 对于 $X=(\mathbf{x}_1,\cdots,\mathbf{x}_n)\in \mathbb{R}^{n\times d}$, $\mathrm{Var}(\mathbf{x}_i) = 1, \mathbf{E}(\mathbf{x}_i) = 0$, $q_i\in [0,1]$, 则有
$$
\mathrm{Softmax}(q_1,\cdots, q_n)\cdot X \asymp \mathbf{x}_i
$$
这里的 $\asymp$ 表示 equal bound of magnitude，即只比较数量级上的上下界，而不要求两个向量在方向或逐元素取值上相同。
**Proof:**
$$
\begin{aligned}
\mathrm{Softmax}(q_1,\cdots, q_n) \cdot X &= \left(\frac{\exp{q_i}}{\sum \exp{q_j}}\right)_{i}\cdot \left(\mathbf{x}_1,\cdots ,\mathbf{x}_n \right)^T\\
&=\sum \frac{\mathbf{x}_i\exp q_i}{\sum\exp q_j}
\end{aligned}
$$
由于
$$
n\leq\sum \exp q_j\leq ne
$$
有
$$
\frac{1}{\sum \exp q_j} = \Theta\left(\frac{1}{n}\right)
$$
因此可以写成凸集的形式
$$
\mathrm{Softmax}(q_1,\cdots,q_n)X
= \sum_{i=1}^n w_i\mathbf{x}_i,
\quad
w_i=\frac{\exp{q_i}}{\sum \exp q_j}=\Theta\left(\frac1n\right).
$$

因此，由 $w_i=\Theta\left(\frac1n\right)$ 可得
$$
\sum_{i=1}^n w_i\mathbf{x}_i
\asymp
\sum_{i=1}^n \frac1n\mathbf{x}_i .
$$
又因为每个 $\mathbf{x}_i$ 都满足 $\mathbf{E}(\mathbf{x}_i)=0$ 且 $\mathrm{Var}(\mathbf{x}_i)=1$，所以所有 $\mathbf{x}_i$ 具有相同的 magnitude bound。于是 $n$ 个同阶向量经过 $\frac1n$ 量级的权重加权求和后，其输出仍然具有与单个 $\mathbf{x}_i$ 相同的 magnitude bound，即
$$
\sum_{i=1}^n \frac1n\mathbf{x}_i \asymp \mathbf{x}_i .
$$
因此
$$
\mathrm{Softmax}(q_1,\cdots,q_n)X
= \sum_{i=1}^n w_i\mathbf{x}_i
\asymp \mathbf{x}_i .
$$

Lemma 1对Attention输出头的阶进行了估计，保证了输入和输出的阶是相等的，Attention不会导致Model Update发生爆炸

**Lemma 2** 方差的阶的可加性
$$
\mathrm{Var}(X+Y)\asymp \mathrm{Var}(X) + \mathrm{Var}(Y)
$$
**Proof:**
展开得
$$
\begin{aligned}
\mathrm{Var}(X+Y) &= \mathbb{E}[(X+Y)^2] - [\mathbb{E}(X+Y)]^2\\
& = \mathbb{E}(X^2) - \mathbb{E}^2(X) +\mathbb{E}(Y^2) - \mathbb{E}^2(Y) +2\mathbb{E}(XY) - \mathbb{E}(X)\mathbb{E}(Y)\\
& = \mathrm{Var}(X) +\mathrm{Var}(Y)+2\mathrm{cov}(X,Y)
\end{aligned}
$$


**Theorem 1** 对于$N$层DeepNet结构 $F(x,\theta)$ , 每一层的DeepNet可表示为 $x_{l+1} = f(x_l,\theta_l) = \mathrm{LN}(\alpha x_l+G_{\theta_l}(x_l))$, $\theta_i\in \left\{\theta_1,\cdots,\theta_{2N}\right\}$

其中奇数参数是Selt-Attention的参数权重，偶数参数是FFN的参数权重。则有
$$
\|\Delta F\|\leq \sum_{i=1}^n \frac{\sqrt{v_i^2+w_i^2}}{\alpha}\|\theta^*_i-\theta_i\|
$$

基于最简化的情况，Self-Attention Layer 与 FFN layer 都视为 $G_\theta(x_l) \asymp v_lw_lx_l$, 则每一个Layer的递推输出为
$$
\begin{aligned}
x_{l+1} = f(x_l,\theta_l) &= \frac{\alpha x_l+G_{\theta_l}(x_l)}{\sqrt{\mathrm{Var}(\alpha x_l+G_{\theta_l}(x_l))}}\\
& \asymp \frac{(\alpha+v_lw_l)x_l}{\sqrt{(\alpha^2+v_l^2w_l^2)\mathrm{Var}(x_l)}}\\
\end{aligned}
$$
根据Lemma 1, $\mathrm{Var}(x_l) \asymp \mathrm{Var}(x_0) = 1$, 故
$$
x_{l+1} = f(x_l,\theta_l) \asymp \frac{\alpha+v_lw_l}{\sqrt{\alpha^2+v_l^2w_l^2}}x_l
$$

因此
$$
\frac{\partial f_l}{\partial x_l} \asymp \frac{\alpha+v_lw_l}{\sqrt{\alpha^2+v_l^2w_l^2}}
$$
视 $\theta_l = (v_l,w_l)$
$$
\frac{\partial f_l}{\partial \theta_l} \asymp \frac{\alpha x_l(\alpha -v_lw_l)}{(\alpha^2+v_l^2w_l^2)^{\frac{3}{2}}} \left(w_l,v_l\right)
$$

因此可展开Layer Model Update
$$
\begin{aligned}
\|\Delta F\| &= \|f(x_{2N}^*,\theta_{2N}^*)-f(x_{2N},\theta_{2N})\|\\
& = \|\frac{\partial f}{\partial x_l}(x_{2N},\theta_{2N})(x^*_{2N}-x_{2N}) +\frac{\partial f}{\partial \theta_l}(x_{2N},\theta_{2N})(\theta_{2N}^*-\theta_{2N})\|\\
&\leq \|\frac{\partial f}{\partial x_l}(x_{2N},\theta_{2N}) \|  \|x^*_{2N}-x_{2N}\| +\|\frac{\partial f}{\partial \theta_l}(x_{2N},\theta_{2N})\|\|\theta_{2N}^*-\theta_{2N}\|\\
&\asymp \frac{\alpha+v_{2N}w_{2N}}{\sqrt{\alpha^2+v_{2N}^2w_{2N}^2}}\|x^*_{2N}-x_{2N}\|+ \frac{\alpha x_{2N}(\alpha -v_{2N}w_{2N})}{(\alpha^2+v_{2N}^2w_{2N}^2)^{\frac{3}{2}}} \|\left(w_{2N},v_{2N}\right)\|\|\theta_{2N}^*-\theta_{2N}\||\\
&\leq \|x^*_{2N}-x_{2N}\|+\frac{\alpha x_{2N}(\alpha -v_{2N}w_{2N})}{(\alpha^2+v_{2N}^2w_{2N}^2)^{\frac{3}{2}}} \sqrt{w_{2N}^2+v_{2N}^2}\|\theta_{2N}^*-\theta_{2N}\|\\
&\asymp \|x^*_{2N}-x_{2N}\|+\frac{\sqrt{w_{2N}^2+v_{2N}^2}}{\alpha}\|\theta_{2N}^*-\theta_{2N}\|\
\end{aligned}
$$

递推得
$$
\|\Delta F\|\leq\sum_{i=1}^{2N}\frac{\sqrt{w_{i}^2+v_{i}^2}}{\alpha}\|\theta_{i}^*-\theta_{i}\|
$$
由于每一个$w_i,v_i$ 的初始化都与scaling factor $\beta$ 相关， 因此整个Model Update  的 Bound 能通过 $\alpha, \beta$ 控制，我们能通过设计这两个值的大小实现稳定训练Deeper的Network且保证收敛
