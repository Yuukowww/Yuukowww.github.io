---
title: Assignment1 -- Building a Transformer LM
date: 2026-06-07
updated: 2026-06-07
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
### Linear

简单的线性层的实现，相当于实现了一个张量乘法。

在`torch`中实现乘法的方式:`torch.matmul`或者直接`@`。 在考虑张量的乘法的时候需要考虑乘法的维度对应问题

```python
def run_linear(
    d_in: int,
    d_out: int,
    weights: Float[Tensor, " d_out d_in"],
    in_features: Float[Tensor, " ... d_in"],
) -> Float[Tensor, " ... d_out"]:
    return in_features @ weights.T
```

### Embedding

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

### SwiGLU

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

计算中实现$\odot$ ，即**Hadamard积**，直接使用`A*B`



### Softmax
`Softmax`需要根据`dim`进行Tensor的切分，作为vector进行计算后再合并

为防止最大值过大导致计算指数爆炸，通常在计算时将最大值减去
$$
\begin{aligned}
\mathrm{Softmax}(x)& = \left(\frac{e^{x_i}}{\sum e^{x_j}}\right)_i\\
&=\left(\frac{e^{x_i-x_{max}}}{\sum e^{x_j - x_{max}}}\right)_i\\
&=\mathrm{Softmax}(x-x_{max})
\end{aligned}
$$

```python
def run_softmax(in_features: Float[Tensor, " ..."], dim: int) -> Float[Tensor, " ..."]:
    max_val = torch.max(in_features,dim,keepdim=True).values
    sum_val = torch.sum(torch.exp(in_feature - torch.max),dim,keepdim=True)
    return torch.exp(in_feature - max_val) / sum_val
```
`keepdim` 保证对应维度为1的axis不被压缩，仍然保留该维度。
`torch.exp`实现了Tensor逐元素的指数运算


###  Dot Self-Attention with Scaling 

$$
\mathrm{Attention}(Q,K,V) = \mathrm{Softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)\cdot V
$$

在Attention的基础上，需要考虑Q,K 的masking

```python
def run_scaled_dot_product_attention(
    Q: Float[Tensor, " ... queries d_k"],
    K: Float[Tensor, " ... keys d_k"],
    V: Float[Tensor, " ... keys d_v"],
    mask: Bool[Tensor, " ... queries keys"] | None = None,
) -> Float[Tensor, " ... queries d_v"]:
    mul = Q @ K.transpose(-2,-1) / torch.sqrt(torch.tensor(K.shape[-1]), device = K.device, dtype = K.dtype)
    if (mask is None):
        mask_mul = mul
    else:
        mask_mul = torch.mask_fill(mask,-torch.inf)
    return torch.softmax(mask_mul, dim = -1) @ V
```

需要注意的是，`torch.sqrt`只能面向Tensor进行计算，所以需要将python int 的 `d_k`转换为Tensor后再进行开根

`mask` 是一个Bool类型的Tensor，用于控制能输入Attention被“注意”的部分
$$
\text{mask}(i,j) = \begin{dcases}
-\infty &a_{i,j}\,\text{is masked}\\
0 &a_{i,j}\,\text{isn't masked}
\end{dcases}
$$
mask矩阵和scaling QK product 输出的矩阵相加

某一个项Masked后，经过Softmax就会变成$e^{-\infty} = 0$, 反之保留原本的结果

### MultiHead-Attention

多头注意力需要将输入的QKV矩阵的隐藏层平均分割为`num_heads`个，每一个Head分为`d_k = d_model / num_heads`

在初始设置通道数的时候，总保证通道数是整除隐藏层维度的，因此单个输出头的隐藏层维度总是整数

将不同输出头的Attention结果Concat，并最后经过output tensor

```python
def run_multihead_self_attention(
    d_model: int,
    num_heads: int,
    q_proj_weight: Float[Tensor, " d_model d_model"],
    k_proj_weight: Float[Tensor, " d_model d_model"],
    v_proj_weight: Float[Tensor, " d_model d_model"],
    o_proj_weight: Float[Tensor, " d_model d_model"],
    in_features: Float[Tensor, " ... sequence_length d_model"],
) -> Float[Tensor, " ... sequence_length d_model"]:
    d_k = d_model // num_heads
    Q = (in_features @ q_proj_weight).reshape(...,num_heads,d_k).transpose(-2, -3) 
    K = (in_features @ k_proj_weight).reshape(...,num_heads,d_k).transpose(-2, -3)
    V = (in_features @ v_proj_weight).reshape(...,num_heads,d_k).transpose(-2, -3)

    attn_output = run_scaled_dot_product_attention(Q, K, V)
    attn_output = attn_output.transpose(-2, -3).reshape(*in_features.shape[:-1], d_model)
    return attn_output @ o_proj_weight.T
```

### Cross-Entropy

对于输入为logits ，Target 为One-Hot 的标记Tensor, Cross-Entropy 的实现为
```python
def run_cross_entropy(
    inputs: Float[Tensor, " batch_size vocab_size"], targets: Int[Tensor, " batch_size"]
) -> Float[Tensor, ""]:
    inputs_ = run_softmax(inputs,dim=-1)
    target_tensor = inputs_[torch.arange(inputs.shape[0]),targets]
    return -torch.mean(torch.log(target_tensor))
```

即表示为
$$
\mathrm{CE}(x) = -\frac{1}{\mathcal{B}}\sum \log \mathrm{Softmax}(x_i)
$$


### RoPE

RoPE旋转编码器 {% post_link CS/LLM/position_encoding %}

```python
def run_rope(
    d_k: int,
    theta: float,
    max_seq_len: int,
    in_query_or_key: Float[Tensor, " ... sequence_length d_k"],
    token_positions: Int[Tensor, " ... sequence_length"],
) -> Float[Tensor, " ... sequence_length d_k"]:
    x = in_query_or_key
    dim_idx = torch.arange(0, d_k, 2, device = x.device, dtype = x.dtype)
    feq = 1.0 / (theta ** (dim_idx / d_k))
    angle = token_positions.to(x.dtype).unsqueeze(-1) * feq

    cos_ = torch.cos(angle)
    sin_ = torch.sin(angle)
    x_even = x[...,0::2]
    x_odd = x[...,1::2]
    out_even = x_even * cos_ - x_odd * sin_
    out_odd = x_even * sin_ + x_odd * cos_
    out = torch.empty_like(x)
    out[...,0::2] = out_even
    out[...,1::2] = out_odd
    return out
```

### Batch

将Dataset 分割为若干个batch进行训练。输出为两个`torch.Tensor` x,y

**Q**: 为什么输出x,y， 且y tensor是x tensor 后移1位

**A**: 因为自回归语言模型的训练目标是 Next Token Prediction，也就是根据当前位置之前的 token 来预测下一个 token。

```python
def run_get_batch(
    dataset: npt.NDArray, batch_size: int, context_length: int, device: str
) -> tuple[torch.Tensor, torch.Tensor]:
    max = len(dataset) - context_length
    sample = torch.randint(0,max,(batch_size,))
    x = torch.stack([torch.tensor(dataset[s : s + context_length]) for s in sample])
    y = torch.stack([torch.tensor(dataset[s + 1 : s + 1 + context_length]) for s in sample])
    return x.to(device), y.to(device)
```

`torch.randint` 本身就能直接生成Tensor int的随机张量，不需要单个随机整数生成再载入Tensor中

### Gradient Clippiing

对于给定梯度模阈值Scaling 梯度
$$
\mathrm{Scal\_ factor} = \begin{dcases}
1 & g<M\\
\frac{M}{\|g\|+\varepsilon} & g\geq M
\end{dcases}
$$

```python
def run_gradient_clipping(parameters: Iterable[torch.nn.Parameter], max_l2_norm: float) -> None:
    norm = torch.tensor(0.0)
    for p in parameters:
        norm += torch.norm(p.grad) ** 2
    total_norm = torch.sqrt(norm)
    if total_norm > max_l2_norm:
        for p in parameters:
            p.grad *= max_l2_norm / (total_norm + 10**(-6))

```


### Checkpoint Save & Load

实现模型状态的断点保存与加载,通过`torch.save`一个dict对象实现
```python
def run_save_checkpoint(
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    iteration: int,
    out: str | os.PathLike | BinaryIO | IO[bytes],
):
    torch.save(
        {
            "model": model.state_dict(),
            "optimizer": optimizer.state_dict(),
            "iteration": iteration
        },
        out
    )
```

加载就是从dict中load出来
```python

def run_load_checkpoint(
    src: str | os.PathLike | BinaryIO | IO[bytes],
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
) -> int:
    checkpoint = torch.load(src)
    model.load_state_dict(checkpoint["model"])
    optimizer.load_state_dict(checkpoint["optimizer"])
    return checkpoint["iteration"]
```
