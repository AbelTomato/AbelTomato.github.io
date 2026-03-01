---
title: '最大流(Dinic算法)'
description: '最大流(Dinic算法)'
pubDate: '2025-11-19'
heroImage: "./最大流(Dinic算法)heroImage.jpg"
tags: ["算法竞赛","算法学习笔记"]
---

在上一篇文章中我们学习了 $Edmonds-Karp$ 算法，该算法的时间复杂度为 $O(VE^2)$ ，在应对较小图时可行，优点是实现较为简单，但如果遇到较大图，则会产生效率问题。此时我们需要更加高效可行的算法，来实现最大流的计算与求解。

## **回顾**

回顾 $Edmonds-Karp$ 算法的流程：我们每次使用 $bfs$ 来寻找一条从源点 $s$ 到汇点 $t$ 的最短路径，在确定存在路径之后，我们通过两个数组 $parentV,parentE$ 进行回溯，找到路径上最小的边残量，然后将这个残量沿着这条边推满，更新残量图，同时将该残量累加到最大流中。

而它的缺点是什么？或者说整个算法的瓶颈在哪里？很显然就是我们每次 $bfs$ 都只能找出一条路径，然后对一条路径进行增广。这样做的缺点是什么？

·有些边会被扫来扫去，重复遍历

·增广可能每次只能推进一点点，效率太低

·一旦图的结构有一些瓶颈部位，就可能呈现“挤牙膏”的效果

## Dinic

所以我们引入了 $Dinic$ 算法来解决这些问题。虽然它是另一个名字，但确切来说，它其实是 $Edmonds-Karp$ 算法的优化版。它修正了原来 $Edmonds-Karp$ 算法的缺点，原来一次 $bfs$ 只能增广一条路径，那么 $Dinic$ 就实现了一次增广多条路径，从而大大提升了效率。

具体地，我们引入了分层图来实现这个操作。

同样的，我们首先使用一次 $bfs$ 来确定 $s,t$ 间存在路径，但与 $Edmonds-Karp$ 算法不同的是，我们在 $bfs$ 的过程中对残量图计算每个节点的 $level$ ，实际上为所有点到原点的最短距离。然后进行完一次 $bfs$ 后，我们使用 $dfs$ 来按层级对多条路径进行增广，每次延展路径的时候，我们除了要求当前这条连边 $(u,v)$ 的残量 $cap_{uv}>0$ 以外，还要求有 $level_v=level_u+1$ ，从而保证这个层级是严格单调递增的，且尽可能覆盖较多的边，以及使整个残量图形成一个 $DAG$ ，从而保证无环，不会走回头路。然后我们 $dfs$ 返回从当前这条边 $(u,v)$ 开始往后算起，一直到汇点 $t$ 或者不能再走所能流过的最大流量，这个过程就类似于 $Edmonds-Karp$ 算法中计算路径上最小边容量。

那么问题来了，当我们遇到路被堵死的情况，也就是说往下走根本走不到 $t$ ，此时我们应该怎么告诉上一层级路被堵死了不能更新呢？我们使用一个 $used$ 变量，初始化为 $0$ ，然后首先对当前所在节点连的每一条边 $(u,v)$ 进行 $dfs$ 更新，每次返回一个 $flow$ 值。如果 $flow=0$ ，说明往下走就根本没有路可以走，我们不更新 $used$ ，否则将 $flow$ 累加到 $used$ 中，最后返回 $used$ 的值，如果为 $0$ 就说明了无路可走，可以看出这刚好满足一个递归逻辑，边界为 $v=t$ ，直接返回当前的流值 $flow$ ，并用这些流值来更新前面的路径。通过这些操作，就相当于一次增广了多条路径，大大提升了算法的效率。

## $Coding$


```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <queue>
#include <climits>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int n, m, s, t;
const int maxn = 1510, maxm = 5e5;
const ll INF = 1LL << 60;

struct Edge
{
    int to, next;
    ll cap;
} edge[maxm];

int head[maxn], cur[maxn], level[maxn];
int tot = 1;

void add_edge(int u, int v, ll c)
{
    edge[++tot] = {v, head[u], c};
    head[u] = tot;
    edge[++tot] = {u, head[v], 0};
    head[v] = tot;
}

bool bfs(int s, int t)
{
    memset(level, -1, sizeof(level));
    queue<int> q;
    q.push(s);
    level[s] = 0;

    while (!q.empty())
    {
        int u = q.front();
        q.pop();

        for (int i = head[u]; i; i = edge[i].next)
        {
            int v = edge[i].to;
            if (edge[i].cap > 0 && level[v] == -1)
            {
                level[v] = level[u] + 1;
                q.push(v);
            }
        }
    }

    return level[t] != -1;
}

ll dfs(int u, int t, ll flow)
{
    if (u == t)
        return flow;

    ll used = 0;
    for (int &i = cur[u]; i; i = edge[i].next)
    {
        if (edge[i].cap <= 0)
            continue;

        int v = edge[i].to;
        if (level[v] == level[u] + 1)
        {
            ll w = dfs(v, t, min(flow - used, edge[i].cap));
            if (w)
            {
                edge[i].cap -= w;
                edge[i ^ 1].cap += w;//反向边
                used += w;//累计used
                if (used == flow)//如果当前已经用了的流量等于流入u的流量，则直接返回，因为没有多余的流量可以留给其他边了
                    break;
            }
        }
    }

    return used;
}

ll dinic(int s, int t)
{
    ll max_flow = 0;
    while (bfs(s, t))
    {
        memcpy(cur, head, sizeof(head));
        max_flow += dfs(s, t, INF);
    }

    return max_flow;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    scanf("%d%d%d%d", &n, &m, &s, &t);
    for (int i = 1; i <= m; i++)
    {
        int u, v;
        ll cap;
        scanf("%d%d%lld", &u, &v, &cap);
        add_edge(u, v, cap);
    }

    printf("%lld", dinic(s, t));

    return 0;
}
```

## **一些小细节的解释**

我们使用了链式前向星进行存图，理由是我们需要频繁地进行加边操作，同时需要拷贝 $head$ 数组到 $cur$ 数组，可以使用 $memcpy$ 函数来加速这个过程。

至于 $cur$ 又是什么东西？这是用于实现 $Dinic$ 的弧优化的关键部分，没有这个优化，$Dinic$ 将会变得极慢。具体地，$cur_u$ 为 $u$ 节点的“下一条可尝试的边”，它优化了 $dfs$ 扫描邻边的次数。

每次 $dfs$ 都从 $cur_u$ 开始，而不是从 $head_u$ 开始扫描全部邻边。目的是 **跳过那些已经尝试过并且无法再推流的边，避免了重复扫描。** 而我们在代码中使用 $i$ 为 $cur_u$ 的引用的目的就是更新 $cur_u$ 。它优化了 **同一个分层图中，后续再次经过u时的效率。** 在一次 $bfs$ 中，所有边至多只会被 $dfs$ 扫描一次，保证了整轮 $bfs$ 中的所有 $dfs$ 扫描的边数加起来不超过总边数。

同时，关于边的编号问题，为什么我们要从 $tot=2$ 开始对边进行编号？因为我们在实现增广路算法的过程中需要建立反向边，而反向边的建立则需要我们能够快速找到对应反向边的编号从而更新残量。我们从 $2$ 开始编号，然后序号 $2$ 为正向边，序号 $3$ 为对应的反向边，序号 $4$ 为另一条正向边，序号 $5$ 又为对应的反向边...然后当我们要找反向边的时候，我们可以直接对当前边的序号 $i$ 用 $1$ 进行异或，得到反向边。具体的， $2 \oplus 1=3,3 \oplus 1=2$ ,通过这样的操作可以快速得到当前边的反向边编号。

总体时间复杂度为：$O(min(n^{2/3}, m^{1/2}) m)$ ，这是 $Dinic$ 算法在一般图上的最坏理论上界，实际应用中一般要远比这个快，因此成为了常用的最大流算法。