---
title: Johnson–Lindenstrauss 引理
intro: 数据压缩与降维
date: 2026-02-15
categories: 数据处理
tikzjax: true
---

# Johnson-Linderstrass 引理




> **Johnson-Linderstrauss** 引理
>
> 对于$N$个$d$ 维向量构成的集合 $A=\left\{x_1,x_2,\cdots,x_N\in \mathbb{R}^d\right\}$, $\forall \varepsilon\in (0,1) $, $\exists f: \mathbb{R}^d\to\mathbb{R}^k $, 满足
>
>$$
(1-\varepsilon)\|x_i-x_j\|^2\leq \|f(x_i)-f(x_j)\|^2\leq (1+\varepsilon)\|x_i-x_j\|^2
>$$
>其中
>$$
k\geq \frac{24\log N}{3\varepsilon^2-2\varepsilon^3}\simeq O(\frac{\log N}{\varepsilon^2})
>$$
$\mathrm{Proof:}$

{% post_link 随机矩阵 %}

证明主要基于**Cramér-Chernoff方法**

取 $\mathbf{u}\in \mathbb{R}^d$, $R_{ij}\overset{i.i.d}{\sim}\mathcal{N}(0,1)$, 随机投影向量 $\mathbf{v}=\frac{1}{\sqrt{k}}R\cdot \mathbf{u}$

根据随机矩阵期望保距
$$
\mathbb{E}[\|\mathbf{v}\|^2]=\|\mathbf{u}\|^2
$$

取 $X=\frac{\sqrt{k}}{\|\mathbf{u}\|}\mathbf{v}=\frac{1}{\|\mathbf{u}\|}R\cdot \mathbf{u}$, $x=\sum_{i=1}^k x_i^2 =\frac{k\|\mathbf{v}\|^2}{\|\mathbf{u}\|^2}\sim \chi^2(k)$
$$
\begin{aligned}
\mathbb{E}[e^{\lambda x_i^2}]&=\int_{-\infty}^{+\infty}e^{\lambda x_i^2}\frac{1}{\sqrt{2\pi}}e^{-\frac{x_i^2}{2}}\,\mathrm{d}x_i=\sqrt{\frac{1}{1-2\lambda}}
\end{aligned}
$$
一方面
$$
\begin{aligned}
P[\|\mathbf{v}\|^2\geq(1+\varepsilon)\|\mathbf{u}\|^2]&=P[x\geq(1+\varepsilon)k]\\
&=P[e^{\lambda x}\geq e^{\lambda(1+\varepsilon)k}]\\
&\leq \inf_{\lambda\geq 0}\frac{\mathbb{E}[e^{\lambda x}]}{e^{\lambda(1+\varepsilon)k}}\\
&=\inf_{\lambda\geq 0}\frac{\prod_{i=1}^k\mathbb{E}[e^{\lambda x_i^2}]}{e^{\lambda(1+\varepsilon)k}}\\
&=\inf_{\lambda \geq 0}\left(\frac{1}{\sqrt{1-2\lambda}\,e^{\lambda(1+\varepsilon )}}\right)^k\\
&=\left[(1+\varepsilon)e^{-\varepsilon}\right]^{\frac{k}{2}}\\
&=\exp\left(\frac{k}{2}(-\varepsilon+\log(1+\varepsilon))\right)\\
&\leq\exp\left(\frac{k}{2}\left(-\frac{\varepsilon^2}{2}+\frac{\varepsilon^3}{3}\right)\right)
\end{aligned}
$$
当 $\dfrac{k}{2}\left(-\dfrac{\varepsilon^2}{2}+\dfrac{\varepsilon^3}{3}\right)<-2\log N$, 即 $ k> \dfrac{24\log N}{3\varepsilon^2-2\varepsilon^3}$ 时，满足
$$
P\left[\|\mathbf{v}\|^2\geq (1+\varepsilon)\|\mathbf{u}\|^2\right]\leq N^{-2}
$$
因此
$$
P\left[\|\mathbf{v}^2\|\leq (1+\varepsilon)\|\mathbf{u}\|^2\right]\geq 1-N^{-2}
$$
另一方面
$$
\begin{aligned}
P\left[\|\mathbf{v}\|^2\leq(1-\varepsilon)\|\mathbf{u}\|^2\right]&=P\left[x\leq (1-\varepsilon)k\right]\\
&=P\left[e^{-\lambda x}\geq e^{-\lambda(1-\varepsilon)k}\right]\\
&\leq \inf_{\lambda\geq 0}\frac{\mathbb{E}[e^{-\lambda x}]}{e^{-\lambda(1-\varepsilon)k}}\\
&=\inf_{\lambda\geq 0} \frac{\prod_{i=1}^k\mathbb{E}\left[e^{-\lambda x_i^2}\right]}{e^{-\lambda (1-\varepsilon )k}}\\
&=\inf_{\lambda \geq 0}\left(\frac{1}{\sqrt{1+2\lambda}\,e^{-\lambda(1-\varepsilon )}}\right)^k\\
&= \left[(1-\varepsilon)e^{\varepsilon}\right]^{\frac{k}{2}}\\
&= \exp\left(\frac{k}{2}\left(\varepsilon+\log(1-\varepsilon)\right)\right)\\
&\leq \exp \left(-\frac{k\varepsilon^2}{4}\right)
\end{aligned}
$$
当 $-\dfrac{k\varepsilon^2}{4}\leq -2\log N $ 时，即 $k\geq \dfrac{8\log N}{\varepsilon^2}$
$$
P\left[\|\mathbf{v}\|^2\leq(1-\varepsilon)\|\mathbf{u}\|^2\right]\leq N^{-2}
$$
即
$$
P\left[\|\mathbf{v}\|^2\geq(1-\varepsilon)\|\mathbf{u}\|^2\right]\geq 1- N^{-2}

$$
当
$$
k\in \left\{k\geq\frac{24\log N}{3\varepsilon^2-2\varepsilon^3}\right\}\cap \left\{k\geq\frac{8\log N}{\varepsilon^2}\right\}=\left\{k\geq\frac{24\log N}{3\varepsilon^2-2\varepsilon^3}\right\}
$$
满足
$$
P\left[\|\mathbf{v}\|^2\not \in\left[(1-\varepsilon)\|\mathbf{u}\|^2,(1+\varepsilon)\|\mathbf{u}\|^2\right]\right]\leq \frac{2}{N^2}
$$
进一步
$$
\forall x_i, x_j\in A，P\left[\|f(x_i)-f(x_j)\|^2\not \in\left[(1-\varepsilon)\|x_i-x_j\|^2,(1+\varepsilon)\|x_i-x_j\|^2\right]\right]\leq\frac{2}{N^2}
$$ 
由**Boole不等式**，遍历集合$A$的二元向量组
$$
P(\cup E_i)\leq\sum P(E_i)\leq\frac{N(N-1)}{2}\frac{2}{N^2}=1-\frac{1}{N}
$$
由此可以得出，当 $k\geq\dfrac{24\log N}{3\varepsilon^2-2\varepsilon^3}$时，将整个 $A$ **几乎保距**映入低维空间的映射$f$存在的概率不为0

