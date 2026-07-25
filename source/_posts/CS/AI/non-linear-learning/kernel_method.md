---
title: Kernel Method
date: 2026-07-22
updated: 2026-07-24
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

如果核函数满足
$$
\sup_{x\in\mathcal{X}} k(x,x)\leq C,
$$
那么
$$
\begin{aligned}
|f(x)|&\leq \|f\|_\mathcal{H}\, \|k(\cdot, x)\|_\mathcal{H}\\
&= \sqrt {k(x,x)} \|f\|_{\mathcal{H}}\\
&\leq \sqrt{C} \|f\|_\mathcal{H}
\end{aligned}
$$




## Moore–Aronszajn 定理

Moore–Aronszajn 定理给出了正定核函数与 RKHS 之间的一一对应关系：
$$
\text{正定核函数}\Longleftrightarrow \text{RKHS}
$$

## Kernel Method

核方法的核心思想是：通过核函数计算特征空间中的内积，而不显式构造高维甚至无限维的特征表示。

设存在从输入空间到特征 Hilbert 空间的映射
$$
\phi:\mathcal{X}\to\mathcal{F},
$$
使得核函数满足
$$
k(x,x')=\left\langle\phi(x),\phi(x')\right\rangle_{\mathcal{F}}.
$$

因此，只要一个学习算法能够写成样本内积的形式，就可以用核函数替代特征空间中的内积运算，从而在特征空间中使用线性方法，并在原输入空间中得到非线性的决策函数。这一过程称为核技巧。

### 表示定理

给定训练样本
$$
\{(x_i,y_i)\}_{i=1}^{n},
$$
考虑 RKHS $\mathcal{H}$ 上的正则化经验风险最小化问题
$$
\min_{f\in\mathcal{H}}
\sum_{i=1}^{n}\ell\bigl(y_i,f(x_i)\bigr)
+\lambda\Omega\left(\|f\|_{\mathcal{H}}\right),
$$
其中 $\ell$ 为损失函数，$\lambda>0$，并且 $\Omega$ 关于 $\|f\|_{\mathcal{H}}$ 严格单调递增。

如果该问题存在最优解，那么根据表示定理，每个最优解都可以写成
$$
f^*(\cdot)=\sum_{i=1}^{n}\alpha_i k(\cdot,x_i)
$$
的形式。因此，虽然 $\mathcal{H}$ 可能是无限维空间，但最优解只需要由训练样本对应的核截面
$$
k(\cdot,x_1),\ldots,k(\cdot,x_n)
$$
线性表示。

令核矩阵 $K\in\mathbb{R}^{n\times n}$ 满足
$$
K_{ij}=k(x_i,x_j),
$$
则
$$
f^*(x_i)=(K\alpha)_i,
\qquad
\|f^*\|_{\mathcal{H}}^2=\alpha^\top K\alpha.
$$

于是，原本定义在函数空间 $\mathcal{H}$ 上的优化问题，可以转化为关于有限维系数
$$
\alpha=(\alpha_1,\ldots,\alpha_n)^\top
$$
的优化问题。



# 核函数



