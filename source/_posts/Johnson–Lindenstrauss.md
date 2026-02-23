---
title: Johnson–Lindenstrauss 引理
intro: ML
time: 2026-02-15
tikzjax: true
---
$$
\newcommand{\E}{\mathrm{E}}
\newcommand{\pf}{\mathrm{Proof}:}
\newcommand{\rmd}{\,\mathrm{d}}
$$
# John-Linderstrass 引理




> **Johnson-Linderstrauss** 引理
>
> 对于N个点$x_1,x_2,\cdots,x_N\in \mathbb{R}^d$, $\forall \varepsilon\in (0,1) $, $\exists f: \mathbb{R}^d\to\mathbb{R}^m $, 满足
>
>$$
(1-\varepsilon)\|x_i-x_j\|_2\leq \|f(x_i)-f(x_j)\|_2\leq (1+\varepsilon)\|x_i-x_j\|_2
>$$
>其中
>$$
m\geq \frac{24\log N}{\varepsilon^2}\simeq O(\frac{\log N}{\varepsilon^2})
>$$