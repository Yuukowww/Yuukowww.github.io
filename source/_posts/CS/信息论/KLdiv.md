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

概率分布之间的交叉熵定义为
$$
H(p,q) := -\sum_x p_i(x)\log q_i(x)
$$

假设有输入分布 $p_i:\mathbb{R}^m\to \Delta^n$ 和模型后验输出 $\hat p_i:\mathbb{R}^m\to\Delta^n$, 并且实际的输入分布是one-hot 的, 交叉熵定义为
$$
H(p,\hat p) = -\sum_x p_i(x;\theta)\log \hat p_i(x;\theta) = -\sum_x \log \hat p_{\alpha_i}(x;\theta)
$$
其中 $\alpha_i$ 是真实分类

$$
\argmin_{\theta} H(p,\hat p) = \argmax_\theta \sum_x \log \hat p_{\alpha_i}(x;\theta)
$$

而这正是最大似然估计的极值条件。

## KL散度

$$
H(p,q) =  - \sum p_i \log q_i =-\sum p_i\log  p_i +\sum p_i \log \frac{p_i}{q_i} = H(p)+\sum p_i\log \frac{p_i}{q_i}
$$

定义KL散度为
$$
D_\mathrm{KL}(p \parallel q) := \sum p_i \log \frac{p_i}{q_i}
$$

KL散度并不符合metric的定义，因为
$$
D_\mathrm{KL}(p\parallel q) \neq  D_\mathrm{KL}(q\parallel p)
$$

$$
D_\mathrm{KL}(p\parallel q)+D_\mathrm{KL}(q\parallel r) - D_\mathrm{KL}(p\parallel r) = \sum (p_i-q_i)\log \frac{r_i}{q_i} \not\geq 0
$$

对于KL散度的局部扰动，其一阶项消失，二阶项给出局部度量。考虑
$$
\begin{aligned}
H(p_\theta,p_{\theta+\mathrm d\theta})
&= - \sum_i p_i(\theta)\log p_i(\theta+\mathrm d\theta) \\
&= - \sum_i p_i(\theta)\log \left[p_i(\theta)+\delta p_i\right]\\
&= H(p_\theta)-\sum_i p_i(\theta)\log\left[1+p_i^{-1}(\theta)\delta p_i\right],
\end{aligned}
$$
其中 $\delta p_i:=p_i(\theta+\mathrm d\theta)-p_i(\theta)$。

因此
$$
\begin{aligned}
D_\mathrm{KL}(p_\theta\parallel p_{\theta+\mathrm d\theta})
&= - \sum_i p_i(\theta)\log\left[1+p_i^{-1}(\theta)\delta p_i\right] \\
&= -\sum_i\delta p_i+\frac{1}{2}\sum_i p_i^{-1}(\theta)(\delta p_i)^2
+o(\|\mathrm d\theta\|^2).
\end{aligned}
$$
由于 $\displaystyle\sum_i p_i(\theta)=\sum_i p_i(\theta+\mathrm d\theta)=1$，有 $\displaystyle\sum_i\delta p_i=0$。又因为

$$
\delta p_i=\nabla_\theta p_i(\theta)^T\mathrm d\theta+O(\|\mathrm d\theta\|^2),
$$

所以

$$
D_\mathrm{KL}(p_\theta\parallel p_{\theta+\mathrm d\theta})
=\frac{1}{2}\mathrm d\theta^T
\left[\sum_i p_i^{-1}(\theta)\nabla_\theta p_i(\theta)\nabla_\theta p_i(\theta)^T\right]
\mathrm d\theta+o(\|\mathrm d\theta\|^2).
$$

取 $I(\theta):=\sum_i p_i^{-1}(\theta)\nabla_\theta p_i(\theta)\nabla_\theta p_i(\theta)^T$，即为Fisher 信息矩阵。它是关于 $\mathrm d\theta$ 的半正定二次型；当 $I(\theta)$ 正定时，它给出局部Riemann度量。
