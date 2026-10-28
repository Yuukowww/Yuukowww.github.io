---
title: CS336 05.2 -- RL Engine 中的多卡训推问题
date: 2026-10-26
updated: 2026-10-26
categories: LLM
tag: [LLM,RL,CS336]
description: Assignment 5 实践中的RL搭建记录
cover: picture/tomoyo1.jpg
---

# 训练一 -- 基于 Qwen3.5-4B-Base H20单卡的 GSM8K math RL

在 Assignment5 的GRPO/PPO 的基础上进行后训练，使用Qwen3.5-4B-Base 的模型。Rollout 基于 VLLM 推理加速。




# 训练二 -- 基于 Qwen3.5-9B-Base H20双卡的 GSM8K math RL

