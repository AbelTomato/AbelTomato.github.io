---
title: 'Codeforces Round 1063 (Div. 2)赛后总结'
description: 'Codeforces Round 1063 (Div. 2)赛后总结'
pubDate: '2025-11-11'
heroImage: "./Codeforces Round 1063 (Div. 2)赛后总结heroImage.jpg"
tags: ["算法竞赛","赛后总结"]
---

这次被B和C题炸成稀碎了，4min秒了A然后坐牢1h，后面懒得想了干脆睡觉去了。

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/1f0a8c19f27b44489a0b2d6935e1e541.png)


开始补题，首先回顾一下A。

首先我们知道Kalamaki是在每个偶数回合行动，则它可以操作的下标为 $2i$ 和 $2i+1$ ，并看一下要不要交换它们。则我们显然可以发现，如果 $a_{2i} \not= a_{2i+1}$ ，Kalamaki可以做到让这两个数降序排列，从而赢得整个游戏，因为Souvlaki无法改变这个已经交换的结果。

我们可以发现为了赢，Souvlaki只能将整个序列升序排序，因为如果非升序，则Kalamaki都不需要操作就可以赢得游戏。所以我们先将整个序列排序，然后判断此时是否存在一个 $i$ ，使得 $a_{2i} \not= a_{2i+1}$ ，从而Kalamaki可以将它们交换从而赢得游戏。

## $Coding$

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
const int maxn = 110;
int a[maxn];

void solve()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> a[i];

    sort(a + 1, a + n + 1);

    for (int i = 2; i < n; i += 2)
    {
        if (a[i] != a[i + 1])
            return void(cout << "NO\n");
    }

    cout << "YES\n";
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

总体时间复杂度：$O(n)$ ，没什么好说的。

然后就来到了让我深恶痛绝的B题，评价如下：

![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/9fc6662bcf074a87aa1b0538b2594b22.png)


不是我说白了你那构造是人能想出来的吗...

来看看构造思路，我们先看一下什么情况下无解。如果 $x_i=1$ ，且 $p_i=1$ 或 $p_i=n$ ，则显然无法找到一个区间 $[l,r]$ ，使得 $l<1<r$ 或 $l<n<r$ ，此时直接输出 $-1$ ；另外，如果 $x_i=1$ 且 $i=1$ 或 $i=n$ ，则向左向右都找不到多余的数来包含它，此时也直接输出 $-1$ 。

接下来我们来证明对于剩下的所有情况，都可以找到一种通用可行的策略来使得条件满足。

我们考虑两个位置 $x,y$ ，有 $p_x=1,p_y=n$ ，则我们通过四个端点 $1,n,x,y$ 来构造对应的区间。

首先我们选取区间 $[1,x],[1,y]$ ，则对于所有的 $1<p_i<p_1$ 和 $p_1<p_i<n$ ，都可以使得 $s_i=1$ ，同理，我们选取区间 $[x,n],[y,n]$ ，对于所有的 $1<p_i<p_n$ 和 $p_n<p_i<n$ ，都可以使得 $s_i=1$ ，然后再选取区间 $[min(x,y),max(x,y)]$ ，则这个区间内的所有数 $1<p_i<n$ ，都有 $s_i=1$ ，则我们的构造就完成了。

反思一下，以后碰到排列和有关范围问题，可以考虑使用这个排列内最小的 $1$ 和最大的 $n$ 来构造求解问题，同时合理运用交集和并集关系。

## $Coding$

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
const int maxn = 2e5 + 10;
int p[maxn];
string x;
int pre_min[maxn], pre_max[maxn];
int back_min[maxn], back_max[maxn];

void solve()
{
    cin >> n;
    int pos_1, pos_n;
    for (int i = 1; i <= n; i++)
        cin >> p[i], pos_1 = (p[i] == 1 ? i : pos_1), pos_n = (p[i] == n ? i : pos_n);
    cin >> x;

    if (find(x.begin(), x.end(), '1') == x.end())
        return void(cout << "0\n");

    if (x[0] == '1' || x[n - 1] == '1')
        return void(cout << "-1\n");

    for (int i = 0; i < n; i++)
    {
        if (x[i] == '1' && (p[i + 1] == 1 || p[i + 1] == n))
            return void(cout << "-1\n");
    }

    cout << "5\n";
    cout << 1 << " " << pos_1 << "\n";
    cout << 1 << " " << pos_n << "\n";
    cout << pos_1 << " " << n << "\n";
    cout << pos_n << " " << n << "\n";
    cout << min(pos_1, pos_n) << " " << max(pos_1, pos_n) << "\n";
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

总体时间复杂度：$O(n)$ ，直接扫一遍序列。

C题，这位更是重量级，不过感觉比B题好一点。

我们先固定 $l$ ，看看此时 $r$ 有什么性质。假设区间 $[l,r]$ 是“好的”，由于 $[l,r] \subset [l,r+1]$ ，则我们可以推得 $[l,r+1]$ 也是好的。其实也很明显，当你扩大范围的时候，$b$ 中出现 $1$ 的个数只会更多而不会减少，所以对于原来存在的路径在扩大范围后依然存在。

则我们可以设 $r_l$ 为使 $[l,r]$ 为“好的”的最小的 $r$ ，此时再减小 $r$ 就会使路径被截断。则 $r+1,r+2,r+3,\,...\,,2n$ 都是可以和 $l$ 配对的选择，所以此时满足条件的 $(l,r)$ 的个数为 $2n-r_l+1$ 。

而且我们又可以看出来，若有 $l_1<l_2$ ，则 $r_{l_1} \le r_{l_2}$ ，这个可以根据集合的大小关系推出来：若有 $r_{l_1} > r_{l_2}$ ，则又 $[l_2,r_{l_2}] \subset [l_1,r_{l_2}]$ ，故 $r_{l_2}$ 也为满足条件的 $r$ ，可以与 $l_1$ 配对，但这与 $r_{l_1}$ 的最小性矛盾，故 $r_{l_1} \le r_{l_2}$ 。

OK此时我们可以看出来随着 $l$ 的增大，$r$ 是只增不减的，具有单调性，所以我们很容易就想到可以使用双指针来维护这个 $l,r$ 移动的过程。

但是又有一个难点就是我们应该怎么判断对于每个 $(l,r)$ 的连通性呢？题目提到了一个很关键的性质：我们只能向下或者向右走，而此时又根据只有两行的这个特殊性质，所以我们至多只会向下走一次。我们设第一行第一个“截断点”即出现 $0$ 的位置为 $a$ ，第二行出现的最后一个“截断点”的位置为 $b$ ，则我们如果要保证连通，就要使 $a-1>b$ ，即存在一列 $j$ ，使得 $a_{1,j},a_{2,j}$ 均为 $1$ 且分别和第一行的开头以及第二行的末尾连通。

具体的我们可以怎么维护呢？考虑到我们需要维护的是此时第一行值为 $0$ 的列和第二行值为 $0$ 的列的集合，又需要根据 $l,r$ 的移动来频繁插入和删除，且这个需要插入和删除的列的序号可能是不连续的，所以我们使用STL中的 $set$ 容器来维护这个过程。

具体的，由于 $\forall a_{i,j},1 \le a_{i,j} \le 2n$ ，所以我们可以根据 $a_{i,j}$ 的值来存储对应的下标，同时使用两个 $set$ $s1,s2$ 来分别维护第一行和第二行未被加入的列的序号。因此当我们移动 $l,r$ 时，可以根据 $l,r$ 的值来确定对应的坐标 $(i,j)$ 有哪些，然后进行插入或删除，同时判断当前这个 $r$ 是否满足条件，若满足条件则进行计数，并将 $l$ 向右移动。

## $Coding$

```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <set>
#include <climits>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int t;
int n;
const int maxn = 2e5 + 10;
const int INF = INT_MAX;
int a[3][maxn];

void solve()
{
    cin >> n;
    vector<vector<pair<int, int>>> pos(2 * n + 1);
    for (int i = 1; i <= 2; i++)
    {
        for (int j = 1; j <= n; j++)
        {
            cin >> a[i][j];
            pos[a[i][j]].push_back({i, j});
        }
    }

    vector<set<int>> st(3);
    st[1].insert(INF); // 防止空集时取begin和rbegin导致错误，减少空集判断的代码，更加简洁
    st[2].insert(-INF);
    for (int i = 1; i <= n; i++)
        st[1].insert(i), st[2].insert(i);

    auto add = [&](int val)
    {
        for (auto [i, j] : pos[val])
            st[i].erase(j);
    };

    auto del = [&](int val)
    {
        for (auto [i, j] : pos[val])
            st[i].insert(j);
    };

    auto check = [&]()
    {
        if (st[1].count(1) || st[2].count(n))
            return false;
        if (*st[1].begin() - 1 <= *st[2].rbegin())
            return false;

        return true;
    };

    ll ans = 0;
    ll r = 0;
    for (ll l = 1; l <= 2 * n; l++)
    {
        while (r + 1 <= 2 * n && !check())
            add(++r);

        if (!check()) // 如果此时还是不满足条件，则后面的l都不可能满足条件了，直接退出循环
            break;

        ans += 2 * n - r + 1;
        del(l);
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

整体时间复杂度：$O(nlogn)$ ，主要在移动 $l,r$ 和 $set$ 的插入、删除上。

好了后面的题目就不补了，超出能力范围了。

大概总结一下，这次可以看出我的构造能力还是太差，唉唉，然后STL用得也不够熟，至少C题这种使用方式是我之前基本从来没有用过的。应当反省，分析问题时要找出问题的特殊性，然后从特殊性入手来求解。
