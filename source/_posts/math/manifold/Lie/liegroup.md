---
title: 李群和李代数基本概念
date: 2026-09-22
updated: 2026-09-22
description: 一些的李群知识的review
categories: geometry
tag: [geometry,algebra]
tikzjax: true
cover: picture/denia4.jpg
---

参考陈维桓老师的《微分流形初步》[@chen2001differentialmanifolds]

$$
\widetilde X:G\to TG: (L_g)_{\ast e}X
$$
```tikz
\usepackage{graphicx}
\usepackage{tikz-cd}

\begin{document}
\begin{tikzcd}
	{T_eG} && {T_gG} \\
	X && {\widetilde{X}(g)}
	\arrow["{(L_g)_{\ast e}}", from=1-1, to=1-3]
	\arrow["{\rotatebox{90}{$\in$}}"{description}, draw=none, from=1-1, to=2-1]
	\arrow["{\rotatebox{90}{$\in$}}"{description}, draw=none, from=1-3, to=2-3]
	\arrow[maps to, from=2-1, to=2-3]
\end{tikzcd}
\end{document}
```


**Theorem 6.1.1** 设 $G$ 是 $r$ 维李群，则由切向量 $X\in T_eG$ 经左移动产生的光滑切向量场 $\widetilde{X}$ 在李群 $G$ 的左移动下是不变的；反过来，李群 $G$ 上任意一个在左移动下不变的切向量场都是由在单位元素 $e$ 处的某个切向量经过左移动产生的。

**Proof**:
任意取流形一点 $h\in G$
$$
\begin{aligned}
d(L_h)_{g}\widetilde{X}(g) & = (L_h)_{\ast g}\circ (L_g)_{\ast e}(X)\\
& = (L_h\circ L_g)_{\ast e}(X)\\
& = (L_{hg})_{\ast e}(X)\\
& = \widetilde{X}(h\cdot g)
\end{aligned}
$$
因此切向量场在左移动下不变。

左不变向量场将单位元 $e\in G$ 处的李代数 $\mathfrak g$ 延拓到整个李群
