---
title: mup -- 小样本参数迁移
date: 2026-05-07
description: 论文笔记
categories: LLM
math: true
cover: picture/amiya1.jpg
---

# Tuning Large Neural Networks via Zero-Shot Hyperparameter Transfer

$\mu p$ 文章的核心问题是超参数的在大模型的先验确定需要 大量的测试与算力资源，本文旨在讨论对于大模型的超参数(主要是指学习率)的设定能否从小参数模型迁移到大参数量的模型，同时保证训练的效果相对稳定。


