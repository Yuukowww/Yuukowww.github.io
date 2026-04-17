---
title: 组合数学
description: 离散数学课程Record
date: 2025-02-19
categories: 数学
tikzjax: true
cover: picture/kasuga1.jpg
---


## 容斥原理

> **Erdos-Szekeres**定理
> $(S,\prec)$是一个偏序集,$|S|=mn+1$ ,则$S$中存在长为$m+1$的链或$n+1$的反链

**Proof:**
定义 $f:S\to \mathbb{N}$ $f(i)$为以$x_i\in S$开头的最长递增子列的长度。如果最长子链的长度小于$m+1$,  则
$$
\mathcal{B} = \max f(S) = \left\{1,2,\cdots,m\right\}
$$

由容斥原理,由于$|S|> mn$, $\exists b\in \mathcal{B}$, $|f^{-1}(b)|\geq n+1$。选择 $a_1,\cdots,a_{n+1}\in f^{-1}(b)$, 总有$i< j, a_i > a_j$ ,否则存在大于$m$的递增列。故这样选出的 $\{a_i\}$是单调减的序列。
