---
title: Markov 过程
intro: RL
date: 2026-02-24
categories: 强化学习
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

记 
$$
{\mathcal{A}_s}=\left\{a\mid s\overset{a}{\to}s', \forall s'\in S_{t+1}\right\}
$$ 
为状态 $s$ 的动作空间
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


> **Policy**  智能体策略
- 宏观(全局定义)
由智能体主导的全局决策法则。在 MDP 的有向图结构中，它表现为从**状态空间**向**动作空间**发出的概率分配（边权）。它在面对环境给定的庞大图网络时，通过裁剪和概率倾斜，决定了智能体在图中游走的整体行为倾向。
- 微观(逐点定义)
智能体在状态$s$下执行某一动作$a$的概率

策略数学表达为映射$\pi : \mathcal{S}\to P(\mathcal{A})\subset [0,1]$， $\pi(a\mid s)=p(A_t=a\mid S_t=s)$，如果存在可学习的参数 $\theta$, 则表示为$\pi_\theta(a\mid s)$


对于离散动作空间，策略满足
$$
\sum_{a\in \mathcal{A}_s} \pi_\theta(a\mid s)=1
$$
对于连续动作空间，策略满足
$$
\int_{a\in\mathcal{A}_s}\pi_\theta(a\mid s)\,\mathrm{d}a=1
$$

## Value Function 价值函数
$$
v_\pi(s)=\mathrm{E}(G_t\mid S_t=s,\pi)
$$

### Q Function
Q Function 指的是在状态$S_t=s$，执行动作$A_t=a$下的价值期望函数
$$
q_\pi (s,a)=\mathrm{E}(G_t\mid S_t=s,A_t=a,\pi)=\mathrm{E}\left(\sum_{k=0}^\infty\gamma^k R_{t+k+1}\mid S_t=s,A_t=a,\pi\right)
$$

根据全概率公式，价值函数满足
$$
v_\pi(s)=\sum_{a\in \mathcal{A}_s} \pi(a\mid s)q_\pi(s,a)
$$

## Optimal Value Function 最优化价值函数

> **Optimal state-value function** 最优状态价值函数，是在所有策略中的最大状态价值函数
$$
v^\ast(s)=\max_{\pi} v_\pi (s)
$$

> **Optimal action-value function** 最优动作价值函数,是在所有策略中的最大动作价值函数
$$
q^\ast(s,a)=\max_{\pi}q_\pi (s,a)
$$

**Claim**: 解决一个 MDP 的本质就是寻找最优策略. 一旦求解出最优价值函数，我们便称该马尔可夫决策过程（MDP）得到了**解决（Solved）**

在此基础上，我们定义策略的偏序关系
$$
\pi'\geq \pi \Longleftrightarrow \forall s\in\mathcal{S},\, v_{\pi'}(s)\geq v_\pi(s)
$$
根据**Zorn Lemma**,最优策略总存在
> **Optimal policy** 最优策略
