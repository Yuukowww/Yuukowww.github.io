---
title: 串的模式匹配与KMP算法
date: 2026-03-31
tag: [数据结构,算法]
categories: 算法
description: KMP算法的数学与代码实现
cover: picture/34.png
---


# 问题定义
子串的定位称为串的**模式匹配**，称子串T为**模式串**。

在串中匹配子串的最朴素的想法是移动子串头指针进行一一比对

```cpp
// 起始点pos后的首个子串结束位置
int Index(std::string S, std::string T, int pos){
    int i = pos;
    int j = 0;
    while ( i <= S[0] && j <= T[0]){
        if ( S[i] == S[j] ){
            ++i;
            ++j;
        }
        else{
            i = i-j+1;
            j = 0;
        }
    }
    if ( j > T[0]){
        return i - T[0];
    }
    else return 0;
}
```
对于前序相同部分过长的串，这个算法的时间复杂度开销过大。比如对于模式串`0001`与主串`00000001`,需要反复遍历子串，时间复杂度为 $\mathcal{O}(m\times n)$

## 前缀函数

> **串的前缀与后缀**
>
>  对于串 $s[0,\cdots,n]$, 记 $\varphi_k(s)=[0,\cdots,k-1]$为前缀, 记 $\psi_k(s)=[n-k+1,\cdots,n]$为后缀
 
**前缀函数**定义为串$s$的前i段子串的最长的真前缀与真后缀相等的长度
$$
\pi[i](s) = \begin{dcases}
0 & i = 0\\
\max_{k}\{k : \varphi_k(s)=\psi_k(s)\} & i\neq 0
\end{dcases}
$$
$$
\pi(s) = [\pi(i)[s]]
$$

比如对于字符串`s[acbac]`,它的前缀函数为
- $\pi[0]=0$
- $\pi[1] = 0$, 因为`ac`没有相等的真前缀/后缀
- $\pi[2] = 0$, 因为`acb`没有相等的真前缀/后缀
- $\pi[3] = 1$, 因为`acba`有相等的真前缀与后缀`a`
- $\pi[4] = 2$, 因为`acbac`有相等的真前缀与后缀`ac`

因此 $\pi(s)=[0,0,0,1,2]$








根据这个思路实现前缀函数
```cpp
#include<vector>
using namespace std;

int prefix_func_item(string s, int i){
    int res = -1;
    int n = (int) s.length();
    for (int j = i; j >= 0; j--){
            if (s.substr(0,j) == s.substr(i-j+1,j)){
                res = j;
                break;
            }
        }
    return res;
}

vector<int> prefix_func(string s){
    int n = (int) s.length();
    vector<int> pi(n);
    for (int i = 0; i < n; i++){
        pi[i] = prefix_func_item(s,i);
    }
    return pi;
}
```
`prefix_func_item`的时间复杂度 $\mathcal{O}(n^2)$,`prefix_func`的时间复杂度为$\mathcal{O}(n)$，总时间复杂度为$\mathcal{O}(n^3)$, 开销巨大，需要进行优化

### 优化
当`prefix_func` 遍历到$i$个元素的子串的时候，子串尾部添加元素，对前缀函数值的影响有三种可能
1.  $+1$ 当添加的正好是前一位前缀函数指定的前缀的后一位元素 (比如`abca` -> `abcab`)。 翻译为数学语言: 满足$s[i+1] = s[\pi[i](s)]$时, $\pi[i+1] = \pi[i]+1$
2.  $-$ 当添加的元素破坏了前缀匹配 (比如`abca` -> `abcac` / `acbac` -> `acbaca`)
3.  $=$ 保持不变

#### 优化1
根据情况1分析，前缀函数实际比对的是前缀段与后缀段的一小部份的子串，中间的子串段可以不遍历。而这个片段的长度上界由情况1给出 -- $\pi[i-1]+1$
```cpp
#include<vector>
#include<string>
using namespace std;

vector<int> prefix_func(string s){
    int n = (int) s.length();
    vector<int> pi(n);
    for (int i = 0; i < n ; i++){
        for (int j = pi[i-1]+1 ; j > 0 ; j--){
            if (s.substr(0,j) == s.substr(i-j+1,j)){
                res = j;
                break;
            }
        }
    } 
    return pi;
}
```
#### 优化2
当$s[i+1]\neq s[\pi[i]]$时，前缀函数的值肯定是减少的。当子串的前缀与后缀相同的时候，可能存在子前缀与子后缀作为更小的相同片段。计算下一位前缀函数时，如果下一个元素与最大前缀的后一位元素不匹配 (即$s[i+1]\neq s[\pi[i]]$时), 能寻找子前缀的后一位元素分析是否匹配。


子前缀的计算是递归的。对于第$n$阶子前缀的长度$j^{(n)}$，根据上面的分析有
$$
j^{(n)} = \pi(j^{(n-1)}-1)
$$

> 例子
>
> 子串`s[abcabaacabcab]`相同的前缀段与后缀段为`abcab`,更小的子前缀/后缀段为`ab`(子前缀的是前缀段的相同的前缀/后缀串)。
> - 当下一位元素为`a`, 符合$s[i+1]= s[\pi[i]]$, $\pi[i+1] = \pi[i]+1 = 6$
> - 当下一位元素不为`a`时,符合$s[i+1]\neq s[\pi[i]]$, 子前缀串`ab`的下一位元素为`c`。如果子串的下一位元素为`c`则前缀函数$\pi[i+1] = \max_{n}\{j^{(n)}+1: s[j^{(n)+1}] = s[i+1]\}$

#### 实现
```cpp
#include<vector>
#include<string>
using namespace std;
vector<int> prefix_func(string s){
    int n = (int) s.length();
    vector<int> pi(n);
    for (int i = 1; i < n; i++) {
        int j = pi[i - 1];
        while (j > 0 && s[i] != s[j]) {
            j = pi[j - 1];
        }
        if (s[i] == s[j]){
            j++;
        }
        pi[i] = j;
    }
    return pi;
}
```
前缀函数的时间复杂度优化到了$\mathcal{O}(n)$

## KMP算法
对于串 $s$ 与待检测子串 $t$, 只需要将待检测子串 $t$ 作为前缀进行后缀匹配就可以实现子串匹配。

```cpp
#include<string>
#include<vector>
using namespace std;
vector<int> KMP(string text, string pattern){
    string cur = pattern + '#' + text;
    int s1 = text.size();
    int s2 = pattern.size();
    vector<int> res;
    vector<int> pf = prefix_function(cur);
    for ( int i = s2+1 ; i <= s1+s2; i++ ){
        if (pf[i] == s2){
            res.push_bach(i - 2*s2);
        }
    }
    return res;
}
```
KMP算法只用$\mathcal{O}(m+n)$的时间复杂度实现了子串在全串的匹配

