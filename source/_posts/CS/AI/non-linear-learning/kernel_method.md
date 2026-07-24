---
title: Kernel Method
date: 2026-07-22
updated: 2026-07-22
description: 核学习与线性表示
categories: LLM
tag: [kernel method, Representation Learning]
cover: picture/asuna3.jpg
---

# Riesz 表示定理 与 RKHS

对于Hilbert空间 $\mathcal{H}$ 上的连续线性泛函 
$$
L:\mathcal{H}\to \mathbb{R}
$$

都存在唯一的 $g_L \in \mathcal{H}$


$$
L(f) = \left<f,g_L\right>_\mathcal{H}, \forall f\in \mathcal{H}
$$
且 $\|L\| = \|g_L\|$

对于给定的 $\mathcal{H}\subseteq \left\{f:\mathcal{X}\to \mathbb{R}\right\}$, 对于 $x\in \mathcal{X}$， 点值泛函满足
$$
\delta_x(f) = f(x)
$$

根据Riesz 表示定理，$\exists! \, k_x\in\mathcal{H}$, 满足
$$
f(x)= \delta_x(f) = \left<f,k_x\right>_\mathcal{H} = \left<f,k\left(\,\cdot,x\right)\right>_\mathcal{H}
$$

诱导出再生核函数
$$
k(x,y) := k_y(x) = \left<k_y,k_x\right>_\mathcal{H}
$$

核函数的Gram矩阵总是半正定的，满足
$$
G(k_{x_1},\cdots,k_{x_n}) = \begin{pmatrix}
\left<k_{x_1},k_{x_1}\right> & \left<k_{x_1},k_{x_2}\right> &\cdots & \left<k_{x_1},k_{x_n}\right>\\
\left<k_{x_2},k_{x_1}\right> & \left<k_{x_2},k_{x_2}\right> &\cdots & \left<k_{x_2},k_{x_n}\right>\\
\vdots &&\ddots&\vdots \\
\left<k_{x_n},k_{x_1}\right> & \left<k_{x_n},k_{x_2}\right> &\cdots & \left<k_{x_n},k_{x_n}\right>\\
\end{pmatrix}
$$
$$
\begin{aligned}
\sum_{i,j} c_i c_j \left<k_{x_i},k_{x_j}\right>_\mathcal{H}& = \sum_{i,j} c_ic_j \left<k(\cdot,x_i),k(\cdot,x_j)\right>_\mathcal{H}\\
& = \left\|\sum_{i} c_i k(\cdot,x_i) \right\|^2_\mathcal{H}\geq 0
\end{aligned}
$$

对应相应的Hilbert 空间 $\mathcal{H}$称为Reproducing kernel Hilbert space.

核函数要求有界,即 $ \sup_{x,y\in \mathcal{X}} k(x,y) \leq C $，因此
$$
\begin{aligned}
|f(x)|&\leq \|f\|_\mathcal{H}\, \|k(\cdot, x)\|_\mathcal{H}\\
&= \sqrt {k(x,x)} \|f\|_{\mathcal{H}}\\
&\leq \sqrt{C} \|f\|_\mathcal{H}
\end{aligned}
$$




## Kernel Method 

Kernel Method的作用范围为最优化问题

$$
\min_{f\in \mathcal{H}} L(f(x_1),\cdots, f(x_k)) +\Omega(\|f\|_\mathcal{H})
$$


对于采样点 $x_1,\cdots x_n\in \mathcal{X}$, 最优化函数落在
$$
\mathrm{Span}\left\{ k(\cdot, x_i)\right\}_{i}^n
$$
即
$$
f^*(x)  = \sum_i \alpha_i k(x, x_i) 
$$
这样就能通过再生核函数在样本上的截面逼近非线性函数, 那么对于背景的非线性优化问题，如何选择再生核、如何优化参数就是优化核逼近的基本问题。

## Moore–Aronszajn 定理

Moore–Aronszajn 定理给出一个一一对应的等价关系
$$
\text{正定核函数}\Longleftrightarrow \text{RKHS}
$$



# 核函数






