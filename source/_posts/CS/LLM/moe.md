---
title: MoE -- Mixture of experts
date: 2026-06-01
update: 2026-06-02
categories: LLM
description: 混合专家模型
tag: [架构]
cover: picture/kanade1.jpg
---

# Mixture of Experts



# Special Scaling Property of Softmax
$$
\|\mathrm{Softmax}(kx)\|\geq\|\mathrm{Softmax}(x)\|^{k}
$$

Consider
$$
\begin{aligned}
\|\mathrm{Softmax}(kx)\|^2 &= \left\|\left(\frac{e^{kx_i}}{\sum_j e^{kx_j}}\right)_i\right\|^2\\
& = \sum_{i}\left(\frac{e^{kx_i}}{\sum_j e^{kx_j}}\right)^2\\
& = \frac{1}{(\sum_j e^{kx_j})^2}\sum_{i} \left(e^{kx_i}\right)^2\\

\|\mathrm{Softmax}(x)\|^{2k}&= \left[\sum_{i}\left(\frac{e^{x_i}}{\sum_j e^{x_j}}\right)^2\right]^k\\
& = \frac{1}{(\sum_j e^{x_j})^{2k}} \left(\sum_i e^{2x_i}\right)^k
\end{aligned}
$$


Let $u_i := e^{x_i}$,$S = \sum u_i$, $p_i = \dfrac{u_i}{S}$  then

$$
\sum p_i = \sum \frac{p_i}{S} = 1
$$

$$
\frac{\sum u_i^{2k}}{(\sum u_i^k)^2} \geq \frac{(\sum u_i^2)^k}{(\sum u_i)^{2k}}
$$

Then

$$
\sum u_i^{2k}\left(\sum u_i\right)^{2k}\geq \left(\sum u_i^{k}\right)^{2}\left(\sum u_i ^2\right)^k
$$

Equally

$$

S^{4k}\sum p_i^{2k} \geq S^{4k} \left(\sum p_i^{k}\right)^2 \left(\sum p_i^2\right)^k
$$

$$
\sum p_i^{2k}  \geq  \left(\sum p_i^{k}\right)^2 \left(\sum p_i^2\right)^k
$$

Let $A_r = \sum p_i^r < (\sum p_i)^r  = 1$

Then
$$
A_{2k} \geq A_k^2 A_2^k
$$

According to Hölder's Inequality

$$
A_r \leq A_1^{\theta} A_{2k}^{1-\theta} = A_{2k}^{1-\theta}
$$

While $r = \theta + 2k(1-\theta) = k$
$$
1-\theta = \frac{k-1}{2k-1}
$$

$$
A_k \leq A_{2k}^{\frac{k-1}{2k-1}}
$$

While $r = \theta + 2k(1-\theta) = 2$

$$
1-\theta = \frac{1}{2k-1}
$$
$$
A_2 \leq A_{2k}^{\frac{1}{2k-1}}
$$

Then
$$
A_k^2A_2^k \leq  A_{2k}^{\frac{2(k-1)+k}{2k-1}} = A_{2k}^{\frac{3k-2}{2k-1}}<A_{2k}
$$



In addition, for norm of k-scaling-Softmax, we have its partial derivation

$$
\begin{aligned}
\frac{\partial}{\partial k}\|\mathrm{Softmax}(kx)\|^2 &= \frac{\partial}{\partial k} \sum_{i}\left(\frac{e^{kx_i}}{\sum_j e^{kx_j}}\right)^2\\
& = \sum_i \frac{\partial}{\partial k}\left(\frac{e^{kx_i}}{\sum_j e^{kx_j}}\right)^2\\
& = \sum_i \frac{2x_i e^{kx_i}(\sum e^{kx_j})^2 - 2e^{kx_i}\sum_j e^{kx_j} \sum x_je^{kx_j} }{(\sum_j e^{kx_j})^4}\\
& = \sum_i \frac{2e^{kx_i}}{(\sum_j e^{kx_j})^3} \left(x_i \sum e^{kx_j} - \sum x_je^{kx_j}\right)\\
&< 2\sum_i x_i \sum e^{kx_j} - 2\sum x_j e^{kx_j}\\
& = 2\sum_{1<i,j<n}(x_i-x_j)(e^{kx_i}-e^{kx_j})
\end{aligned}
$$

