---
title: On Layer Normalization in the Transformer Architecture
date: 2026-05-23
update: 2026-05-23
description: 层归一化位置与训练稳定性
categories: LLM
math: true
cover: picture/amiya1.jpg
---

# On Layer Normalization in the Transformer Architecture

本文介绍了Pre-LN, 将归一化层放置在残差分支，以降低训练初始状态的训练梯度爆炸的现象。