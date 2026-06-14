---
title: BPE-tokenizer
date: 2026-06-12
update: 2026-06-12
categories: LLM
description: CS336 作业1中关于Tokenizer的学习记录
cover: picture/isekaijoucho1.jpg
---

# BPE - Tokenizer

## BPE的基本观念

BPE Tokenizer 是将单个单词拆分为若干个子块进行tokenizer的方式，会训练一个Tokenizer Merge 表用于规定如何进行单个字母合并为子块，并训练一个token string子块与token id空间的映射表`vocab`以实现将字符转换为`int`类型的token id

BPE 需要考虑一些Special token，它们是不可分token string单元，每一个作为整体映射到token id. 比如 `"<|endoftext|>"`


### BPE Merge 表的训练

BPE 基于字符合并而贪心算法进行`vocab`和 `Merge`表 

假设Tokenizer 训练集为
```
We</w> *20
are</w> *12
the</w> *3
world</w> *9
```

拆分为字频
```
W e </W> *22
a r e </w> *12
t h e </w> *3
w o r l d </w> *9
```

```
</w> *44
e    *35
w    *29
r    *21
a    *12
o    * 9
l    * 9
d    * 9
t    * 3
h    * 3
```



Top-2 字频的字为 `w` 和 `e`， 将这两个字进行**有序**的合并
```
we </w> *22
a r e </w> *12
t h e </w> *3
w o r l d </w> *9
```
更新字频表

```
</w>  *44
we   *22
r    *21
a    *12
o    * 9
l    * 9
d    * 9
e    * 6
t    * 3
h    * 3
```

此时可合并的Top-2 字频为`r` 与 `a`
```
we </w> *22
ar e </w> *12
t h e </w> *3
w o r l d </w> *9
```
更新词频表
```
</w>  *44
we   *22
ar   *12
r    * 9
o    * 9
l    * 9
d    * 9
e    * 6
t    * 3
h    * 3
```

以此方式迭代直到达到设定的合并上限
## 正则表达式库`re`的使用

## 遇到的问题



