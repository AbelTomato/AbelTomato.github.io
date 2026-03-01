---
title: '第十一届中国大学生程序设计竞赛 哈尔滨站（CCPC 2025 Harbin Site）赛后总结（VP）'
description: '第十一届中国大学生程序设计竞赛 哈尔滨站（CCPC 2025 Harbin Site）赛后总结（VP）'
pubDate: '2025-11-22'
heroImage: "./第十一届中国大学生程序设计竞赛 哈尔滨站（CCPC 2025 Harbin Site）赛后总结（VP）heroImage.jpg"
tags: ["算法竞赛","赛后总结"]
---

题目界面：[CCPC 2025 Harbin Site](https://qoj.ac/contest/2575)

周末和队友VP了这场ccpc，结果被打得相当惨，最终结果是三个小时做出来四题，然后开始摆烂。

大概总结反思一下。

## **A题**

一道我最头疼的数论，偏偏它还是签到题不得不做，于是VP的时候痛苦抓狂...

分析一下题意，要求我们求最大的所有大小为 $k$ 的子集和的 $gcd$ 的最大值，形式化地则有：

$$
gcd(S_1,S_2,\,...\,,S_m)
$$

如果我们要对一大堆正整数求 $gcd$ ，则我们可以将问题转化为其中任意两个整数的差值的 $gcd$ 与其中任意一个整数的 $gcd$ 。

这个结论是由 $gcd(a,b)=gcd(a,a-b)$ 推广而来的，通过这样的处理，我们有：

$$
gcd(a,b,c)=gcd(a,a-b,a-c)
$$

从而进一步的：

$$
gcd(x_1,x_2,\,...\,,x_n)=gcd(x_1,x_1-x_2,x_1-x_3,\,...\,,x_1-x_n)
$$

可以理解为，将其中的任意一个数平移，不会影响整个 $gcd$ 的值，所以我们可以通过这样类似差分的处理来将问题转化为求：

$$
gcd(S_1,S_2-S_1,\,...\,,S_m-S_1)
$$

考虑到对于其中的任意一个大小为 $k$ 的子集，它是由 $a_1,a_2,a_3,\,...\,,a_n$ 线性组合而成的，形式化地，即：

$$
S=p_1a_1+p_2a_2+\,...\,+p_na_n
$$

而此时我们将两个子集的和作差，则有

$$
S-S'=q_1(a_1-a_2)+q_2(a_1-a_3)+q_3(a_2-a_3)+\,...\,+q_l(a_i-a_j)+\,...
$$

即对于任意两个子集和的差，它是 $\frac {n(n-1)}{2}$ 对 $a_i-a_j$ 的线性组合。

而对于任意的 $a_i-a_j$ ，有 $a_i-a_j=(a_i-a_1)-(a_j-a_1)$ ，从而我们可以将其化简为 $n-1$ 个差值的线性组合。

那我们可以怎么通过这 $n-1$ 个差来组合形成这么多不同的子集呢？显然我们可以知道，必然有一个集合，设为 $S_1=ka_1$ ，则其他的所有集合都可以表示为 $S_i=S_1+\sum_{j=2}^{n}q_j(a_j-a_1)$ ，我们考虑构造 $d=gcd(a_2-a_1,a_3-a_1,\,...\,,a_n-a_1)$ ，则所有子集和在模 $d$ 的意义下与 $ka_1$ 同余，显然有 $S_i=m_id+ka_1$ 成立。

则我们在模类 $d$ 下有同余系：

$$
S=\sum x_i \equiv ka_1 (mod \quad d)
$$

其中 $x_i$ 为我们选取的元素。

即选取任意两个子集 $S_i,S_j$ ，它们的差一定是 $d$ 的倍数。

所以我们有：

$$
gcd(S_1,S_2-S_1,\,...\,,S_m-S_1)=gcd(d,ka_1)
$$

其中 $ka_1$ 表示的是 $S_1$ ，而 $d$ 表示的是剩下的子集和之差的 $gcd$ 。

所以问题转化为了求 $gcd(d,ka_1)$ 的最大值，显然根据 $gcd$ 的定义，这个最大值应当小于等于 $d$ 。那么什么时候能使得 $gcd(d,ka_1)=d$ 呢？考虑整除的性质，我们有：

$$
ka_1=hd(h \in \mathbb {N^+})
$$

即

$$
d|ka_1
$$

此时我们设 $gcd(d,a_1)=g$ ，则 $d=gd',a_1=ga_1'$ ，代入得：

$$
gd'|kga_1'
$$

两边同除 $g$

$$
d'|ka'
$$

由于 $d',a'$ 互质，则有：

$$
d'|k
$$

则

$$
\frac {d}{gcd(d,a_1)} | k
$$

则我们最终要找的最小 $k$ 即为：

$$
k_{min}=\frac {d}{gcd(d,a_1)}
$$

同时所求的最大 $f(k)=d$ 。

当什么情况 $f(k)$ 没有上界呢？即为 $d=0$ ，所有的 $a_i$ 均相等的情况。

总结一下，像这类提到了求一堆正整数和的 $gcd$ 的情况，可以将其转化为它们两两之差的 $gcd$ ，这是一个经典理论：所有可能的线性组合的 $gcd$ = 基底差值的 $gcd$ 。然后通过构造同余类进行求解。

再顺一遍流程：构造差分 $\rightarrow$ 得到差值的 $gcd \rightarrow$ 模 $d$ 同余 $\rightarrow$ 求最小 $k$ 。

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
int n;
const int maxn = 1e5 + 10;
ll a[maxn];
ll diff[maxn];

ll gcd(ll a, ll b)
{
    return b ? gcd(b, a % b) : a;
}

void solve()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> a[i];

    sort(a + 1, a + n + 1);
    ll d = 0;
    for (int i = 2; i <= n; i++)
    {
        d = gcd(d, a[i] - a[1]);
    }

    if (d == 0)
        return void(cout << "infinite\n");

    ll k_min = d / gcd(d, a[1]);
    cout << d << " " << k_min << "\n";
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

## **L题**

这题的话，赛时我想到的是枚举方案+多源 $bfs$ ，因为 $k$ 比较小，只有 $10$ ，且 $n,m$ 也只有 $100$ ，所以感觉 $bfs$ 完全可行。事实上也确实过了，~~（一开始写成枚举 $n$ 遍单源 $bfs$ T了半天）~~ 。

具体的，我们考虑枚举 $2^k$ 种方案，对于每种方案我们规定了只能从每个格子上面或下面绕过去。然后将第一列的所有点加入 $bfs$ 的队列中，然后扫一遍，如果到不了就为 $-1$ ，否则取最短路径。

# $Coding$


```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <unordered_map>
#include <queue>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int t;
int n, m;
const int maxn = 110;
int k;
int mp[maxn][maxn];
int dx[5] = {1, -1, 0};
int dy[5] = {0, 0, 1};
int flag[maxn];
int col_to_idx[maxn];
int dis[maxn][maxn];
int cur_ans;
vector<int> ord;
struct state
{
    int x, y;
    int len;
};

void bfs(string mask)
{
    memset(dis, 0x3f, sizeof(dis));
    queue<state> q;
    for (int i = 1; i <= n; i++)
    {
        q.push({i, 1, 0});
        dis[i][1] = 0;
    }

    while (!q.empty())
    {
        state cur = q.front();
        q.pop();

        int x1 = cur.x, y1 = cur.y;
        int cur_len = cur.len;

        if (y1 == m)
        {
            cur_ans = min(cur_ans, cur_len);
            continue;
        }

        for (int i = 0; i < 3; i++)
        {
            int x2 = x1 + dx[i], y2 = y1 + dy[i];
            if (x2 < 1 || x2 > n || y2 < 1 || y2 > m)
                continue;
            if (mp[x2][y2])
                continue;

            if (cur_len + 1 < dis[x2][y2])
            {
                dis[x2][y2] = cur_len + 1;

                if (i < 2 || !flag[y2])
                {
                    q.push({x2, y2, cur_len + 1});
                }
                else
                {
                    int pos = col_to_idx[y2];

                    if (mask[pos] == '0')
                    {
                        if (x2 < flag[y2])
                            q.push({x2, y2, cur_len + 1});
                    }
                    else
                    {
                        if (x2 > flag[y2])
                            q.push({x2, y2, cur_len + 1});
                    }
                }
            }
        }
    }
}

void search(int idx, string s)
{
    if (idx == k)
    {
        string t = s;
        reverse(t.begin(), t.end());
        cur_ans = 1e9;

        bfs(t);

        cout << (cur_ans == 1e9 ? -1 : cur_ans) << " ";
        return;
    }

    search(idx + 1, s + '0');
    search(idx + 1, s + '1');
}

void solve()
{
    cin >> n >> m;
    ord.clear();
    for (int i = 1; i <= m; i++)
        flag[i] = 0;
    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= m; j++)
            mp[i][j] = 0;
    }

    cin >> k;
    for (int i = 1; i <= k; i++)
    {
        int r, c;
        cin >> r >> c;
        ord.push_back(c);
        mp[r][c] = 1;
        flag[c] = r;
    }

    sort(ord.begin(), ord.end());
    for (int i = 0; i < k; i++)
        col_to_idx[ord[i]] = i;
    search(0, "");
    cout << "\n";
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

总体时间复杂度： $O(2^knm)$ ，大概就是 $1024*100*100$ ，可过。

用 $dp$ 的话也不是不行，但是时间复杂度和bfs一样，甚至还要差一点？

## **G题**

严厉控诉，折磨了我好几天。

其实向学长求助了贪心策略之后发现woc这么简单，但是一开始被队友拉着看了榜一的做法，于是迷茫了...无所适从了...道心破碎了...

然后更加离谱的是，听AI说这题可以用网络流，于是！我真的去学最大流了...然后到现在我网络流做法还没过，一个打了普通的 $Dinic$ $TLE$ 了，另一个向学长拿了一个预流推进的板子然后 $WA$ 了...

好吧不亏，至少我会网络流了。~~（真的会了吗）~~

然后简单讲一下贪心做法：

仔细回顾题目，我们可以发现，如果我们把每个正高度的格子的雪先往右边推，当处理完这一行的时候，再往下面推，就能做到尽可能地使所有负高度的雪被填平。当我们在一行遇到一个正值的时候，我们累计这一行在这个格子的右边的所有负的格子的值的总和，然后看这个正的格子能不能填上这个空缺。如果能填上就填，不能填上就尽量填。那如果能填上，我们这个格子可能会有剩余的雪，这些雪怎么处理呢？就可以被推到下一行去继续处理。

其实整个网格图就是一个 $DAG$ ，我们必须沿着拓扑顺序来对后面的格子进行填补，把所有正负当成可以抵消的资源，进行贪心的处理。

# $Coding$


```js#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <queue>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int t;
int n, m;
const int maxn = 1e3 + 10;
const int maxm = 3e6 + 10;
const ll INF = 1e18;
ll h[maxn][maxn];
// struct Edge
// {
//     int to, next;
//     ll cap;
// } edge[maxm];
// int cur[maxn * maxn], head[maxn * maxn], level[maxn * maxn];
// int tot;

// void add_edge(int u, int v, ll c)
// {
//     edge[tot] = {v, head[u], c};
//     head[u] = tot++;
//     edge[tot] = {u, head[v], 0};
//     head[v] = tot++;
// }

// bool bfs(int s, int t)
// {
//     queue<int> q;
//     q.push(s);
//     memset(level, -1, sizeof(level));
//     level[s] = 0;

//     while (!q.empty())
//     {
//         int u = q.front();
//         q.pop();

//         if (u == t)
//             return true;

//         for (int i = head[u]; i; i = edge[i].next)
//         {
//             int v = edge[i].to;
//             if (level[v] == -1 && edge[i].cap > 0)
//             {
//                 level[v] = level[u] + 1;
//                 q.push(v);
//             }
//         }
//     }

//     return false;
// }

// ll dfs(int u, int t, ll flow)
// {
//     if (u == t)
//         return flow;

//     ll used = 0;
//     for (int &i = cur[u]; i; i = edge[i].next)
//     {
//         int v = edge[i].to;
//         ll cap = edge[i].cap;
//         if (cap <= 0)
//             continue;

//         if (level[v] == level[u] + 1)
//         {
//             ll w = dfs(v, t, min(flow - used, cap));
//             if (w)
//             {
//                 edge[i].cap -= w;
//                 edge[i ^ 1].cap += w;
//                 used += w;
//                 if (used == flow)
//                     break;
//             }
//         }
//     }

//     return used;
// }

// ll dinic(int s, int t)
// {
//     ll max_flow = 0;
//     while (bfs(s, t))
//     {
//         memcpy(cur, head, sizeof(head));
//         max_flow += dfs(s, t, INF);
//     }

//     return max_flow;
// }

void solve()
{
    cin >> n >> m;

    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= m; j++)
            cin >> h[i][j];
    }

    ll ans = 0;
    for (int i = 1; i <= n; i++)
    {
        ll sum = 0;
        for (int j = m; j >= 1; j--)
        {
            if (sum + h[i][j] > 0)
            {
                h[i + 1][j] += h[i][j] + sum;
                sum = 0;
            }
            else
                sum += h[i][j];
        }

        ans += llabs(sum);
    }

    for (int i = 1; i <= m; i++)
        ans += llabs(h[n + 1][i]), h[n + 1][i] = 0;

    cout << ans << "\n";

    // for (int i = 0; i <= n * m + 1; i++)
    //     head[i] = cur[i] = 0;a

    // int s = 0, t = n * m + 1;
    // tot = 2;
    // ll total_positive = 0, total_negative = 0;

    // for (int i = 1; i <= n; i++)
    // {
    //     for (int j = 1; j <= m; j++)
    //     {
    //         cin >> h;
    //         int u = (i - 1) * m + j;
    //         if (h > 0)
    //         {
    //             add_edge(s, u, h);
    //             total_positive += h;
    //         }
    //         else if (h < 0)
    //         {
    //             add_edge(u, t, -h);
    //             total_negative += -h;
    //         }

    //         if (i < n)
    //             add_edge(u, u + m, INF);
    //         if (j < m)
    //             add_edge(u, u + 1, INF);
    //     }
    // }

    // ll total_flow = dinic(s, t);
    // cout << total_positive + total_negative - 2 * total_flow << "\n";
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

嗯注释掉的是那个用网络流做的部分，再把预流推进版本的放出来看一下，以后能不能找到问题，还是说这个建模方式就不适合这题。


```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <queue>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

const int maxn = 1e3 + 10;
int n, m;
ll h;
int t;

template <typename T>
struct PushRelabel
{
    const int inf = 0x3f3f3f3f;
    const T INF = 0x3f3f3f3f3f3f3f3f;
    struct Edge
    {
        int to, cap, flow, anti;
        Edge(int v = 0, int w = 0, int id = 0) : to(v), cap(w), flow(0), anti(id) {}
    };
    vector<vector<Edge>> e;
    vector<vector<int>> gap;
    vector<T> ex; // 超额流
    vector<bool> ingap;
    vector<int> h;
    int n, gobalcnt, maxH = 0;
    T maxflow = 0;

    PushRelabel(int n) : n(n), e(n + 1), ex(n + 1), gap(n + 1) {}
    void addedge(int u, int v, int w)
    {
        e[u].push_back({v, w, (int)e[v].size()});
        e[v].push_back({u, 0, (int)e[u].size() - 1});
    }
    void PushEdge(int u, Edge &edge)
    {
        int v = edge.to, d = min(ex[u], 1LL * edge.cap - edge.flow);
        ex[u] -= d;
        ex[v] += d;
        edge.flow += d;
        e[v][edge.anti].flow -= d;
        if (h[v] != inf && d > 0 && ex[v] == d && !ingap[v])
        {
            ++gobalcnt;
            gap[h[v]].push_back(v);
            ingap[v] = 1;
        }
    }
    void PushPoint(int u)
    {
        for (auto k = e[u].begin(); k != e[u].end(); k++)
        {
            if (h[k->to] + 1 == h[u] && k->cap > k->flow)
            {
                PushEdge(u, *k);
                if (!ex[u])
                    break;
            }
        }
        if (!ex[u])
            return;
        if (gap[h[u]].empty())
        {
            for (int i = h[u] + 1; i <= min(maxH, n); i++)
            {
                for (auto v : gap[i])
                {
                    ingap[v] = 0;
                }
                gap[i].clear();
            }
        }
        h[u] = inf;
        for (auto [to, cap, flow, anti] : e[u])
        {
            if (cap > flow)
            {
                h[u] = min(h[u], h[to] + 1);
            }
        }
        if (h[u] >= n)
            return;
        maxH = max(maxH, h[u]);
        if (!ingap[u])
        {
            gap[h[u]].push_back(u);
            ingap[u] = 1;
        }
    }
    void init(int t, bool f = 1)
    {
        ingap.assign(n + 1, 0);
        for (int i = 1; i <= maxH; i++)
        {
            gap[i].clear();
        }
        gobalcnt = 0, maxH = 0;
        queue<int> q;
        h.assign(n + 1, inf);
        h[t] = 0, q.push(t);
        while (q.size())
        {
            int u = q.front();
            q.pop(), maxH = h[u];
            for (auto &[v, cap, flow, anti] : e[u])
            {
                if (h[v] == inf && e[v][anti].cap > e[v][anti].flow)
                {
                    h[v] = h[u] + 1;
                    q.push(v);
                    if (f)
                    {
                        gap[h[v]].push_back(v);
                        ingap[v] = 1;
                    }
                }
            }
        }
    }
    T work(int s, int t)
    {
        init(t, 0);
        if (h[s] == inf)
            return maxflow;
        h[s] = n;
        ex[s] = INF;
        ex[t] = -INF;
        for (auto k = e[s].begin(); k != e[s].end(); k++)
        {
            PushEdge(s, *k);
        }
        while (maxH > 0)
        {
            if (gap[maxH].empty())
            {
                maxH--;
                continue;
            }
            int u = gap[maxH].back();
            gap[maxH].pop_back();
            ingap[u] = 0;
            PushPoint(u);
            if (gobalcnt >= 10 * n)
            {
                init(t);
            }
        }
        ex[s] -= INF;
        ex[t] += INF;
        return maxflow = ex[t];
    }
};

void solve()
{
    cin >> n >> m;
    int s = 0, t = n * m + 1;
    PushRelabel<ll> pr(n * m + 2);
    ll total_positive = 0, total_negative = 0;
    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= m; j++)
        {
            cin >> h;
            int u = (i - 1) * m + j;
            if (h > 0)
            {
                total_positive += h;
                pr.addedge(s, u, h);
            }
            else if (h < 0)
            {
                total_negative += -h;
                pr.addedge(u, t, -h);
            }

            if (i < n)
                pr.addedge(u, u + m, pr.INF);
            if (j < m)
                pr.addedge(u, u + 1, pr.INF);
        }
    }

    ll flow = pr.work(s, t);
    cout << total_positive + total_negative - 2 * flow << "\n";
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

## **K题**

一道构造题，这道题打vp的时候是队友写的，我没看。现在回头看一下发现还挺有意思的，把一个经典的背包 $dp$ 模型改成了一道新的构造题目，~~感觉可以按这个思路给背包题出数据，让用贪心做的爆零。~~

看一下题目，要求我们构造一组数据，使得对于任意的 $W \in [2,W_{lim}]$ ，都不能通过这种贪心策略找到最优解。

我们回顾一下，贪心策略为什么在这种01背包问题上不可行？首先贪心是优先选择价值比率高的物品，那么当我们有一件价值比率很高的物品，我们先给他选了，但是后面又出现了一件总价值比前面这件物品高，但由于重量略高使得价值比率稍低。但我们所给的剩余背包的大小足够给他装下去。通过这里就可以看出，我们使用贪心策略选出的方案，与使得总价值最大的方案是不同的。

那我们此时就要构造一种这样的数据，把贪心算法从 $2$ 到 $W_{lim}$ 完全k掉。即对于每个容量上限 $W$ ，我们都有对应的一个上面提到的那种情况：一种价值比率高但是相对总价值较小，一种价值比率低但是相对总价值较大。我们不妨先构造一个重量为 $1$ ，价值为 $W_{lim}$ 的物品，这样的话，对于任意的容量 $W$ ，只要当我们选择了这个物品，剩下物品的可用总容量只有 $W-1$ ，然后我们再构造 $W_{lim}-1$ 个重量分别为 $2,3,4,\,...\,,W_{lim}$ 的物品，并使得其总价值都要高于第一个物品，但是价值比率略低。这样我们就达成了小重量物品挤占大重量但是也高价值物品空间的策略，使得每一个容量 $W$ 本来可以选择一个刚好最大的物品的价值，但由于被前面的第一个物品挤占导致无法选择。

那么此时我们应该怎么安排第 $i$ 个物品的价值呢？可以看出由于此时我们无法选择价值最大的物品，只能在剩下的 $W-2$ 种物品中选择。令第 $i$ 个物品的价值为 $(i-1)(W_{lim}+1)$ ，则第 $i$ 个物品的价值比率为 $\frac {(i-1)(W_{lim}+1)}{i}$ ，显然可知其单调递增，但由于 $i \le W_{lim}$ ，价值 $v_i \le W_{lim}$ ，然后我们对于容量 $W$ ，只能选择两个物品，一个重量为 $1$ ，价值为 $W_{lim}$ ,一个重量为 $W-1$ ，价值为 $(i-2)(W_{lim}+1)$ ，这样加起来总价值为 $(i-1)W_{lim}+i-2$ ，而第 $W$ 件物品的价值为 $(i-1)W_{lim}+i-1$ ，显然较小。故得到构造方法。

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

int max_w;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> max_w;
    cout << max_w << "\n";
    for (int i = 1; i <= max_w; i++)
        cout << i << " ";
    cout << "\n";
    for (int i = 1; i <= max_w; i++)
        cout << (i == 1 ? max_w : (i - 1) * (max_w + 1)) << " ";

    return 0;
}
```

这场比赛先补到这里吧，后面心有余而力不足了，硬补估计也就是抄一遍题解。