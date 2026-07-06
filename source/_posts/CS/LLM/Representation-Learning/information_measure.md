---
title: Encoder-Decoder structure with Information Measures
date: 2026-07-04
update: 2026-07-04
categories: LLM
description: Encoder-Decoder架构的表征学习，信息损失的互信息量化
tag: [Representation Learning, Encoder-Decoder Structure]
cover: picture/shinku3.jpg
tikzjax: true
---
# Encoder-Decoder Structures in Machine Learning Using Information Measures

本文主要展示的是如何通过信息度量(在本文中使用的是互信息度量) 经历 Encoder 后的信息变化



## 基本数学量定义

**最小错误概率 Minimum Probability of Error** 用于刻画对于一个预测任务关系$r: X\to Y$ 的预测损失。$\mathcal{F}(X,Y)$ 表示预测映射集。 最小错误概率定义为

$$
\ell (\mu_{X,Y}) := \min_{r\in \mathcal{F}(X,Y)} \ell (r)
$$
其中
$$
\ell(r) := p(r(X)\neq Y) =\mu_{X,Y} (\left\{(x,y)|r(x)\neq y\right\})
$$

即预测映射中预测效果最优的预测映射的错误概率


**互信息 Mutual Information**

$$
\begin{aligned}
\mathcal{I}(X;Y) = D_{KL}(P_{(X,Y)}\parallel P_X \otimes P_Y) &= \sum_{y\in Y}\sum_{x\in X}p(x,y)\log \frac{p(x,y)}{p(x)p(y)}\\
& = \sum_{y\in Y}\sum_{x\in X}p(x,y)\log p(x,y) -  \sum_{y\in Y}\sum_{x\in X} p(x,y) \log p(x) - \sum_{y\in Y}\sum_{x\in X} p(x,y) \log p(y)\\
& = -H(X,Y) -\sum_{x\in X}\left(\sum_{y\in Y}p(x,y)\right)\log p(x)-\sum_{y\in Y}\left(\sum_{x\in X}p(x,y)\right)\log p(y)\\
& =-H(X,Y) -\sum_{x\in X}p(x)\log p(x)-\sum_{y\in Y}p(y)\log p(y)\\
& = H(X) +H(Y)-H(X,Y) 
\end{aligned}
$$

其中 $H(X),H(Y),H(X,Y)$ 分别表示$X,Y$ 的边缘熵与联合熵, $H(Y\mid X)$ 是条件熵

$$
\mathcal{I}(X;Y)=\mathcal{I}(\mu_{X,Y}) = H(Y) + H(X)-H(X,Y) = H(Y) -H(Y\mid X)
$$

**Definition1**: **Information Sufficient**


Encoding映射 $\eta :X\to \mathcal{U}$ 满足
$$
\mathcal{I}(\mu_{X,Y}) = \mathcal{I}(\mu_{\eta(X),Y})
$$

称这样的$\eta$ 为Information Sufficient, 相对于预测$Y$ ，Encoding映射将输入空间映射到隐空间 $\mathcal{U}$ 不损失信息。

Encoding-Decoding 映射结构
$$
X\overset{\eta}{\longrightarrow}\mathcal{U}\overset{r}{\longrightarrow}Y
$$


这样的 $\eta$ 同样满足
$$
\ell(\mu_{X,Y}) =\ell(\mu_{\eta(X),Y}) 
$$

由于
$$
\ell(\mu_{X,Y} ) = \min_{r\in\mathcal{F}(X,Y)} \ell (r) = \min_{r\in\mathcal{F}(X,Y)} p(r(X)\neq Y)
$$
对于符合的 $r^\ast_X = r^\ast_\mathcal{U}\circ \eta$, 有
$$
p(r^\ast_X(X),Y)=p(r^\ast_\mathcal{U}(\eta(X)),Y)
$$


```tikz
\usepackage{tikz-cd}
\begin{document}
\begin{tikzcd}
	X && {\mathcal{U}} && Y
	\arrow["\eta"', from=1-1, to=1-3]
	\arrow["{r_X^\ast}", bend right=35, from=1-1, to=1-5]
	\arrow["{r_\mathcal{U}^\ast}"', from=1-3, to=1-5]
\end{tikzcd}
\end{document}
```

根据互信息IS
$$
\begin{aligned}
I(X;Y) = I(U;Y)
\end{aligned}
$$

根据链式法则二次算
$$
\begin{dcases}
I(X,U;Y) = I(U;Y) + I(X;Y\mid U)\\
I(X,U;Y) = I(X;Y) + I(U; Y\mid U) = I(X;Y)
\end{dcases}
$$
因此
$$
I(X;Y)-I(U;Y) = I(X;Y\mid U) = 0
$$

即
$$
p(x,y\mid u) = p(x\mid u)p(y\mid u) \quad a.e.
$$

这一点等价于论文中的**Lemma2**, 当且仅当$X,Y$ 相对$U$ 独立时， Encoding $\eta$ 是IS的

根据互信息IS

$$
\frac{p(x,y)}{p(x)p(y)}=\frac{p(u,y)}{p(u)p(y)}
$$

$$
p(y\mid x) = p(y\mid u)
$$

于是
$$
\begin{aligned}
\ell (\mu_{X,Y} ) &=1 -E_X(\max_{y\in Y}p(y\mid X))\\
& = 1-E_U(\max_{y\in Y}p(y\mid U))\\
&= \ell (\mu_{U,Y})
\end{aligned}
$$


## Encoder-Decoder Structure

![encoder-decoder](/picture/CS/information_measure/encoder-decoder-structure.png)

本文的PartA 旨在研究具有IS特性的隐空间时，Encoding-Decoding 的函数特征

**Definition 2**
$\mathcal{P}_\eta(X,Y)$ 定义为对于给定的 $\eta$， 满足 $X\to \eta(X)\to Y$ 的 $\mu_{X,Y}$ 是IS的Encoder-Decoder

**Definition 3**
后验概率 $$p_\mu(x) = \mu_{Y\mid X}(\cdot \mid x): X\to \Delta (Y)$$

将输入向量 $x$ 映射为输出的概率分布
$$
x\overset{p_\mu}{\longrightarrow}\left(p(Y=y_1\mid X=x),\cdots,p(Y=y_n\mid X=x)\right)
$$

**Theorem1** 
对于给定可测函数 $\eta: X\to \mathcal{U}$,  $\mu_{X,Y}\in\mathcal{P}_\eta(X,Y)$ 当且仅当 存在 $f:[0,1]\times\mathcal{U}\to Y$, 
$$
Y = f(W,\eta(X))\quad a.e.
$$
$W\sim \mathrm{Unif}[0,1]$ 是与 $X$ 无关的外部随机变量。

$$
X\overset{\eta}{\longrightarrow}\mathcal{U}\overset{\kappa}{\longrightarrow}\Delta(Y)\overset{\text{sample by }W}{\longrightarrow}Y
$$

其中 $\Delta(Y)$ 是标签空间 $Y$ 上的概率单纯形，$\kappa(u)=\mu_{Y\mid U}(\cdot\mid u)$ 是隐空间上的 soft decoder。随机变量 $W$ 的作用不是将 one-hot 输出转成概率，而是在给定概率分布 $\kappa(u)\in\Delta(Y)$ 后，从该分布中采样出实际标签 $Y$。

Theorem1 可以从两个层次理解：

1. **Hard-label 决策层面的下降**

    如果输入空间上的 Bayes 最优分类器 $r_X^\ast:X\to Y$ 在 $\eta$-fiber 上常值，即
    $$
    \eta(x)=\eta(x')\Rightarrow r_X^\ast(x)=r_X^\ast(x'),
    $$
    那么 $r_X^\ast$ 可以下降到隐空间 $\mathcal U$ 上，存在 $r_\mathcal U^\ast:\mathcal U\to Y$，使得
    $$
    r_X^\ast=r_\mathcal U^\ast\circ\eta\quad \mu_X\text{-a.s.}
    $$
    这表示每个 $\eta$-fiber 都完全落在某个 Bayes decision region 内部，encoder 没有把最优类别不同的输入压到同一个 latent point。因此，在 $0$-$1$ loss / hard-label 分类意义下，encoder-decoder 结构不会损失最优分类能力。

2. **Information-sufficient 结构**

    当 $\eta$ 是 IS 时，完整后验分布在 $\eta$-fiber 上常值，即
    $$
    \mu_{Y\mid X}(\cdot\mid x)=\mu_{Y\mid U}(\cdot\mid \eta(x))\quad \mu_X\text{-a.s.}
    $$
    因而 posterior map 可以通过隐空间分解：
    $$
    p_\mu=\kappa\circ\eta,\qquad \kappa:\mathcal U\to\Delta(Y).
    $$
    此时 decoder 不只是输出 hard label，而是输出完整的类别后验分布。外部随机变量 $W\sim\mathrm{Unif}[0,1]$ 用来实现这个条件分布：
    $$
    Y=f(W,\eta(X)).
    $$
    因此，IS 不仅保证 Bayes 最优分类器可以下降到隐空间，还保证互信息不损失：
    $$
    I(X;Y)=I(\eta(X);Y),
    $$
    并进一步推出最小错误概率保持不变：
    $$
    \ell(\mu_{X,Y})=\ell(\mu_{\eta(X),Y}).
    $$

# Appendix.A

**互信息链式法则**
$$
I(X,U;Y)=I(U;Y)+I(X;Y∣U).
$$
**Proof**:

$$
\begin{aligned}
I(X,U;Y)& = \sum_{x,y,u} p(x,y,u)\log \frac{p(x,y,u)}{p(x,u)p(y)}\\
& = \sum_{x,y,u}p(x,y,u)\log \frac{p(u,y)}{p(u)p(y)}+\sum_{x,y,u}p(x,y,u)\log\frac{p(x,y,u)}{p(x\mid u)p(u,y)}\\
& = I(U;Y)+  \sum_{x,y,u}p(x,y,u) \log \frac{p(x,y\mid u)p(u)}{p(x\mid u)p(u,y)}\\
& = I(U;Y)+ \sum_{x,y,u}p(x,y,u)\log \frac{p(x,y\mid u)}{p(x\mid u)p(y\mid u)}\\
& = I(U;Y) +I(X;Y\mid U)
\end{aligned}
$$



# Appendix.B

$\displaystyle r_X^\ast: X\to Y = \argmax_{y\in Y}\mu_{Y\mid X}(y\mid x) $  从输入空间$X$到预测空间$Y$的最小错误映射，根据真实后验分布 $\mu_{Y\mid X}(\cdot \mid X)$ 诱导的分类器。

$\displaystyle r_\mathcal{U}^\ast: \mathcal{U}\to Y = \argmax_{y\in Y}\mu_{Y\mid \mathcal{U}}(y\mid u)$ 从隐空间$U$ 到预测空间$Y$ 的最小错误映射，根据泛性质 $r_X = r_\mathcal{U}\circ \eta$ 诱导的最优拉回映射
