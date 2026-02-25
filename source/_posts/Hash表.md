---
title: 哈希表与哈希函数
intro: Algorithm
date: 2026-02-15
tikzjax: true
---
# 哈希表


## 哈希函数
哈希函数是输入值空间$\mathcal{U}$ 到特定***Hash Value***空间$\mathcal{H}$的映射
>Hash 冲突
>
>大多数情况下，哈希表的存储存在哈希冲突现象，即Hash映射不为双射
>$$
|\mathcal{U}|> |\mathcal{H}|
>$$

```cpp
#include <unorder_map>
void add()
{
std::unorder_map<int, string> map;
}
```