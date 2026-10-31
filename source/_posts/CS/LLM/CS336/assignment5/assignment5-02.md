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

DeepseekMath 论文中的实现设置训练:
| 项目 | 配置 |
| --- | --- |
|GSM8K + MATH CoT 数据| 1 |
|Training Batch Size|1024|
|训练集大小|144K|


一个题目Rollout 64 次，每一个Batch 65536个回答,理论上一个Epoch 训练: 144K* 65536= 9.2M 次

SFT执行841 steps, 共6726条训练样本


# 训练二 -- 基于 Qwen3.5-9B-Base H20双卡的 GSM8K math RL
