---
title: Encoder-Decoder structure with Information Measures
date: 2026-07-04
update: 2026-07-04
categories: LLM
tag: [Representation Learning, Encoder-Decoder Structure]
cover: picture/shinku3.jpg
---
# Encoder-Decoder Structures in Machine Learning Using Information Measures

本文主要展示的是如何通过信息度量(在本文中使用的是互信息度量) 经历 Encoder 后的信息变化



## 基本数学量定义

互信息 Mutual Information 

$$
\begin{aligned}
\mathcal{I}(X;Y) = D_{KL}(P_{(X,Y)}\parallel P_X \otimes P_Y) &= \sum_{y\in\mathcal{Y}}\sum_{x\in \mathcal{X}}p(x,y)\log \frac{p(x,y)}{p(x)p(y)}\\
& = \sum_{y\in\mathcal{Y}}\sum_{x\in \mathcal{X}}p(x,y)\log p(x,y) -  \sum_{y\in\mathcal{Y}}\sum_{x\in \mathcal{X}} p(x,y) \log p(x) - \sum_{y\in\mathcal{Y}}\sum_{x\in \mathcal{X}} p(x,y) \log p(y)\\
& = -H(X,Y) -\sum_{x\in \mathcal{X}}\left(\sum_{y\in \mathcal{Y}}p(x,y)\right)\log p(x)-\sum_{y\in \mathcal{Y}}\left(\sum_{x\in \mathcal{X}}p(x,y)\right)\log p(y)\\
& =-H(X,Y) -\sum_{x\in\mathcal{X}}p(x)\log p(x)-\sum_{y\in\mathcal{Y}}p(y)\log p(y)\\
& = H(X) +H(Y)-H(X,Y) 
\end{aligned}
$$

其中 $H(X),H(Y),H(X,Y)$ 分别表示$X,Y$ 的边缘熵与联合熵

$$
\mathcal{I}(X;Y)=\mathcal{I}(\mu_{X,Y}) = H(Y) + H(X)-H(X,Y) = H(Y) -H(Y\mid X)
$$

**Definition1**: **Information Sufficient**


Encoding映射 $\eta :\mathcal{X}\to \mathcal{U}$ 满足
$$
\mathcal{I}(\mu_{X,Y}) = \mathcal{I}(\mu_{\eta(X),Y})
$$

称这样的$\eta$ 为Information Sufficient, 相对于预测$Y$ ，Encoding映射不损失信息。




