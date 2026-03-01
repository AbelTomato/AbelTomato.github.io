---
title: 'Educational Codeforces Round 184赛后总结'
description: 'Educational Codeforces Round 184赛后总结'
pubDate: '2025-11-16'
heroImage: "./Educational Codeforces Round 184赛后总结heroImage.jpg"
tags: ["算法竞赛","赛后总结"]
---

$1399 \rightarrow 1464$ ，又回青名了。

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/8024ac60d5cf48258e2db90d5b549fa0.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/c7bc12321de94c348c95a816123e70bd.png)


感觉差不多摸到题数的上限了，现在提升只能前面的题做快点。

## **A题**

其实这道题我赛时做复杂了，先排序然后看 $a$ 处在哪对 $v_i,v_{i+1}$ 中间，然后分别往前往后计算对应离 $a-1,a+1$ 更近的数量，又考虑到在距离相等的时候是 $Alice$ 获胜，所以还要判断 $a$ 是不是和 $v_i,v_{i+1}$ 相等，分情况讨论，并再往前往后去重。总之做得相当麻烦。

贴个代码：

```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int t;
int n;
const int maxn = 3e5 + 10;
int v[maxn];
int a;

void solve()
{
    cin >> n >> a;
    for (int i = 1; i <= n; i++)
        cin >> v[i];

    sort(v + 1, v + n + 1);

    if (a < v[1])
        cout << a + 1 << "\n";
    else if (a >= v[n])
        cout << a - 1 << "\n";
    else
    {
        for (int i = 1; i < n; i++)
        {
            if (a >= v[i] && a <= v[i + 1])
            {
                if (a != v[i] && a != v[i + 1])
                {
                    if (i <= n / 2)
                        return void(cout << a + 1 << "\n");
                    else
                        return void(cout << a - 1 << "\n");
                }
                else
                {
                    int cnt1 = 0, cnt2 = 0;
                    int j = i;
                    while (j - 1 >= 1 && v[j - 1] == v[j])
                    {
                        j--;
                        cnt1++;
                    }

                    j = i + 1;
                    while (j + 1 <= n && v[j + 1] == v[j])
                    {
                        j++;
                        cnt2++;
                    }

                    if (a == v[i] && a == v[i + 1])
                    {
                        int rem1 = i - cnt1 - 1;
                        int rem2 = n - i - cnt2 - 1;

                        if (rem1 > rem2)
                            return void(cout << a - 1 << "\n");
                        else
                            return void(cout << a + 1 << "\n");
                    }
                    else if (a == v[i])
                    {
                        int rem1 = i - cnt1 - 1;
                        int rem2 = n - i;

                        if (rem1 > rem2)
                            return void(cout << a - 1 << "\n");
                        else
                            return void(cout << a + 1 << "\n");
                    }
                    else if (a == v[i + 1])
                    {
                        int rem1 = i;
                        int rem2 = n - i - cnt2 - 1;

                        if (rem1 > rem2)
                            return void(cout << a - 1 << "\n");
                        else
                            return void(cout << a + 1 << "\n");
                    }
                }
            }
        }
    }
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> t;
    while (t--)
        solve();

    return 0;
}
```

但其实有必要这样吗？并没有。我的贪心思路是正确的，当 $b$ 取到 $a-1$ 或者 $a+1$ 的时候，可以取到最优解，显然不能取 $a$ ，因为平局是 $Alice$ 获胜。所以我们只需要两个计数器 $cnt_1,cnt_2$ 来分别计算比 $a$ 小的数和比 $a$ 大的数。如果 $cnt_1>cnt_2$ ,则答案为 $a-1$ ，否则为 $a+1$ 。

反思一下，想到正确思路的时候应该再仔细想想代码的实现，不要直接闷头去写，想想有什么地方是可以简化的。

## **B题**

这题就直接模拟枚举情况就行了。思考什么时候我们可以无限地在河上漂流，由于河的长度并非无限长，所以我们要找到一个循环。显然当"\*\*" , "><" , ">\*" , "\*<"，出现的时候，我们可以不断地重复这种循环。

然后对于非无限的情况怎么计算答案？可以看出，此时这种情况的字符串只能是像这样的："<<<<<...\*...>>>>"，所以我们只要分别从两头枚举 '<' 和 '>' 的个数，遇到不同的符号就停，如果遇到的是 '\*' 就计数加一，最终取两边的最大值即可。

# $Coding$

```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int t;
string s;

void solve()
{
    cin >> s;
    int len = s.length();

    if (s == "*")
        return void(cout << "1\n");

    for (int i = 0; i < len - 1; i++)
    {
        if ((s[i] == '>' && s[i + 1] == '<') || (s[i] == '*' && s[i + 1] == '*'))
            return void(cout << "-1\n");

        if ((s[i] == '*' && s[i + 1] == '<') || (s[i] == '>' && s[i + 1] == '*'))
            return void(cout << "-1\n");
    }

    int cnt1 = 0, cnt2 = 0;
    for (int i = 0; i < len; i++)
    {
        if (s[i] == '<')
            cnt1++;
        else
        {
            if (s[i] == '*')
                cnt1++;

            break;
        }
    }
    for (int i = len - 1; i >= 0; i--)
    {
        if (s[i] == '>')
            cnt2++;
        else
        {
            if (s[i] == '*')
                cnt2++;

            break;
        }
    }

    int ans = max(cnt1, cnt2);
    cout << ans << "\n";
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> t;
    while (t--)
        solve();

    return 0;
}
```

## **C题**

这道题的题意相当形式化，可以转化为找到一个区间 $[l,r]$ ，使得

$$
(l+r)(r-l+1)-\sum_{i=l}^{r}a_i
$$

最大。

我们考虑使用前缀和数组 $pre$ 来计算区间和，则式子转化为：

$$
(l+r)(r-l+1)-(pre_r-pre_{l-1})
$$

是不是感觉有点明朗了？再化简一下：

$$
[r(r+1)-pre_r]-[(l-1)l-pre_{l-1}]
$$

我们令 $b_i=i(i+1)-pre_i$ ，则问题就转化成找到一对 $i<j$ ，使得 $b_j-b_i$ 最大。

则我们用 $ans$ 来记录最大加成，用 $minVal$ 来记录前面的最小的 $b_i$ ，同时我们可以不用再开一个数组 $b$ ，因为每次当前的值用完就不用了，只需要每次枚举到的时候计算对应 $b_i$ 的值即可。

# $Coding$

```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <climits>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int t;
int n;
const int maxn = 2e5 + 10;
ll a[maxn];
ll pre_fix[maxn];
ll b[maxn];

void solve()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        pre_fix[i] = pre_fix[i - 1] + a[i];
    }

    ll ans = 0; // 如果最终答案为负数的话，显然没有不进行操作更优，故取ans=0
    ll min_val = 0;
    for (int i = 1; i <= n; i++)
    {
        ll cur = 1LL * i * (i + 1) - pre_fix[i];
        ans = max(ans, cur - min_val);
        min_val = min(min_val, cur);
    }

    cout << pre_fix[n] + ans << "\n";
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> t;
    while (t--)
        solve();

    return 0;
}
```

反思一下，这里我赛时实现的时候也做麻烦了，不仅用了 $b$ 数组来存储，而且甚至还记录了对应答案区间 $[l,r]$ ，并在最后重新模拟了一遍 $ans$ 的计算...其实根本没必要，还是实现能力不够，思路不够清晰。

## **D1**

这题真的卡了蛮久的，一开始想着找到某种数学上的规律从而 $O(1)$ 解决，后来发现还是太天真了。但是其实我在对处理 $x$ 次的剩余序列的相邻两项作差得到新数列的时候，发现这个数列貌似呈现某种周期性。but实在太菜了找不出规律，还是老老实实思考另外的思路。

观察对于每一次删除，我们删掉序列中序号为 $y$ 的倍数的数： $y,2y,3y,\,...\,,my$ ，这样的数在 $1$ 到 $n$ 中存在几个？显然为 $\lfloor {\frac {n}{y}} \rfloor$ 个，则剩余的数即为 $n- \lfloor {\frac {n}{y}} \rfloor$ 个。此时我们要找到序列中第 $k$ 个数，不难发现，对于更长的原序列，其删除后的剩余序列不会比比它短的序列更短，也就是说原序列的长度与删除后剩余序列的长度的函数关系具有单调性。那么对于这种关系具有单调性的问题，我们可以考虑使用二分答案来求解。

我们对原序列的长度进行二分，对于一个二分长度 $mid$ ，如果删除后的序列的长度小于 $k$ ，说明我们无法通过这样的删除得到 $k$ 个数，调整二分边界至 $[mid+1,right]$ ；反之，如果长度大于等于 $k$ ，则记录答案 $ans=mid$ ，我们删除后可以得到 $k$ 个数，现在则需要下调边界使得刚好得到 $k$ 个数。此时可能又会产生疑惑：如果我们二分得到的序列 $1$ 到 $mid$ 中最后一个数 $mid$ 刚好在某一次删除中的序号为 $y$ 的倍数，那么它被删去了，我们得到的答案会不会错误呢？是不会的，因为如果我们删去了第 $mid$ 个数，则我们可以通过下调上界至 $mid-1$ ，从而总序列长度减一，但是删去的数的个数也减一，得到的剩余序列长度不变。如此反复直到我们得到正确答案。

# $Coding$

```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int t;
ll x, y, k;
const ll maxn = 1e12;

ll del(ll siz, ll x, ll y)
{
    ll n = siz;
    for (int i = 1; i <= x; i++)
    {
        if (n < y)
            break;

        n -= n / y;
    }

    return n;
}

void solve()
{
    cin >> x >> y >> k;

    if (del(maxn, x, y) < k)
        return void(cout << "-1\n");

    ll left = 0, right = maxn;
    ll mid, ans = -1;

    while (left <= right)
    {
        mid = (left + right) >> 1;

        if (del(mid, x, y) >= k)
        {
            ans = mid;
            right = mid - 1;
        }
        else
            left = mid + 1;
    }

    cout << ans << "\n";
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> t;
    while (t--)
        solve();

    return 0;
}
```

总体时间复杂度：$O(nlogA)$ ，主要在二分枚举上。

## **D2**

这题就没那么简单了，$x$ 达到了 $1e12$ 的恐怖级别！

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/07e85b1f87d9415a9dd2bca4e12a0021.png)


所以我们真的要动用一点数学上的方法了。

考虑当前我们的序列长度为 $p$ ，则进行一次删除后，序列长度变为 $p'=p- \lfloor {\frac {p}{y}} \rfloor$ ，在 $easy\,version$ 的求解中，我们运用了二分答案，不断逼近能使删除后序列长度为 $k$ 的原序列长度 $ans$ 。那么如果我们反过来，从 $k$ 开始往前加呢？是不是当我们加到不能再增加的时候，此时的序列长度就是我们要求的 $ans$ ？这样就可以避免二分的求解过程，直接通过线性递推求解。

所以此时我们要从 $p'$ 推到 $p$ ，来看看这样推的关系式是什么。

我们先来一个比较直觉上的证明：

考虑一次删除操作，我们将原序列分成 $1$ 到 $y$ ，$y+1$ 到 $2y$ ，$2y+1$ 到 $3y$ ... $my+1$ 到 $p$ 的 $\lfloor {\frac {p}{y}} \rfloor +1$ 个块，忽略最后一块（如果存在的话），则在每一次删除后，每一块的长度由原来的 $y$ 变成 $y-1$ ，再拼接起来，成为新的序列。此时我们考虑新序列的第 $p'$ 个位置，如果要从 $p'$ 恢复到原来的长度 $p$ ，则我们很显然需要将原来删掉的数补齐，即对于每一个长度为 $y-1$ 的块，我们都要补一个数字进去，则最终我们要求的 $p,p'$ 的差就是补上的这些数字的个数，即在位置 $p'$ 之前所有完整块的块数，显然为 $\lfloor {\frac {p'-1}{y-1}} \rfloor$ 。

然后再在数学上进行一个比较严谨的证明：

对于从 $p$ 到 $p'$ ，有

$$
p'=p- \lfloor {\frac {p}{y}} \rfloor
$$

移项得：

$$
p=p'+ \lfloor {\frac {p}{y}} \rfloor
$$

记

$$
q=\lfloor {\frac {p}{y}} \rfloor
$$

则：

$$
p=p'+q
$$

同时由于：

$$
q \le \frac {p}{y} < q+1
$$

将 $p=p'+q$ 代入得：

$$
q \le \frac {p'+q}{y} < q+1
$$

整理移项得：

$$
q(y-1) \le p'-1 < (q+1)(y-1)
$$

两边同除以 $y-1$：

$$
q \le \frac {p'-1}{y-1} < q+1
$$

即说明：

$$
q= \lfloor {\frac {p'-1}{y-1}} \rfloor
$$

则关系式推出，有：

$$
p=p'+ \lfloor {\frac {p'-1}{y-1}} \rfloor
$$

设当前枚举得到的当前序列长度为 $cur$ ，则下一步得到的应为

$$
next=cur + \lfloor {\frac {cur-1}{y-1}} \rfloor
$$

但是如果只是这样枚举不断加上去，最终时间复杂度为 $O(x)$ ，显然不可行，所以我们考虑合并操作。

可以看出，对于一段连续的数，它除去 $y-1$ 并向下取整的结果是不变的，所以我们可以将所有 $q$ 相同的操作合并在一起，并计算当前最多能加到多少个 $q$ ，使得如果再对 $cur$ 除 $y-1$ 并向下取整，得到的为 $q+1$ ，形式化地，设这个步数为 $t$ ，有：

$$
cur+tq \le (q+1)(y-1)
$$

移项整理得：

$$
t= \lfloor {\dfrac {(q+1)(y-1)-cur}{q}} \rfloor +1
$$

从而我们可以在 $O(\sqrt x)$ 时间内解决问题。如果当前 $cur>1e12$ ，则说明无解。

# $Coding$

```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int t;
ll x, y, k;
const ll maxn = 1e12;

void solve()
{
    cin >> x >> y >> k;

    if (y == 1)
        return void(cout << "-1\n");

    ll cur = k;
    ll rem = x;
    while (cur <= maxn && rem > 0)
    {
        ll q = (cur - 1) / (y - 1);
        if (q == 0) // 无法再加，当前即为答案
            break;

        ll step = ((q + 1) * (y - 1) - cur) / q + 1;
        step = min(step, rem);
        cur += step * q;
        rem -= step;

        if (cur > maxn)
            return void(cout << "-1\n");
    }

    cout << cur << "\n";
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> t;
    while (t--)
        solve();

    return 0;
}
```
