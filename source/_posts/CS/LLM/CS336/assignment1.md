---
title: Assignment1 -- Building a Transformer LM
date: 2026-06-07
update: 2026-06-07
description: CS336作业1Record
categories: LLM
cover: picture/mika1.png
---

# Assignment1 -- Building a Transformer LM

本作业从最基本的全连接层出发，进行一个简单的Transformer LM 的搭建

## `torch`的一些API的用法

### 矩阵转置与对换

使用`<Tensor>.T`可以实现矩阵的转置，同样可以使用更加泛用的`<Tensor>.transpose(-2,-1)`进行维度对换

`<Tensor>.transpose(i,j)`相当于第 $i$ 维与第 $j $维进行对换


## 核心函数的实现
### `run_Linear`

简单的线性层的实现，相当于实现了一个张量乘法。

在`torch`中实现乘法的方式:`torch.matnuk`或者直接`@`。 在考虑张量的乘法的时候需要考虑乘法的维度对应问题

```python
def run_linear(
    d_in: int,
    d_out: int,
    weights: Float[Tensor, " d_out d_in"],
    in_features: Float[Tensor, " ... d_in"],
) -> Float[Tensor, " ... d_out"]:
    return in_features @ weights.T
```

### `run_embedding`

嵌入映射的函数的实现。输入的Token经过Tokenizer转换为token_ids后，通过embedding形成token的特征向量。具体的实现为查表

```python
def run_embedding(
    vocab_size: int,
    d_model: int,
    weights: Float[Tensor, " vocab_size d_model"],
    token_ids: Int[Tensor, " ..."],
) -> Float[Tensor, " ... d_model"]:
    return weights[token_ids]
```

`torch.Tensor`支持python数组的操作方式，因此可以直接通过数组读token_ids的方式输出Tensor

### `run_swiglu`

实现SwiGLU激活函数。同样是注意张量乘法维度的问题。SwiGLU的数学定义满足
$$
\mathrm{SwiGLU}(x,W_1,W_2,W_3) = W_3(\mathrm{SiLU}(W_1x)\odot W_2x)
$$
其中`SiLU`和`Sigmoid`函数为
$$
\mathrm{SiLU} = x\sigma(x) = \frac{x}{1+e^{-x}}
$$

```python
def run_swiglu(
    d_model: int,
    d_ff: int,
    w1_weight: Float[Tensor, " d_ff d_model"],
    w2_weight: Float[Tensor, " d_model d_ff"],
    w3_weight: Float[Tensor, " d_ff d_model"],
    in_features: Float[Tensor, " ... d_model"],
) -> Float[Tensor, " ... d_model"]:
    def run_silu(in_features):
        return in_features / (1+ torch.exp( - in_features))
    tensor_1 = in_features @ w1_weight.T   
    tensor_2 = in_features @ w3_weight.T   
    return (run_silu(tensor_1)* tensor_2) @ w2_weight.T
```

计算中实现$\odot$ ，即Hadamard积，直接使用`A*B`


