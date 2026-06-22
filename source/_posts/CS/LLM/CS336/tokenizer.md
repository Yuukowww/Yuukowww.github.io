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

BPE 基于字符合并而贪心算法生成`vocab`和 `Merge`表 

首先，tokenizer通常会视一些固定的字符串为`special_tokens`，这些字符串是不可分且唯一编码的单位，通常先将`special_tokens`筛选出来。

```python
vocab = {i: bytes([i]) for i in range(256)}
if special_tokens:
    for special_token in special_tokens:
        vocab[len(vocab)] = special_token.encode("utf-8")  // 将utf-8 编码的special_token 存入vocab
    special_pattern = "|".join(regex.escape(token) for token in sorted(special_tokens,key = len, reverse = True)) // regex.escape 将特殊符号转换为合法字符而不是正则表达式的一部分；"|" 表示或，将special_token并列； 将 special_tokens降序排列，防止短字符串先匹配
    chuns = regex.split(special_pattern,text) // 按照special_pattern 进行字符串分割
else:
    chunks = [text]
```
GPT-2形式的tokenizer 会将某些特定类型的字符串形式预编译
```python
pat = regex.compile(
    r"""'(?:[sdmt]|ll|ve|re)| 
    ?\p{L}+|
     ?\p{N}+| 
     ?[^\s\p{L}\p{N}]+|
     \s+(?!\S)|
     \s+"""
    )
```
`'(?:[sdmt]|ll|ve|re)` 用于匹配 's 'd 'm 't 'll 've 're 这样的abbreviation, 比如 you're 就会被拆为 `you` `'re`

`?\p{L}+` 用于字符串的匹配, `?`表示字符串前可选的空格, 以实现语句匹配时的空格，比如`hello world` 匹配为`hello` 与` world`

`?\p{N}+` 用于数字串的匹配

`?[^\s\p{L}\p{N}]+` 表示非空、非字符串与非数字串的对象，比如😈。 `[^ ]`表示取反， `\s`表示空字符匹配， 对象并列即表示或运算

`\s+(?!\S)`表示匹配尾部空白，`\s+`表示多个空字符，`(?!\S)` 中 `\S`表示非空字符， `(?| ...)`表示不能匹配后面的东西，也就是匹配尾部空白

`\s+` 表示剩余的空白匹配
## 正则表达式库`re`与`regex`的使用

## 遇到的问题



