---
title: LLM学习:01--Transformer
date: 2026-05-03
description: CS336 LLM学习Record 1
tag: [CS336,LLM,基模]
categories: LLM
math: true
cover: picture/amiya1.jpg
---

# Attention is All You Need

## 模块

### Attention与 Multi-Head Attention

$$
\mathrm{Attention}(Q,K,V) = \mathrm{Softmax}(\frac{QK^T}{\sqrt{d_k}})V
$$
