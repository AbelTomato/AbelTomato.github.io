---
title: 'The 2025 ICPC North America Pacific Northwest Regional Contest (Div. 2, Open Mirror)赛后总结'
description: 'The 2025 ICPC North America Pacific Northwest Regional Contest (Div. 2, Open Mirror)赛后总结'
pubDate: '2025-12-12'
heroImage: "./The 2025 ICPC North America Pacific Northwest Regional Contest (Div. 2, Open Mirror)赛后总结heroImage.jpg"
tags: ["算法竞赛","赛后总结"]
---

2025.12.10打了这一场，总体感觉还行，不过为什么题目这么简单来着，做出来七题，到后面做得有点头晕了，干脆等现在补题。

## A题

没什么好说的，给你一个单位重量一个总体重量，要求你多少个花生能达到总体重量，直接整除判断一下是否加一即可

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

int m, d;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> m >> d;

    cout << (d % m == 0 ? d / m : d / m + 1);

    return 0;
}
```

## B题

要求选择的题目中任意两道题的难度差值均不小于 $t$ ，我考虑了从小到大排序后进行 $dp$ 求解，其中转移方程为：

$$
dp_i = \underset{j<i,a_j+t \le a_i}{max}(dp_j)+1
$$

其中 $dp_i$ 代表选到第 $i$ 题的时候最多能选多少题。感觉这题 $dp$ 有点小题大做吧，贪心似乎也能做，但 $n$ 

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

int n, t;
const int maxn = 60;
int a[maxn];
int dp[maxn];
int ans;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> t;
    for (int i = 1; i <= n; i++)
        cin >> a[i];
    sort(a + 1, a + n + 1);

    for (int i = 1; i <= n; i++)
    {
        int max_val = 0;
        for (int j = 1; j < i; j++)
        {
            if (a[i] - a[j] >= t)
                max_val = max(max_val, dp[j]);
            else
                break;
        }

        dp[i] = max_val + 1;

        ans = max(ans, dp[i]);
    }

    cout << ans;

    return 0;
}
```

## C题

按题意模拟即可，不过要注意奖励分是直接加到计算好的平均数上，不用再除上一个 $n$ ，另外要记得保留六位小数。不保留的话可能只输出两到三位小数，精度就error了。

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
string s;
double sum, add;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> s;
        char grade = s[0], cls = s[1];

        sum += 'E' - grade;
        if (grade == 'A' || grade == 'B' || grade == 'C')
        {
            if (cls == '1')
                add += 0.05;
            else if (cls == '2')
                add += 0.025;
        }
    }

    cout << fixed << setprecision(7) << sum * 1.0 / n + add;

    return 0;
}
```

## D题

数学概率题，题目要求计算至少有一天报告紧张的概率，那我们可以先计算每天都放松的概率，然后用 $1$ 减去这个概率值即可。

怎么计算呢？首先对于第 $i$ 天，我们会从 $(a,b)$ 之间随机挑选一个实数 $t_0$，如果要使得这一天是放松的， 就要使得这个实数 $t_0$ 落在区间 $(s_i,e_i)$ 之间，然后计算落在这个区间内的概率 $P_i$ 。概率怎么计算，就计算区间 $(a,b),(s_i,e_i)$ 之间的交集长度 $l_i$ ，然后计算区间 $(a,b)$ 的长度 $L = b - a$ ，则概率就等于 $P_i = \dfrac {l_i}{L}$ 。则每天都放松的概率就为 $\prod_{i=1}^{n} P_i$ ，答案为 $1 - \prod_{i=1}^{n} P_i$

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
const int maxn = 30;
int a, b;
int s[maxn], e[maxn];

double calc_lop(int l1, int r1, int l2, int r2)
{
    if (r1 < l2 || r2 < l1)
        return 0;

    int L = max(l1, l2);
    int R = min(r1, r2);

    return R - L;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> a >> b;
    for (int i = 1; i <= n; i++)
        cin >> s[i] >> e[i];

    double total_range = b - a;
    double exp = 1;

    for (int i = 1; i <= n; i++)
    {
        double lop = calc_lop(a, b, s[i], e[i]);
        exp *= (lop / total_range);
    }

    cout << fixed << setprecision(7) << 1 - exp;

    return 0;
}
```

## E题

简单的模拟时间判断。

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

string time1, time2;

int calc_time(string s)
{
    return ((s[0] - '0') * 10 + (s[1] - '0')) * 60 + (s[3] - '0') * 10 + (s[4] - '0');
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> time1 >> time2;
    int t1 = calc_time(time1);
    int t2 = calc_time(time2);

    // debug(t1);
    // debug(t2);

    cout << (t2 > t1 ? "YES" : "NO");

    return 0;
}
```

## F题

其实做到这里的时候脑子已经有点昏了，教室真的太闷了，搞得这题卡了有一会，其实说实话并不难吧。

很显然这个变换具有周期性，每 $26$ 个字符串是一个周期，则我们可以通过计算一个周期内所有字符串中 $r$ 的个数，然后用总字符串个数除以 $26$ 得到周期数，然后乘上这个总个数，剩下的多余部分就直接手动模拟计算好了。

虽然感觉应该有数学的 $O(1)$ 推法，但我懒得想了。ChatGPT给出了一个统计字母出现频率表的方式。

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

string s;
ll n;
ll cnt[30];
ll ans, sum;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> s >> n;
    int len = s.length();

    for (int i = 1; i <= 26; i++)
    {
        for (int j = 0; j < len; j++)
        {
            s[j]--;
            if (s[j] < 'a')
                s[j] = 'z';
            if (s[j] == 'r')
                cnt[i % 26]++;
        }

        sum += cnt[i % 26];
    }

    ll num = n / 26, rem = n % 26;
    ans = num * sum;

    for (int i = 0; i < rem; i++)
        ans += cnt[i];

    cout << ans;

    return 0;
}
```

## G题

真的服了，VP的时候看这题感觉好麻烦，可能要 $dp$ 啥的，看了一会没想出转移方程，于是直接跳了，现在再看其实就是个贪心+排序+前缀和...

考虑一下，假设当前我们已经做了 $t$ 道题，记解题时间的后缀和为 $s_i$ ，则对于第 $i$ 个气球，它当前的浮力为 $max(1 - \dfrac{s_{i+1}}{d} , 0)$ 。可以看出，越到后面，你解题的时间对每个气球的浮力的影响就越大。因为前面的气球越来越多，假设当前的浮力都没有变成 $0$ ，则对于每个气球它每个单位时间减少的浮力是相同的，所以气球越多，同一时间减少的总浮力就越多。则我们可以考虑一下贪心策略：优先做解题时间较长的题目，把时间较短的题目拖到后面做。

所以直接将解题时间从小到大排序，然后计算当前每个气球的承载能力 $cap_i = max(1 - \dfrac{s_{i-1}}{d} , 0)$ ，注意这里的 $s_i$ 是前缀和了，因为我们相当于把最后解出的题目放在最前面。然后从 $1$ 到 $n$ 逐步计算当前承载力总和 $sum$ ，若当前 $sum \ge m$ ，则直接输出当前序号 $i$ ，直到最后都无解的话就输出 $-1$

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
const int maxn = 1e5 + 10;
const double eps = 1e-6;
double d, m;
double s[maxn];
double pre_fix[maxn];
double cap[maxn];

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> d >> m;
    for (int i = 1; i <= n; i++)
        cin >> s[i];

    sort(s + 1, s + n + 1);

    pre_fix[0] = 0;
    for (int i = 1; i <= n; i++)
        pre_fix[i] = pre_fix[i - 1] + s[i];

    for (int i = 1; i <= n; i++)
    {
        cap[i] = max(0.0, 1 - (pre_fix[i - 1] / d));
    }

    double sum = 0;
    for (int i = 1; i <= n; i++)
    {
        sum += cap[i];
        if (sum >= m - eps)
        {
            cout << i;
            return 0;
        }
    }

    cout << -1;

    return 0;
}
```

## H题

是我最烂的几何题。

当时VP的时候考虑到的是方向性问题，可能只要线段的方向不同什么的就可以框住？总之挺离谱的，其实是看这个长度是否收敛，以及判断一些特殊情况。

这个分形树是由递归式定义的，由当前的线段推出来的新的两条线段与原来的图形是相似的，一开始我就是只考虑到形状相似，没有考虑长度也会呈等比例放缩。

所以我们可以计算一开始的三条线段的长度 $l_1,l_2,l_3$ ，如果说有 $l_2 > l_1$ 或者 $l_3 > l_1$ ，则我们就可以看出，如果沿着这个会放大比例的方向一直走，整个图形就会越来越大，长度越来越长，最终发散，无法用矩形框住。

同时如果有 $l_1 = l_2$ 且 $l_1 = l_3$ ，则也不能框住，因为我们每次可以任意选取一个方向来延展图形，完全可以走很多次一个方向，然后用另一个方向来微调一下方向使得不会折回来形成一个多边形。

且如果有 $l_1,l_2$ 或者 $l_1,l_3$ 在同一条直线上，且 $l_1 = l_2$ 或者 $l_1 = l_3$，显然可以沿一个方向无限扩张，无法框住。

如果上面的情况都不满足，就可以框住这个分形树了。

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

int calc_len(int x1, int y1, int x2, int y2)
{
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}

void solve()
{
    int x0, y0, x1, y1, x2, y2;
    cin >> x0 >> y0 >> x1 >> y1 >> x2 >> y2;

    int len1 = calc_len(0, 0, x0, y0);
    int len2 = calc_len(x0, y0, x1, y1);
    int len3 = calc_len(x0, y0, x2, y2);

    if (len2 > len1 || len3 > len1)
        cout << "NO\n";
    else if (len2 == len1 && len3 == len1)
        cout << "NO\n";
    else if (len2 == len1 && x1 == 2 * x0 && y1 == 2 * y0)
        cout << "NO\n";
    else if (len3 == len1 && x2 == 2 * x0 && y2 == 2 * y0)
        cout << "NO\n";
    else
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

## I题

So easy 的贪心，$2$ 旁边不能开，然后我们考虑一段连续的不受 $2$ 影响的 $1$ ，看看怎么开可以让这段 $1$ 开启的数量最多。

首先若这段 $1$ 的长度为奇数，则显然我们可以开 $1,3,5, \dots , n$ ，总数量为 $\dfrac{n+1}{2}$ ，可以证明没有更优解。

若长度为偶数，则我们也可以开 $1,3,5, \dots ,n-1$ ，总数量为 $\dfrac{n}{2}$ ,也可以证明没有更优解。

那么贪心思路就出来了，我们对于每个自由的 $1$ ，采用能放就放的策略，最终即为最优解。

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
string s;
int ans;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> s;
    for (int i = 0; i < n; i++)
    {
        if (s[i] != '1')
            continue;

        if (i == 0)
        {
            if (s[i + 1] != '2')
            {
                s[i] = '2';
                ans++;
            }
        }
        else if (i == n - 1)
        {
            if (s[i - 1] != '2')
            {
                s[i] = '2';
                ans++;
            }
        }
        else
        {
            if (s[i + 1] != '2' && s[i - 1] != '2')
            {
                s[i] = '2';
                ans++;
            }
        }
    }

    cout << ans;

    return 0;
}
```

## J题

目前来说最难的一题，直接给我干懵逼了。

应该说其实就是区间 $dp$ 或者按某个维度单调推进的 $dp$

这里我们要同时求最小修改数和方案数，想一想应该怎么修改才能满足题目所给的条件。

可以看出当我们修改一个位置的时候，假设不去看后面的字符，则能与当前位置联动产生新的“shh“子串只有前面两个位置，则我们可以考虑采用 $dp$ ，设置四个维度。其中第一维代表当前处理到第几个字符，第二维代表第 $i-2$ 个字符是什么，第三维代表第 $i-1$ 个字符是什么，第四维代表当前有几个“shh”串。且同时用一个 $pair$ 存储两个数，一个代表当前这个状态所需的操作数，一个代表当前这个状态的方案数。

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
string s;
const int mod = 67;
const int maxn = 70;
const int INF = 1E9;
pair<int, int> dp[maxn][30][30][maxn];

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> k;
    cin >> s;

    for (int i = 0; i <= n; i++)
    {
        for (int a = 0; a < 27; a++)
        {
            for (int b = 0; b < 26; b++)
            {
                for (int t = 0; t <= n; t++)
                    dp[i][a][b][t] = {INF, 0};
            }
        }
    }

    for (int c = 0; c < 26; c++)
    {
        int cost = (s[0] - 'a' != c);
        dp[1][26][c][0] = {cost, 1};
    }

    for (int i = 1; i < n; i++)
    {
        for (int a = 0; a < 27; a++)
        {
            for (int b = 0; b < 26; b++)
            {
                for (int t = 0; t <= k; t++)
                {
                    if (dp[i][a][b][t].first == INF)
                        continue;

                    int old_cost = dp[i][a][b][t].first;
                    int old_ways = dp[i][a][b][t].second;

                    for (int c = 0; c < 26; c++)
                    {
                        int cost = old_cost + (s[i] - 'a' != c);
                        int new_t = t;

                        if (a != 26)
                        {
                            if (a == 's' - 'a' && b == 'h' - 'a' && c == 'h' - 'a')
                            {
                                new_t = t + 1;
                                if (new_t > k)
                                    continue;
                            }
                        }

                        pair<int, int> &cur = dp[i + 1][b][c][new_t];
                        if (cost < cur.first)
                        {
                            cur.first = cost;
                            cur.second = old_ways % mod;
                        }
                        else if (cost == cur.first)
                            cur.second = (cur.second + old_ways) % mod;
                    }
                }
            }
        }
    }

    int best = INF, ways = 0;

    for (int a = 0; a < 27; a++)
    {
        for (int b = 0; b < 26; b++)
        {
            pair<int, int> cur = dp[n][a][b][k];

            if (cur.first < best)
            {
                best = cur.first;
                ways = cur.second;
            }
            else if (cur.first == best)
                ways = (ways + cur.second) % mod;
        }
    }

    cout << best << " " << ways;

    return 0;
}
```

好像说是什么AC自动机来着？ ~~不会，下次学~~

## K题

简单，但是VP的时候也想复杂了，其实只需要先固定第一个在位置 $1$ ，然后后面导线根据与前面导线的矛盾关系来放置即可，刚好放到所有合法位置的第一个，这样贪心就是最优解。

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

int n, m;
const int maxn = 210;
ll r[maxn];
ll pos[maxn];
int s[maxn];
string influ[maxn];

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> r[i] >> s[i];
    for (int i = 1; i <= m; i++)
    {
        cin >> influ[i];
        influ[i] = "*" + influ[i];
    }

    pos[1] = 1;
    for (int i = 2; i <= n; i++)
    {
        pos[i] = pos[i - 1] + 1;
        for (int j = 1; j < i; j++)
        {
            if (influ[s[i]][s[j]] == '0')
                pos[i] = max(pos[i], pos[j] + r[j] + 1);
            if (influ[s[j]][s[i]] == '0')
                pos[i] = max(pos[i], pos[j] + r[i] + 1);
        }
    }

    cout << pos[n];

    return 0;
}
```

## L题

同样也是一个带约束的 $dp$ ，可以看到对于每一步的加点可能会影响未来的状态，所以我们要使用 $dp$ 求解。虽然这题实际上也可以用贪心求解，但是 $dp$ 来判断可行域是更加通用的方案。

我们考虑二分初始的两个能力的和 $S$ 来求解。对于每一个确定的 $S$ ，我们来根据这个给出的 $S$ 进行 $dp$ 递推。具体地，我们通过来判断每一步的区间可行域来确定这个 $S$ 是否可行。

我们要判断的是实现技能水平即 $implementation$ 的数值的可行域，设其为 $x$ ，则对于初始状态即第一道题有如下约束：

$$
x \ge a_1,S - x \ge b_1 \Rightarrow a_1 \le x \le S - b_1
$$

若 $a_1 > S - b_1$ ，则说明这个 $S$ 不可行，直接返回 $false$

我们设 $dp_{i,j}$ 为在第 $i$ 题，给 $implementation$ 加了 $j$ 次时 $x$ 的可行域，则初始化 $dp_{1,0} = [a_1,S - b_1]$ 。显然在第 $i-1$ 题，我们只有两种选择：给 $implementation$ 加或者不加，即 $dp_{i,j}$ 只能由 $dp_{i-1,j}$ 或者 $dp_{i-1,j-1}$ 转移而来。

既然已知当前给 $implementation$ 加了 $j$ 次，给 $thinking \, skill$ 加了 $i-j-1$ 次。则对第 $i$ 题，有如下约束：

$$
x + j \ge a_i, \, S - x + (i - j - 1) \ge b_i \Rightarrow a_i - j \le x \le S - b_i + i - j - 1
$$

然后对于前一个状态的 $[l,r]$ ，取新的可行区间为 $[max(l,a_i-j) , min(r,S-b_i+i-j-1)]$ ,若该区间合法，则直接进行状态转移。

最后如果对于每个 $i$ 都存在合法的区间，说明这个 $S$ 可行。否则不可行。

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
const ll INF = 1E18;
const int maxn = 60;
ll a[maxn], b[maxn];

bool check(ll s)
{
    pair<ll, ll> dp[maxn][maxn];

    for (int i = 1; i <= n; i++)
    {
        for (int j = 0; j <= n; j++)
            dp[i][j] = {INF, -INF};
    }

    ll init_l = a[1], init_r = s - b[1];
    if (init_l > init_r)
        return false;

    dp[1][0] = {init_l, init_r};

    for (int i = 2; i <= n; i++)
    {
        bool is_valid = false;

        for (int j = 0; j <= i - 1; j++)
        {
            ll cur_l = a[i] - j, cur_r = s - b[i] + i - j - 1;
            ll l1 = dp[i - 1][j].first, r1 = dp[i - 1][j].second;
            ll valid_l = max(cur_l, l1), valid_r = min(cur_r, r1);

            if (valid_l <= valid_r)
            {
                is_valid = true;
                dp[i][j].first = min(dp[i][j].first, valid_l);
                dp[i][j].second = max(dp[i][j].second, valid_r);
            }

            if (j > 0)
            {
                ll l2 = dp[i - 1][j - 1].first, r2 = dp[i - 1][j - 1].second;
                valid_l = max(cur_l, l2), valid_r = min(cur_r, r2);

                if (valid_l <= valid_r)
                {
                    is_valid = true;
                    dp[i][j].first = min(dp[i][j].first, valid_l);
                    dp[i][j].second = max(dp[i][j].second, valid_r);
                }
            }
        }

        if (!is_valid)
            return false;
    }

    return true;
}

ll binary(ll left, ll right)
{
    ll ans, mid;

    while (left <= right)
    {
        mid = (left + right) >> 1;

        if (check(mid))
        {
            ans = mid;
            right = mid - 1;
        }
        else
            left = mid + 1;
    }

    return ans;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> a[i] >> b[i];

    ll max_a = 0, max_b = 0;
    for (int i = 1; i <= n; i++)
    {
        max_a = max(max_a, a[i]);
        max_b = max(max_b, b[i]);
    }

    cout << binary(0, max_a + max_b);

    return 0;
}
```

## M题

够恶心的，暴力枚举，但疑似太暴力了。VP的时候打了快十层嵌套花括号。

其实很简单，就是枚举原三角形的三个角，题目保证角度能被 $5$ 整除，则按 $5°,10°$ 这样枚举分割角 $a_1,b_1,c_1$ ,得到两个小三角形，然后将这两个三角形和目标的两个三角形的角度分别加入四个集合 $set$ 中，用 $set$ 重载的 $==$ 运算符直接判断。

```js
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <set>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

int t;
int a1, b1, c1;
int a2, b2, c2;
int a3, b3, c3;

bool check(int a, int b, int c, int fa, int fb, int fc, int sa, int sb, int sc)
{
    set<int> s1, s2;
    s1.insert(fa);
    s1.insert(fb);
    s1.insert(fc);
    s2.insert(sa);
    s2.insert(sb);
    s2.insert(sc);

    for (int i = 5; i < a; i += 5)
    {
        int j = a - i, k = 180 - b - i, l = 180 - c - a + i;
        set<int> s3, s4;

        s3.insert(i);
        s3.insert(b);
        s3.insert(k);
        s4.insert(j);
        s4.insert(c);
        s4.insert(l);

        if ((s1 == s3 && s2 == s4) || (s1 == s4 && s2 == s3))
            return true;
    }

    for (int i = 5; i < b; i += 5)
    {
        int j = b - i, k = 180 - a - i, l = 180 - c - b + i;
        set<int> s3, s4;

        s3.insert(i);
        s3.insert(a);
        s3.insert(k);
        s4.insert(j);
        s4.insert(c);
        s4.insert(l);

        if ((s1 == s3 && s2 == s4) || (s1 == s4 && s2 == s3))
            return true;
    }

    for (int i = 5; i < c; i++)
    {
        int j = c - i, k = 180 - a - i, l = 180 - b - c + i;
        set<int> s3, s4;

        s3.insert(i);
        s3.insert(a);
        s3.insert(k);
        s4.insert(j);
        s4.insert(b);
        s4.insert(l);

        if ((s1 == s3 && s2 == s4) || (s1 == s4 && s2 == s3))
            return true;
    }

    return false;
}

void solve()
{
    cin >> a1 >> b1 >> c1;
    cin >> a2 >> b2 >> c2;
    cin >> a3 >> b3 >> c3;

    if (check(a1, b1, c1, a2, b2, c2, a2, b2, c2) || check(a1, b1, c1, a3, b3, c3, a3, b3, c3) || check(a1, b1, c1, a2, b2, c2, a3, b3, c3))
        cout << "YES\n";
    else
        cout << "NO\n";
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

## 总结

终于补完了，早上七点钟到图书馆，现在搞七搞八的已经下午快六点了。

怎么说呢，感觉 $dp$ 还是太关键了，这一场考了好几道 $dp$ 。以及许多处理细节，有很大的收获。

![](F:/MyNotes/assets/images/Programming/Contest25.12.10.png)