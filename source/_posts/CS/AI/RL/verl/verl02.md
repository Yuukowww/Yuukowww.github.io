---
title: RLEngine 02 -- Verl 的基本算法实现
date: 2026-10-21
updated: 2026-10-2
categories: RL
tag: [RL,Infra]
description: verl的底层实现 -- GRPO、GAE等算法
cover: picture/kanade3.jpg
---
# 算法结构
verl 的算法实现的内容相对较少，核心的部分主要是rollout 和 training 的调度的上层结构。

## KLController
`AdaptiveKLController`的实现[@ziegler2020finetuninglanguagemodelshuman]
对冻结的KL散度相对偏差率绝对值限制在0.2
$$
e =\mathrm{clip}\left( \frac{\mathsf{KL}_{cur}-\mathsf{KL}_{target}}{\mathsf{KL}_{target}}\right) \in[-0.2,0.2]
$$
用截断的参数$e$ 更新惩罚参数, $h$ horizon是调整的尺度
$$
\beta_{t+1} = \beta_t(1+e\frac{n_{step}}{h}) =\beta_t(1+K_\beta e_t)
$$

## Advantage Estimation
### GAE
`compute_gae_advantage_return`的实现
{% post_link CS/AI/RL/Markov 单步TD误差%}
$$
    \begin{aligned}
    \hat A_t &\approx  \delta_t = r_t+\gamma V_{t+1}-V_t
    \end{aligned}
$$


$$
\hat A_t^{(2)} = \delta_t+\gamma\delta_{t+1}
$$

$$
\hat A_t^{( n)} = \sum_{k\geq 0}^{n-1} \gamma^k \delta_{t+k}
$$

GAE估计定义为TD误差的加权累加符合几何分布
$$
P(N=n) =(1-\lambda)\lambda ^n
$$
则
$$
\hat A_t^{GAE} =\mathbb E_N[\hat A_t^{(n)}]
$$
$$
\begin{aligned}
\hat A_t^{GAE} &= \delta_t+\gamma\lambda \hat A_{t+1}^{GAE}\\
& = \delta_t + \sum_{l\geq 0} (\gamma \lambda)^l\hat A_{t+1}^{GAE}
\end{aligned}
$$

在verl的`compute_gae_advantage_return` 中基于累加实现
```python
for t in reversed(range(gen_len)):
            # 求出delta_t, 等于 r+gamma*V_t - V_{t-1}
            delta = token_level_rewards[:, t] + gamma * nextvalues - values[:, t]
            # 更新 A_t^{GAE}
            lastgaelam_ = delta + gamma * lam * lastgaelam

            # skip values and TD-error on observation tokens
            # 根据response_mask 控制哪些GAE的advantage估计需要保留
            nextvalues = values[:, t] * response_mask[:, t] + (1 - response_mask[:, t]) * nextvalues

            lastgaelam = lastgaelam_ * response_mask[:, t] + (1 - response_mask[:, t]) * lastgaelam

            advantages_reversed.append(lastgaelam)
        advantages = torch.stack(advantages_reversed[::-1], dim=1)

        returns = advantages + values
```


### GRPO

`compute_grpo_outcome_advantage`
归一化构建GRPO的 reward

$$
R_t \Longrightarrow \frac{R_t - \bar R_g}{\sigma_g+\varepsilon}
$$


```python
for i in range(bsz):
            if norm_adv_by_std_in_grpo:
                scores[i] = (scores[i] - id2mean[index[i]]) / (id2std[index[i]] + epsilon)
            else:
                scores[i] = scores[i] - id2mean[index[i]]
```
`compute_grpo_vectorized_outcome_advantage` 归一化的向量实现, 每一个回答基于平均值获得正advantage和负advantage

GRPO 在一个问题的Rollout 中前向生成多个答案或者推理结果，再进行评分，得到相对的advantage

`compute_grpo_passk_outcome_advantage` passk reward， 只有最优的回答才能获得 advantage, 当组内有多个最高 advantage 时，这些回答都分配 advantage


### GDPO
`compute_gdpo_outcome_advantage`[@liu2026gdpogrouprewarddecouplednormalization]
GDPO的

Step1. Rollout的**组内**归一化为advantage
$$
A_k \gets \frac{r_k - \bar r_k}{\sigma + \varepsilon}
$$

Step2. 构建加权平均advantage， 权重的生成来源于 `grpo_reward_keys`选定
$$
A_{sum} = \sum w_k A_k
$$

Step3. 根据得到的各组之间的 average advantage 进行组间的正规化
$$
\hat A_{i,l} = \frac{A_{sum,i,l} - \mu_{batch}}{\sqrt{\sigma_{batch}^2+\varepsilon}}
$$


### RLOO
`compute_rloo_outcome_advantage` -- leave-one-out 

一组N条回答的第i条reward 是一个回答的reward 减去除去该回答的平均reward
$$
\begin{aligned}
A_i &= R_i - \frac{1}{N-1}\sum_{j\neq i} R_j\\
& = \frac{N}{N-1}R_i - \frac{1}{N-1}\sum_{j\neq i} R_j\\
& = \frac{N}{N-1}(R_i - \bar R)
\end{aligned}
$$


## Prompt 间的 advantage 计算

`compute_reinforce_plus_plus_baseline_outcome_advantage`


先计算同一prompt 内的平均奖励作为baseline,
```python
id2mean[idx] = torch.mean(torch.stack(id2score[idx]))
```

再计算相对于 baseline 的奖励偏移
```python
scores[i] = scores[i] - id2mean[index[i]]
```
再通过 masked_whiten 进行正规化

`compute_reinforce_plus_plus_outcome_advantage`



