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
        vocab[len(vocab)] = special_token.encode("utf-8")  # 将utf-8 编码的special_token 存入vocab
    special_pattern = "|".join(regex.escape(token) for token in sorted(special_tokens,key = len, reverse = True)) # regex.escape 将特殊符号转换为合法字符而不是正则表达式的一部分；"|" 表示或，将special_token并列； 将 special_tokens降序排列，防止短字符串先匹配
    chuns = regex.split(special_pattern,text) # 按照special_pattern 进行字符串分割
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

将预编译的分词模式进行字符串切割
```python
word_counts = {}
    for chunk in chunks:
        for match in pat.finditer(chunk):       # 在chunk中，通过正则模式生成不重叠的匹配项，迭代返回每一个符合的match
            token = tuple(bytes([b]) for b in match.group().encode("utf-8")) # 将match对象转换为bytes类型， match.group() 用于提取match的实际文本字符串
            word_counts[token] = word_counts.get(token, 0) + 1  # 统计词频
```
字符串分割阶段，`word_counts`存储了每一个词字符串的词频信息

BPE训练阶段, 生成相邻的元素对，合并最大词频的元素对`best_pair`
```python
 merges = []
    while len(vocab) < vocab_size:
        # 生成元素对
        pair_counts = {}
        for word, count in word_counts.items():
            for pair in zip(word, word[1:]):
                pair_counts[pair] = pair_counts.get(pair, 0) + count

        if not pair_counts:
            break
        # 生成元素对并合并
        best_pair = max(pair_counts.items(), key=lambda item: (item[1], item[0]))[0]
        new_token = best_pair[0] + best_pair[1]
        merges.append(best_pair)
        vocab[len(vocab)] = new_token
        # 统计合并后的词串与合并关系，存入vocab 与 merge表
        new_word_counts = {}
        for word, count in word_counts.items():
            new_word = None
            i = 0
            while i < len(word):
                if i < len(word) - 1 and (word[i], word[i + 1]) == best_pair:
                    if new_word is None:
                        new_word = list(word[:i])
                    new_word.append(new_token)
                    i += 2
                else:
                    if new_word is not None:
                        new_word.append(word[i])
                    i += 1
            if new_word is None:
                new_word_counts[word] = new_word_counts.get(word, 0) + count
            else:
                new_word = tuple(new_word)
                new_word_counts[new_word] = new_word_counts.get(new_word, 0) + count
        word_counts = new_word_counts
```

完整训练代码
```python
def train(
    input_path: str | os.PathLike,
    vocab_size: int,
    special_tokens: list[str],
    **kwargs,
):
    with open(input_path, encoding="utf-8") as f:
        text = f.read()

    vocab = {i: bytes([i]) for i in range(256)}
    

    if special_tokens:
        for special_token in special_tokens:
            vocab[len(vocab)] = special_token.encode("utf-8")
        special_pattern = "|".join(regex.escape(token) for token in sorted(special_tokens, key=len, reverse=True))
        chunks = regex.split(special_pattern, text)
    else:
        chunks = [text]

    pat = regex.compile(r"""'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+""")
    word_counts = {}
    for chunk in chunks:
        for match in pat.finditer(chunk):
            token = tuple(bytes([b]) for b in match.group().encode("utf-8"))
            word_counts[token] = word_counts.get(token, 0) + 1

    merges = []
    while len(vocab) < vocab_size:
        pair_counts = {}
        for word, count in word_counts.items():
            for pair in zip(word, word[1:]):
                pair_counts[pair] = pair_counts.get(pair, 0) + count

        if not pair_counts:
            break
        
        best_pair = max(pair_counts.items(), key=lambda item: (item[1], item[0]))[0]
        new_token = best_pair[0] + best_pair[1]
        merges.append(best_pair)
        vocab[len(vocab)] = new_token

        new_word_counts = {}
        for word, count in word_counts.items():
            new_word = None
            i = 0
            while i < len(word):
                if i < len(word) - 1 and (word[i], word[i + 1]) == best_pair:
                    if new_word is None:
                        new_word = list(word[:i])
                    new_word.append(new_token)
                    i += 2
                else:
                    if new_word is not None:
                        new_word.append(word[i])
                    i += 1
            if new_word is None:
                new_word_counts[word] = new_word_counts.get(word, 0) + count
            else:
                new_word = tuple(new_word)
                new_word_counts[new_word] = new_word_counts.get(new_word, 0) + count
        word_counts = new_word_counts

    return vocab, merges

```


## 正则表达式库`re`与`regex`的使用

## 遇到的问题



