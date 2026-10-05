---
title: 组合数学
description: 离散数学课程Record
date: 2025-02-19
updated: 2026-10-03
categories: 数学
tag: [离散数学]
tikzjax: true
cover: picture/kasuga1.jpg
---
# 离散数学

## 容斥原理

> **Erdos-Szekeres**定理
> $(S,\prec)$是一个偏序集,$|S|=mn+1$ ,则$S$中存在长为$m+1$的链或$n+1$的反链

**Proof:**
定义 $f:S\to \mathbb{N}$ $f(i)$为以$x_i\in S$开头的最长递增子列的长度。如果最长子链的长度小于$m+1$,  则
$$
\mathcal{B} = \max f(S) = \left\{1,2,\cdots,m\right\}
$$

由容斥原理,由于$|S|> mn$, $\exists b\in \mathcal{B}$, $|f^{-1}(b)|\geq n+1$。选择 $a_1,\cdots,a_{n+1}\in f^{-1}(b)$, 总有$i< j, a_i > a_j$ ,否则存在大于$m$的递增列。故这样选出的 $\{a_i\}$是单调减的序列。

## 卡特兰数

卡特兰数有一个统一的格点路径计数的建模方式，与卡特兰数计数相关的问题，比如三角剖分、满二叉树计数、栈计数或者括号匹配问题都可以通过这一建模方式计算卡特兰数递推。

对于一个$n\times n$ 的方格，从$(0,0)$ 出发到达$(n,n)$，每一步只能向右或者向上走一步，可以触碰但是不能逾越 $y=x$, 这样的路径有多少条。

假设第一次与$y=x$ 交于$(k+1,k+1)$, 这个路径为
$$
(0,0)\to (1,0) \overset{p_n}{\to} (k+1,k)\to (k+1,k+1)
$$
从 $(k+1,k+1)$ 到 $(n,n)$ 的路径是相同的递推

因此可以得到递推
$$
C_n = \sum_{k=0}^{n-1}  C_k C_{n-k-1}
$$

从 $(0,0)$ 到 $(n,n)$ 的总路径数为
$$
\binom{2n}{n}
$$

其中不符合的路径，第一次越过边界时的位置肯定经过 $y=x+1$, 这样的路径经过 $y=x+1$ 对称后的起点为 $(-1,1)$, 从 $(-1,0)$ 到 $(n,n)$ 的路径数为$\displaystyle \binom{2n}{n+1}$, 因此卡特兰数表示为

$$
C_n = \binom{2n}{n} - \binom{2n}{n+1} = \frac{1}{n+1}\binom{2n}{n}
$$

即
$$
C_n = \sum_{k=0}^{n-1}  C_k C_{n-k-1}  = \frac{1}{n+1}\binom{2n}{n}
$$

### 栈结构

非法栈结构存在

$$
P_k<P_i<P_j\quad(i<j<k)
$$


