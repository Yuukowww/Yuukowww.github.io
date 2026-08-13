---
title: 多任务优化与帕累托最优
date: 2026-08-11
update: 2026-08-11
categories: optimation
tag: [convex geometry,optimation]
description: 多任务最优化
cover: picture/mutsumi1.png
---

**向量逼近问题** 考虑实线性空间$X$, 非空集合 $S\subset X$，给定一个映射$f: S\to Y$, 在偏序锥$C_Y$的序关系下，求最小元 $\bar{x}\in S$
$$
f(\bar{x})\in \min_{C_Y}f(S)
$$
对于常见的范数锥
$$
Y=X\times\mathbb{R},\quad C_Y = \left\{ (x,t)| \|x\|_p\leq t\, , p\geq 1\right\}
$$
向量逼近问题就是求
$$
\bar{x}\in\argmin_{x\in S} \|x-x_0\|_p
$$
