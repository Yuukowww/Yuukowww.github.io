---
title: JitRL -- 无参数后训练
categories: RL
date: 2026-11-04
updated: 2026-11-04
tag: [LLM,RL,Parameter-free]
description: 静态权重下的 Parameter-free RL
cover: picture/kadane4.jpg
---
# JitRL

常见的模型后训练都发生在模型权重上，对于全参数模型的后训练的资源开销巨大，小模型本地推理在能力和计算资源开销上较大。

在Agentic 时代，API调用下只能通过设备端的Prompt优化，但只有Prompt 并不能稳定持续优化特定领域任务。

与Train-free RL 相关的工作不同，JitRL在设备端实现一个简单KNN回归，保留了RL中基本的Advantage estimation和 Optimation, 但并不基于模型的本身token分布Rollout策略


$$
\pi^\ast = \argmax_{\pi'} \left(\mathbb E_{a\sim \pi'}[A(s,a)]-\beta D_{KL}(\pi'\parallel \pi_{old})\right)
$$

这和 {% post_link CS/LLM/CS336/assignment5/assignment5-01 PPO %} 的目标优化是相同的