---
title: '最大流(Edmonds-Karp算法)'
description: '最大流(Edmonds-Karp算法)'
pubDate: '2025-11-18'
heroImage: "./最大流(Edmonds-Karp算法)heroImage.jpg"
tags: ["算法竞赛","算法学习笔记"]
---

为什么会突然想起学最大流呢？是因为在补哈尔滨的ccpc的时候对于扫雪的那道题，发现看不懂队友给的 $dp$ 做法，痛苦折磨无助，看到AI说可以用网络流建模最大流来做。于是干脆开始学最大流，~~反正不想再看那个 $dp$ 了。~~

首先我们要引入一个网络流的概念。

## **流网络**

有向图 $G=(V,E)$ ，每条边 $(u,v)$ 有非负容量 $c_{uv}$ 。给定源点 $s$ 和汇点 $t$ 。

## **流f**

对每条边给出 $f_{uv}$ 满足两个条件：（1）**容量约束：** $0 \le f_{uv} \le c_{uv}$ ； （2）**流守恒：** 对除 $s,t$ 以外的每个节点，所有流入它的流量等于所有从它流出的流量。

## **流的值**

等于从 $s$ 发出的净流（或流入 $t$ 的净流）。目标：找到最大可能的流值。

## **割(S,T)**

把顶点分成 $S$ （含 $s$） 和 $T=V\S$ （含 $t$） 。割的容量是所有从 $S$ 指向 $T$ 的边的容量之和。直观来讲，流值永远 $\le$ 任意割的容量（任何流都被某个割截断）。这是定性的上界。

现在我们要求最大的流，也就是使得从源点 $s$ 到汇点 $t$ 的流量最大，为了解决这个问题，我们引入最大流最小割定理：即在一个网络流中，从源点到汇点的最大的流量，等于它的最小割中每一条边的容量之和。“割”指的是一种边的集合，如果移除这个集合的全部边，就会断开源点和汇点的连接。

具体证明见维基百科：[最大流最小割定理](https://zh.wikipedia.org/wiki/%E6%9C%80%E5%A4%A7%E6%B5%81%E6%9C%80%E5%B0%8F%E5%89%B2%E5%AE%9A%E7%90%86)

所以我们要求最大流，就等价于求解最小割。即找到一个边集连接 $S,T$ ，使得这个边集的容量和最小。

因此我们引入一个概念叫做残量图，通过残量图来求解最小割。

## **残量图**

具体的，假设当前我们已经有流量 $f$ ，为之前已经处理得到的结果，也就是说对于图中的任意一条边，它的容量可能已经被使用了一部分，也可能未被使用，然后现在我们要根据现在这个剩余容量来构建一个残量图，看看能不能再通过推进某些流量使得某些边完全饱和。

给定当前流 $f$ ，构造残量图 $G_f$ ，对每条原来的边 $(u,v):$

·如果 $f_{uv}<c_{uv}$ ，则在残量图中有正向边 $(u,v)$ ，容量为 $c_{uv}-f{uv}$ （还能再塞多少）

·如果 $f_{uv}>0$ ，则在残量图中有反向边 $(v,u)$ ，容量为 $f_{uv}$ （可以回退多少）

然后，在残量图中找到一条从 $s$ 到 $t$ 的增广路径，把该路径上最小的残量推到流里（即沿正向增加，反向减少）——这就是增广操作。重复这个增广操作直到找不到增广路为止。这个过程是所有增广式算法的核心思路（Ford-Fullkerson框架）。

## **Ford-Fullkerson方法**

·思路：任意选择增广路，并进行增广，直到残量图中不存在 $s \rightarrow t$ 路径。

·正确性：当残量图中没有 $s \rightarrow t$ 路径，说明存在一个割 $(S,T)$ 使得所有从 $S$ 到 $T$ 的原边均已饱和，所有从 $T$ 到 $S$ 的原边流为 $0$ 。因此流值等于该割的容量，不能再增大，所以当前累积的流即为最大流。

·缺点：复杂度极高，若容量为整数，则会在有限步内结束，否则可能并不收敛，会进入无限循环。

## **Edmonds-Karp**

·策略：在残量图中每次用 $bfs$ 来找到最短（边数最少） 的增广路径。

·复杂度：$O(VE^2)$ 。优势是复杂度只取决于图的规模，不受最大流值的影响。

原题：[P3376 【模板】网络最大流](https://www.luogu.com.cn/problem/P3376)

# $Coding$


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
const int maxn = 210;

struct edge
{
    int to;  // 这条边通向哪个节点
    ll cap;  // 这条边的容量
    int rev; // 这条边反向边在邻接表中的位置
};

struct MaxFlow
{
    int n;
    vector<vector<edge>> graph;
    vector<int> parent_v; // parent_v用于记录当前节点的前驱节点
    vector<int> parent_e; // parent_e用于记录从当前节点的前驱节点连向当前节点的这条边在graph[u]中的序号

    MaxFlow(int n)
    {
        this->n = n;
        graph.resize(n);
        parent_v.resize(n);
        parent_e.resize(n);
    }

    void add_edge(int u, int v, ll cap)
    {
        edge a{v, cap, (int)graph[v].size()};
        edge b{u, 0, (int)graph[u].size()};
        graph[u].push_back(a);
        graph[v].push_back(b);
    }

    bool bfs(int s, int t) // bfs用于判断当前是否还存在从s到t的路径，同时保证路径的长度最小以尽可能减少时间复杂度
    {
        fill(parent_v.begin(), parent_v.end(), -1);
        queue<int> q;
        q.push(s);
        parent_v[s] = s;

        while (!q.empty())
        {
            int u = q.front();
            q.pop();

            for (int i = 0; i < (int)graph[u].size(); i++)
            {
                edge &e = graph[u][i];

                if (parent_v[e.to] == -1 && e.cap > 0)
                {
                    parent_v[e.to] = u;
                    parent_e[e.to] = i;

                    if (e.to == t)
                        return true;

                    q.push(e.to);
                }
            }
        }

        return false;
    }

    ll max_flow(int s, int t)
    {
        ll flow = 0;
        while (bfs(s, t))
        {
            ll f = LLONG_MAX;

            for (int v = t; v != s; v = parent_v[v])
            {
                int u = parent_v[v];
                edge &e = graph[u][parent_e[v]];
                f = min(f, e.cap);
            }

            for (int v = t; v != s; v = parent_v[v])
            {
                int u = parent_v[v];
                edge &e = graph[u][parent_e[v]];
                edge &rev = graph[v][e.rev];
                e.cap -= f;   // 正向边容量减少
                rev.cap += f; // 反向边容量增加
            }

            flow += f;
        }

        return flow;
    }
};

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m >> s >> t;
    MaxFlow mf(n + 1);

    for (int i = 1; i <= m; i++)
    {
        int u, v, c;
        cin >> u >> v >> c;
        mf.add_edge(u, v, c);
    }

    cout << mf.max_flow(s, t);

    return 0;
}
```

## **概念明晰**

**最小残量：** 即为残量图中的我们选定的那条从 $s$ 到 $t$ 的路径上，所有边的残量容量的最小值。显然我们在一条路径上推流量到 $t$ 时，所推的流量不能超过任何一条边的残量。所以我们能推的最大量就是这个路径上所有边残量的最小值。然后我们每次 $bfs$ 都选定一条路径，随后我们选取这条路径上的最小残量，通过遍历这条路径，对于所有正向边减去这个最小残量，然后反向边加上这个最小残量，我们至少可以使得其中的一条边上的残量变为 $0$ ，于是当我们下一次进行 $bfs$ 时，由于我们建立残量图时只会选取残量大于 $0$ 的边，所以不会再选取这条边，因此每一次的最短路径长度（边的个数）时单调不降的，即 $bfs$ 的层数不降，这保证了复杂度的可行性。最终的图会达成这样一个状态：

· $S \rightarrow T$ 的正向边残量为 $0$

· $T \rightarrow S$ 的反向边没有流量（否则反向残量会出现，从 $T$ 到 $S$ ,而从 $S$ 又可达，矛盾）

**为什么要找最短增广路：** 有如下性质：

· $bfs$ 每次找边数最少的路径

· 每次增广都会让某些边失效（残量变为 $0$）

· 而 $bfs$ 的点层次会**严格单调增长**

· 于是算法一定会在 $O(VE^2)$ 内结束

**为什么要建立反向边：** 因为我们要允许如果有一步选择了错误的路径，推错流了，能够进行回退。网络流增广路径算法本质是一个碰运气的过程，每次找一条 $s \rightarrow t$ 的路，往上尽可能地塞流量。这个过程是显然不能保证全局最优的，假如我们第一次往路径 $A \rightarrow B \rightarrow C \rightarrow T$ 里塞了五个单位的流量，但是后面发现最优路径应该是 $A \rightarrow D \rightarrow C \rightarrow T$ ，如果没有反向边的话，此时我们已经将五个单位的流量沿着 $A \rightarrow B \rightarrow C \rightarrow T$ 塞进去了，于是当我们第二次走 $A \rightarrow D \rightarrow C$ ，达到 $C$ 的时候，发现此时根本到不了下面的 $T$ ，因为 $C \rightarrow T$ 这条边的容量已经被五个单位的流量填满了，它达到了饱和状态，残量为 $0$ ，因此在此时的残量图中根本不存在这条边。那么此时我们要允许回退，如何回退？就利用 $T \rightarrow C$ 的反向边残量来回退。

总结就是，反向边允许算法把之前乱推的流从垃圾路径上退出来，让容量回到该有的位置。让算法有能力修改历史决策，因为此时这种类似于贪心的推法不能满足最优子结构，我们无法从现在的状态看到未来的状态，就要有能力修改过去的决策。