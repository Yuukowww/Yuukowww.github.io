---
title: Encoder-Decoder structure with Information Measures
date: 2026-07-04
update: 2026-07-04
categories: LLM
descripton: Encoder-Decoder架构的表征学习，信息损失的互信息量化
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

称这样的$\eta$ 为Information Sufficient, 相对于预测$Y$ ，Encoding映射不损失信息。

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
	\arrow["{r_X^\ast}", curve={height=-30pt}, from=1-1, to=1-5]
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

![encoder-decoder](/picture/CS/information_measure)


# Appendix

互信息链式法则
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