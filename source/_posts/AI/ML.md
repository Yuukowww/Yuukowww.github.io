---
title: 传统机器学习
description: 机器学习数学基础与实现review
date: 2026-03-11
tag: [机器学习]
categories: ML
cover: picture/20.png
---
本文用于复习机器学习基础, Follow 周志华《机器学习》
<!-- more -->


## 线性模型与支持向量机

线性模型的基础是线性映射与最小二乘法。

> **问题定义**:
> 
> - 单个样本为一个 $d$ 维实向量 $u = (x_1,x_2,\cdots ,x_d), x_i\in\mathbb{R}$ 与 对应的值 $y\in\mathbb{R}$
> - 样本集 $D = \left\{(u_i,y_i)\big | \,1\leq i\leq n \right\}$ 是由多个样本构成的集合
> - 线性模型: 样本集上的最小二乘拟合，线性回归的目的是求解出满足最小二乘法的**参数矩阵**与**偏置向量**

作用在单个数据上的线性映射
$$
\hat{y_i} = f_i(u_i) = \omega_{i,1} x_{i,1}+ \omega_{i,2} x_{i,2} +\cdots + \omega_{i,d} x_{i,d}+ b = \omega^Tu_i+b: \mathbb{R}^d\to \mathbb{R}
$$

最小二乘法满足
$$
(\omega^\ast,b^\ast) = \argmin_{\omega,b} \sum_i\|y_i-\hat{y_i}\|^2 = \argmin_{\omega,b} \sum_i \|y_i-\omega u_i - b\|
$$

最小二乘法约定的平方根误差也成为**均方误差(Mean-Squared-Error)**
$$
L(w,b) =\frac{1}{n}\sum_{i=1}^n (y_i-\hat{y_i})^2 = \frac{1}{n} \sum_{i=1}^n (y_i-\omega u_i-b)^2
$$


## 正则化
> Lasso 正则化


> 岭正则化


## 贝叶斯决策

贝叶斯分析的分类类别集为一个$n$元集合
$$
\mathcal{Y} = \left\{c_1,c_2,\cdots, c_n\right\}
$$
样本集合$\mathcal{X}$内的元素具有类别集$\mathcal{Y}$的属性。对于每个样本对象$\bm{x}$
> **损失函数**
>
> 贝叶斯决策中的损失函数定义为将样本$c_i$分类为$c_j$的损失
> $$
\lambda_{i,j}:\mathcal{Y}\times\mathcal{Y}\to [0,1]
> $$
> 通常使用0-1损失
> $$
\lambda_{i,j} = \delta_{i,j} = \begin{cases}
0&i =  j\\
1&i \neq j
\end{cases}
> $$

总损失期望
$$
R(c_i\big| \bm{x}) = \sum_{j=1}^n \lambda_{i,j} P(c_j\big | \bm{x})
$$

贝叶斯决策目的是训练一个分类器，实现对于每一个样本的分类的优化
$$
h:\mathcal{X}\to \mathcal{Y}
$$
样本经过分类器$h$分类后的的总体损失期望为
$$
R(h)=E_{\bm{x}\in \mathcal{X}}\left[R(h(\bm{x})\big|\bm{x})\right]
$$
分类器的求解的目的即获得一个映射 $h^\ast$ 满足对于某个样本分类
$$
h^\ast(\bm{x}) = \argmin_{c\in\mathcal{y}} R(c\big| \bm{x})
$$

### 贝叶斯分类器的训练

