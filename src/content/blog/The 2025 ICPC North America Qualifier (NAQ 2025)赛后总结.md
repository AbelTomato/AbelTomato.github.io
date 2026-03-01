---
title: 'The 2025 ICPC North America Qualifier (NAQ 2025)赛后总结'
description: 'The 2025 ICPC North America Qualifier (NAQ 2025)赛后总结'
pubDate: '2025-12-18'
heroImage: "./The 2025 ICPC North America Qualifier (NAQ 2025)赛后总结heroImage.jpg"
tags: ["算法竞赛","赛后总结"]
---

2025.12.17做的，和预想中一样简单，北美的赛事这么简单吗（？

但是感觉周三下午虽然是C语言课，但真不好打VP，在教室里很闷，头晕晕的。

## A题

一道稍微有点恶心的数学题，但想明白思路就不难，直接按照题意用两种灯泡给要求的三种颜色一个一个补就行。

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

int r, g, b, cr, cg, cb, crg, cgb;
int ans;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> r >> g >> b >> cr >> cg >> cb >> crg >> cgb;
    int nr = max(0, r - cr);
    int ng = max(0, g - cg);
    int nb = max(0, b - cb);

    int x = min(nr, crg);
    ans += x;
    nr -= x, crg -= x;
    if (nr)
    {
        cout << -1;
        return 0;
    }

    int y = min(ng, crg);
    ans += y;
    ng -= y, crg -= y;

    int z = min(ng, cgb);
    ans += z;
    ng -= z, cgb -= z;
    if (ng)
    {
        cout << -1;
        return 0;
    }

    int w = min(nb, cgb);
    ans += w;
    nb -= w, cgb -= w;
    if (nb)
    {
        cout << -1;
        return 0;
    }

    // cout << x << " " << y << " " << z << " " << w;

    cout << ans;

    return 0;
}
```

## B题

一道多源 $bfs$ +最短+次短路，是不是太久没写 $bfs$ 了，被卡了好久。

总体就是将所有的信号塔作为起点，然后用 $bfs$ 向外扩展。需要注意的是最短路径和次短路经的更新逻辑。

首先我们初始化四个数组：$dis_1,idx_1,dis_2,idx_2$ ，分别代表当前这个点最近的信号塔的距离，最近的信号塔的编号，次近的信号塔的距离，次近的信号塔的编号。

设当前位于 $(x,y)$ ，是编号为 $id$ 的信号塔扩展到这里的状态，路径长度为 $l$

若 $id=idx_1[x][y]$ 或 $id=idx_2[x][y]$ ，则显然当前的状态不可能贡献更新，直接跳过。

$\bullet$ 若 $l<dis_1[x][y]$ ，则将最短路的状态复制给次短路，然后用当前状态更新最短路。

$\bullet$ 若 $l=dis_1[x][y]$ ，则比较编号大小，若当前状态编号小于最短路编号，同样将最短路状态复制给次短路，并更新最短路编号。

$\bullet$ 若 $l<dis_2[x][y]$ ，则更新次短路。

$\bullet$ 若 $l=dis_2[x][y]$ ，则按编号大小比较更新次短路。

然后如果在上面的判断中更新成功了，就继续扩展，否则不扩展。因为如果没有更新成功，说明存在其他距离更短或者编号更小的点已经走过更新了接下来的路径，那么对于接下来可能扩展到的所有状态，都不可能令当前这个状态扩展成功。

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

int r, c, n;
const int maxn = 510;
const int INF = 1E9;
int dis1[maxn][maxn], idx1[maxn][maxn];
int dis2[maxn][maxn], idx2[maxn][maxn];
int dx[4] = {1, 0, -1, 0};
int dy[4] = {0, 1, 0, -1};
struct Point
{
    int x, y;
} p[maxn * maxn];
typedef struct state
{
    int x, y;
    int id;
    int len;
};

void bfs()
{
    queue<state> q;
    for (int i = 1; i <= n; i++)
    {
        int x = p[i].x, y = p[i].y;
        q.push({x, y, i, 0});
    }

    while (!q.empty())
    {
        state cur = q.front();
        q.pop();

        int x1 = cur.x, y1 = cur.y;
        int id = cur.id, cur_len = cur.len;

        if (id == idx1[x1][y1] || id == idx2[x1][y1] || cur_len > dis2[x1][y1])
            continue;

        bool is_update = false;

        if (cur_len < dis1[x1][y1])
        {
            dis2[x1][y1] = dis1[x1][y1];
            idx2[x1][y1] = idx1[x1][y1];

            dis1[x1][y1] = cur_len;
            idx1[x1][y1] = id;

            is_update = true;
        }
        else if (cur_len == dis1[x1][y1] && id < idx1[x1][y1])
        {
            dis2[x1][y1] = dis1[x1][y1];
            idx2[x1][y1] = idx1[x1][y1];

            idx1[x1][y1] = id;

            is_update = true;
        }
        else if (cur_len < dis2[x1][y1])
        {
            dis2[x1][y1] = cur_len;
            idx2[x1][y1] = id;

            is_update = true;
        }
        else if (cur_len == dis2[x1][y1] && id < idx2[x1][y1])
        {
            idx2[x1][y1] = id;

            is_update = true;
        }

        if (is_update)
        {
            for (int i = 0; i < 4; i++)
            {
                int x2 = x1 + dx[i], y2 = y1 + dy[i];
                if (x2 < 1 || x2 > r || y2 < 1 || y2 > c)
                    continue;

                q.push({x2, y2, id, cur_len + 1});
            }
        }
    }
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> r >> c >> n;

    for (int i = 1; i <= r; i++)
    {
        for (int j = 1; j <= c; j++)
            dis1[i][j] = dis2[i][j] = idx1[i][j] = idx2[i][j] = INF;
    }

    for (int i = 1; i <= n; i++)
        cin >> p[i].x >> p[i].y;

    bfs();

    for (int i = 1; i <= r; i++)
    {
        for (int j = 1; j <= c; j++)
            cout << idx1[i][j] << " ";
        cout << "\n";
    }
    for (int i = 1; i <= r; i++)
    {
        for (int j = 1; j <= c; j++)
            cout << idx2[i][j] << " ";
        cout << "\n";
    }

    return 0;
}
```

## C题

计数序列中有多少种数即可，答案即为 $min(cnt,k)$

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

int n, k;
const int maxn = 60;
int d;
bool flag[maxn];
int cnt;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> k;
    for (int i = 1; i <= n; i++)
    {
        cin >> d;
        if (!flag[d])
        {
            cnt++;
            flag[d] = 1;
        }
    }

    cout << min(cnt, k);

    return 0;
}
```

## J题

直接看最后一个数的个位数是什么，其中如果是 $0$ 的话就特判一下 $10$ ，其他的按照原样输出。

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

int a;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    for (int i = 1; i <= 100; i++)
    {
        cin >> a;
        if (i == 100)
        {
            int ans = a % 10;
            if (ans == 0)
                cout << 10;
            else
                cout << ans;
        }
    }

    return 0;
}
```

## K题

一道挺有意思的交互题，不过想一下策略发现并不难。分别对左上，右上，左下，右下的四个 $3 \times 3$ 方格进行 $check$ ，再判断一下交集关系，就可以刚好在五次查询内得到结果。

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

int query(int x, int y)
{
    int res;
    cout << "? " << x << " " << y << endl;
    cin >> res;

    cout.flush();

    return res;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    if (query(2, 2))
    {
        int ansx, ansy;

        if (query(1, 1))
            ansx = 1, ansy = 1;
        else if (query(1, 3))
            ansx = 1, ansy = 2;
        else if (query(3, 1))
            ansx = 2, ansy = 1;
        else
            ansx = 2, ansy = 2;

        cout << "! " << ansx << " " << ansy;
        return 0;
    }
    else if (query(4, 4))
    {
        int ansx, ansy;

        if (query(3, 3))
            ansx = 3, ansy = 3;
        else if (query(3, 5))
            ansx = 3, ansy = 4;
        else if (query(5, 3))
            ansx = 4, ansy = 3;
        else
            ansx = 4, ansy = 4;

        cout << "! " << ansx << " " << ansy;
        return 0;
    }
    else if (query(4, 2))
    {
        int ansx, ansy;

        if (query(4, 3))
        {
            if (query(3, 2))
                ansx = 3, ansy = 2;
            else
                ansx = 4, ansy = 2;
        }
        else
        {
            if (query(3, 2))
                ansx = 3, ansy = 1;
            else
                ansx = 4, ansy = 1;
        }

        cout << "! " << ansx << " " << ansy;
        return 0;
    }
    else
    {
        int ansx, ansy;

        if (query(2, 5))
        {
            if (query(1, 4))
                ansx = 1, ansy = 4;
            else
                ansx = 2, ansy = 4;
        }
        else
        {
            if (query(1, 4))
                ansx = 1, ansy = 3;
            else
                ansx = 2, ansy = 3;
        }

        cout << "! " << ansx << " " << ansy;
        return 0;
    }

    return 0;
}
```

## L题

显然可以看出，设三种长度分别为 $a,b,c$ ，则对于序列 $d$ ，有 $d_1 = 3a,d_n = 3c$

然后对 $\forall i \in [2,n-1]$ 进行枚举 ，如果有 $3 | d_i$ ，则考虑当前有 $3b = d_i$ ，为可能的 $b$ ，并再依次对整个序列进行枚举判断，如果对于所有的 $d_j$ 都可以用当前的 $a,b,c$ 合法表示（即系数和为 $3$），就说明当前这个为合法的 $b$ ，输出答案即可。

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

int n;
const int maxn = 20;
int d[maxn];
int a, b, c;

bool valid(int a, int b, int c, int tar)
{
    for (int i = 0; i <= 3; i++)
    {
        for (int j = 0; j <= 3; j++)
        {
            for (int k = 0; k <= 3; k++)
            {
                if (i + j + k != 3)
                    continue;

                if (i * a + j * b + k * c == tar)
                {
                    // debug(tar);
                    // debug(i);
                    // debug(j);
                    // debug(k);
                    return true;
                }
            }
        }
    }

    return false;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> d[i];
    a = d[1] / 3, c = d[n] / 3;

    for (int i = 2; i < n; i++)
    {
        if (d[i] % 3 == 0)
        {
            b = d[i] / 3;
            bool flag = true;

            for (int j = 2; j < n; j++)
            {
                if (!valid(a, b, c, d[j]))
                {
                    flag = false;
                    break;
                }
            }

            if (flag)
                break;
        }
    }

    cout << a << " " << b << " " << c;

    return 0;
}
```

不过值得一提的是有更优解法为用 $set$ 来生成由当前 $a,b,c$ 线性组合的集合，直接比较两个集合是否相等即可。
