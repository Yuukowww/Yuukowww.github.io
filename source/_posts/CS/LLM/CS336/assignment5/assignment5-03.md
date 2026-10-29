---
title: CS336 05.3 -- Dr.GRPO
description: GRPO中的归一化操作对于Advantage 的放大作用
categories: LLM
tag: [RL,LLM]
cover: picture/kurumu1.jpg
---
# 组内 Reward 归一化
原始GRPO中的组内Reward 存在的问题{% post_link CS/AI/RL/verl/verl02 代码 %}

$$
R_t \Longrightarrow \hat A_t = \frac{R_t - \bar R_g}{\sigma_g+\varepsilon}
$$

Dr.GRPO 中去掉了$A_t$的归一化分母
$$
\tilde A_t = R_t-  \bar R_g
$$

二元奖励下 $R = \left\{0,1\right\}$近似两点分布, 期望为 $\sigma_R^2 = p(1-p)$
$$
\tilde A_t = \frac{\hat A_t}{\sigma_{R,g}}\approx \frac{\hat A_t}{\sqrt{p(1-p)}}
$$

这会导致构建组内的advantage呈现靠近均值低，远离均值高的现象


# 回答长度归一化

