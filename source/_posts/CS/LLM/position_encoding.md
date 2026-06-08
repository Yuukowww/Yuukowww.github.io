---
title: Position Encoding 
date: 2026-06-07
update: 2026-06-07
description: Transformer 中的位置编码
categories: LLM
tag: [encoding, LLM]
cover: picture/Denia2.jpg
---

# Position Encoding

[Attention Is All You Need](https://arxiv.org/abs/1706.03762) 中提出了 **Sinusoidal Position Encoding**

$$
\begin{aligned}
\mathrm{PE}(pos,2i) &= \sin \left(\frac{pos}{f^{2i/d_{mod}}}\right)\\
\mathrm{PE}(pos,2i+1)& = \cos \left(\frac{pos}{f^{2i/d_{mod}}}\right)
\end{aligned}
$$
对于token vector 
$$
pos = 
$$
