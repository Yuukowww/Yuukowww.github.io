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


## 正则表达式库`re`的使用

## 编写过程中遇到的问题



