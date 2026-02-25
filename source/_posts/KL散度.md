---
title: Markov 过程
intro: RL
date: 2026-02-24
tikzjax: true
---

# Markov Decision Process 

> 一个**Markov Desion Process**(MDP) 是一个五元组$(\mathcal{S},\mathcal{A},p,r,\gamma)$, 满足
> - $\mathcal{S}$  状态空间，是系统在每个时间步的状态集合
> - $\mathcal{A}$  动作空间，是系统在每个状态下可以采取的动作的集合
> - $p(s'\mid s, a)$ 状态转移概率，从状态$s$通过行为$a$转移到状态$s'$到概率
> - $r:\mathcal{S}\times \mathcal{A}\to \mathbb{R}=\mathbb{E}(R\mid s,a)$ 奖励函数，在状态$s$下执行行为$a$的全部奖励的期望
> - $\gamma\in[0,1]$ 衰减因子，每个时间步中的奖励衰减

MDP通常可可视化表示为一个有向图，每一个状态为一个点，所有的边的集合为动作空间$\mathcal{A}$. 边的权为奖励函数

我们记 ${\mathcal{A}_s}=\left\{a\mid s\overset{a}{\to}s', \forall s'\in S_{t+1}\right\}$ 为状态 $s$ 的动作空间
# Markov Property 
Markov特性指当前时间步的状态转移概率、奖励累计与前面时间步的对应量是相互独立的

$$
p(S_{t+1}=s', R_{t+1}=r\mid S_t,A_t )=p(S_{t+1}=s',R_{t+1}=r\mid S_t,A_t,S_{t-1},A_{t-1},\cdots)
$$
## MDP的奖励返回
- Undiscounted Return
不考虑衰减因子的总奖励
    $$
    G_t = \sum_{k=0}^{T-t-1}R_{t+k+1}
    $$
- Discounted Return 
    $$
    G_t = \sum_{k=0}^{T-t-1}\gamma^k R_{t+k+1}
    $$
- Average Return
    $$
    G_t = \frac{1}{T-t-1}\sum_{k=0}^{t+k+1}R_{t+k+1}
    $$

# Agent Policy 智能体策略
> **Goal of an RL Agent**
> 
> To find a behavior policy that maximises the expected return $G_t$
智能体策略的精神是寻找到最大的奖励


> **Policy**  指状态$s$下执行行为$a$的概率，其数学表达为映射$\pi : \mathcal{S}\times \mathcal{A}\to [0,1]$， $\pi(a\mid s)=p(s\overset{a}{\to}s')$，如果存在参数 $\theta$, 则表示为$\pi_\theta(a\mid s)$

对于离散动作空间，策略满足
$$
\sum_{a\in \mathcal{A}_s} \pi_\theta(a\mid s)=1
$$
对于连续动作空间，策略满足
$$
\int_{a\in\mathcal{A}_s}\pi_\theta(a\mid s)\,\mathrm{d}a=1
$$

## Value Function 价值函数
