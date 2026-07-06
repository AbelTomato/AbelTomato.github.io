---
title: 'Manacher算法'
description: '剖析处理回文串的Manacher算法应用'
pubDate: '2026-07-06'
updatedDate: '2026-07-06'
heroImage: "./hero.jpg"
tags: ["笔记", "算法"]
---

## 1.绪论

说来惭愧，直到今天才真正了解到了Manacher算法，在此之前，我处理回文子串都是直接暴力的

起因是今天补力扣周赛没做出来的最后一道题，然后得知这道题需要Manacher，所以接下来我们先看Manacher是什么样的原理

---

## 2.从模板题开始

我们先看洛谷的模板题

### P3805 【模板】Manacher

#### 题目描述

给出一个只由小写英文字符 $\texttt a,\texttt b,\texttt c,\ldots\texttt y,\texttt z$ 组成的字符串 $S$ ,求 $S$ 中最长回文串的长度 。

字符串长度为 $n$。

#### 输入格式

一行小写英文字符 $\texttt a,\texttt b,\texttt c,\cdots,\texttt y,\texttt z$ 组成的字符串 $S$。

#### 输出格式

一个整数表示答案。

#### 输入输出样例 #1

##### 输入 #1

```txt
aaa
```

##### 输出 #1

```txt
3
```

#### 说明/提示

$1\le n\le 1.1\times 10^7$。

### $Solve$

不讲原理了，我们直接看实现

对于回文串，我们知道有一个比较麻烦的点是它分为奇回文串和偶回文串，然后在代码里面做分支判断会很恶心，所以我们考虑使得所有的回文串都变成一类

给出一个回文串：

$$
\text{zyz}
$$

我们考虑对其中每个空隙都插入一个占位符，类似于 $\#$

$$
\text{\# z \# y \# z \#}
$$

可以看到，这并不影响它本身的回文特性，我们再看偶回文串

$$
\text{zyyz}
$$

同样向空隙插入占位符

$$
\text{\# z \# y \# y \# z \#}
$$

现在可以发现，偶回文串变成了奇回文串，可以证明，这样插入占位符并不会影响原串的子回文串的性质和数量

所以现在我们只需要考虑奇回文串的情况

考虑 $p_{i}$ 为以 $i$ 为中心的最长回文串的半径，即对于每个 $i$，都确定一个最长回文串 $[i - p_{i} + 1, i + p_{i} - 1]$

则只需要求出 $p_{i}$，最终的最长回文串也就出来了，我们考虑如何求解 $p_{i}$

我们设当前已知的最靠右的回文串的边界为 $r$，该回文串的中心为 $c$

则对于每个 $i$，有如下两种情况

- 当 $i \le r$ 时

这个时候，我们就可以通过回文串的性质做一点文章了

我们找到 $i$ 关于 $c$ 的对称点 $i'$，有数学关系 $i' = 2c - i$

然后显然，$p_{i'}$ 的值我们前面已经求出来了，但这和 $p_{i}$ 的求解有什么关系呢？

根据回文串的性质，它是对称的，所以在子串 $[2c - r, r]$ 内，由于我们已经知道它是回文串，所以只要在这个范围内，由 $i'$ 向两边扩展而出的回文串，在 $i$ 这里同样也是回文串

所以我们有

$$
p_{i} = \min (p_{i'}, r - i + 1)
$$

为什么要取 $\min$ ？因为要控制到那个以 $r$ 为右边界的回文串中，如果超出这个边界，就未必保证在 $i$ 这边也是回文的

- 当 $i > r$ 时

这个就没有可以偷懒的地方了，老老实实令 $p_{i} = 1$

现在我们已经得到 $p_{i}$ 的初始值了，但是这还不够，因为可能有更长的回文串存在，所以我们尝试扩展

以 $i$ 为中心，先试探下一步有没有超出边界，然后看能不能扩展，也就是两个方向上的字符是否一样

最后扩展到不能再扩展了，我们再比较 $i + p_{i} - 1$ 和 $r$ 的大小，尝试更新右边界 $r$

代码如下，看了模板之后就在洛谷的在线IDE上敲出来的，所以很潦草

```cpp
#include <iostream>
#include <string>
using namespace std;

const int MAXN = 1.1e7 + 10;
string s;
int p[MAXN * 2];
char t[MAXN * 2];

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> s;
    int idx = -1;

    for (char c: s) {
        t[++idx] = '#';
        t[++idx] = c;
    }
    t[++idx] = '#';
    
    int n = idx + 1;
    int c = 0, r = -1;
    int ans = 0;

    for (int i = 0; i < n; ++i) {
        if (i <= r) {
            int j = 2 * c - i;
            p[i] = min(p[j], r - i + 1);
        } else {
            p[i] = 1;
        }

        while (i - p[i] >= 0 && i + p[i] < n && t[i - p[i]] == t[i + p[i]]) {
            p[i]++;
        }

        if (i + p[i] - 1 > r) {
            c = i;
            r = i + p[i] - 1;
        }

        ans = max(ans, p[i]);
    }

    cout << ans - 1;
}
```

---

## 3.周赛

然后来review一下周赛

大致题意(力扣没有Markdown复制唉唉)

给你一个整数数组 `nums`。

你的任务是找出 `nums` 中一个 回文子数组 的 最大 元素和。

返回这样的子数组的 最大 元素和。

可以看到，这时候要求元素和，怎么办呢？我们同样可以利用Manacher完成，在拓展回文串长度的时候，对每个 $i$ 同时维护一个 $cur\_sum_{i}$ 和 $max\_sum_{i}$，实时更新

如果要每次遍历一遍求区间和肯定不行，所以这里考虑静态就使用前缀和预处理优化

```python
class Solution:
    def getSum(self, nums: List[int]) -> int:
        arr = []
        for x in nums:
            arr.append(0)
            arr.append(x)
        arr.append(0)

        n = len(arr)
        prefix = [0 for _ in range(n)]
        prefix[0] = arr[0]
        ans = 0

        for i in range(1, n):
            prefix[i] = prefix[i - 1] + arr[i]

        p = [1 for _ in range(n)]
        cur_sum = [arr[i] for i in range(n)]
        max_sum = [arr[i] for i in range(n)]
        c, r = 0, -1

        def get_sum(l, r):
            return prefix[r] - (0 if l - 1 < 0 else prefix[l - 1])

        for i in range(n):
            if i <= r:
                j = 2 * c - i
                p[i] = min(p[j], r - i + 1)
            else:
                p[i] = 1
            
            cur_sum[i] = get_sum(i - p[i] + 1, i + p[i] - 1)
            max_sum[i] = cur_sum[i]

            while i - p[i] >= 0 and i + p[i] < n and arr[i - p[i]] == arr[i + p[i]]:
                p[i] += 1
                cur_sum[i] = get_sum(i - p[i] + 1, i + p[i] - 1)
                max_sum[i] = max(max_sum[i], cur_sum[i])

            ans = max(ans, max_sum[i])

            if i + p[i] - 1 > r:
                c = i
                r = i + p[i] - 1

        return ans            
```
