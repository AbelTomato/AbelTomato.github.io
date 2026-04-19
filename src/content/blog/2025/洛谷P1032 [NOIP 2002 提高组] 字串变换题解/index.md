---
title: '洛谷P1032 [NOIP 2002 提高组] 字串变换题解'
description: '使用STL，折半搜索等方法对P1032进行求解'
pubDate: '2025-11-29'
updatedDate: '2025-11-29'
heroImage: "./hero.jpg"
tags: ["算法竞赛", "做题笔记"]
---

原题：[P1032 \[NOIP 2002 提高组\] 字串变换（疑似错题）](https://www.luogu.com.cn/problem/P1032)

## $Solution$

别被错题吓跑了，个人感觉这是一道很好的练习 $bfs$ 和折半搜索乃至 $STL$ ，$string$ 的有关函数的好题。

首先明确一下题意，我们每次可以按照一定的规则将当前手中的字符串中的一个子串替换为另一个子串，然后问你变成另一个字符串的最小操作次数。显然像这种普通的最小次数问题，用 $bfs$ 来解决会比较合适，听说 $dfs$ 加上一些神秘的启发式剪枝可以跑过去，但我感觉标解还是 $bfs$ 吧。

具体地，我们设置两个字符串数组 $ori,res$ 表示对应的替换规则。然后对于当前的字符串，如果在字符串中存在这个对应的 $ori$ 中的子串，则可以尝试替换，并将替换后新的字符串和新的操作次数压入队列中。这就是基本的 $bfs$ 的实现。

然后问题在于如何做到找到字符串中的子串，并将其进行替换。在这里，我们使用 $string$ 的 $find,replace$ 函数来实现相关操作。

$find$ 函数可能会比较熟悉一点，它返回的结果为查询的子串或者字符在字符串中出现的第一个位置。$find$ 函数给出了两个参数，第一个参数为你要查找的关键字，如子串和字符。第二个参数为开始查找的位置，如未填写则默认从开头即索引 $0$ 处开始查找。如果没有找到，则会返回一个静态常量 $std::string::npos$ 。

而 $replace$ 函数则允许替换子串。它给出了五个参数。

第一个参数为开始替换的位置。第二个参数为需要替换的原子串的长度。第三个参数为新的子串。第四个参数代表从新的子串中的哪一个位置开始截取替换。第五个参数为截取的长度。

在本题中只需要前三个参数即可。

## $Coding$

```cpp
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <queue>
#include <unordered_map>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

string a, b;
const int maxn = 2e6;
string ori[maxn], res[maxn];
unordered_map<string, bool> mp;
int cnt;
int ans = 11;
struct state
{
    string s;
    int step;
};

void bfs()
{
    queue<state> q;
    q.push({a, 0});
    mp[a] = true;

    while (!q.empty())
    {
        string s = q.front().s;
        int cur_step = q.front().step;
        q.pop();

        if (cur_step > 10)
            return;

        if (s == b)
        {
            ans = cur_step;
            return;
        }

        for (int i = 1; i <= cnt; i++)
        {
            size_t pos = 0;
            int len = ori[i].length();
            while ((pos = s.find(ori[i], pos)) != string::npos)
            {
                string temp = s;
                temp.replace(pos, len, res[i]);
                if (mp.find(temp) == mp.end())
                {
                    mp[temp] = true;
                    q.push({temp, cur_step + 1});
                }

                pos++;
            }
        }
    }
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> a >> b;
    while (cin >> ori[++cnt] >> res[cnt])
        ;

    bfs();

    if (ans == 11)
        cout << "NO ANSWER!";
    else
        cout << ans;

    return 0;
}
```

最终跑了 $252ms$ ，感觉有点慢，其实是因为我用了 $unordered\_map$ 来标记当前状态有没有访问过，其实使用 $unordered\_set$ 会更好。

```cpp
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <queue>
#include <unordered_set>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

string a, b;
const int maxn = 10;
string ori[maxn], res[maxn];
unordered_set<string> vis;
int cnt;
int ans = 11;
struct state
{
    string s;
    int step;
};

void bfs()
{
    queue<state> q;
    q.push({a, 0});
    vis.insert(a);

    while (!q.empty())
    {
        string s = q.front().s;
        int cur_step = q.front().step;
        q.pop();

        if (cur_step > 10)
            return;

        if (s == b)
        {
            ans = cur_step;
            return;
        }

        for (int i = 1; i <= cnt; i++)
        {
            size_t pos = 0;
            int len = ori[i].length();
            while ((pos = s.find(ori[i], pos)) != string::npos)
            {
                string temp = s;
                temp.replace(pos, len, res[i]);
                if (vis.find(temp) == vis.end())
                {
                    vis.insert(temp);
                    q.push({temp, cur_step + 1});
                }

                pos++;
            }
        }
    }
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> a >> b;
    while (cin >> ori[++cnt] >> res[cnt])
        ;

    bfs();

    if (ans == 11)
        cout << "NO ANSWER!";
    else
        cout << ans;

    return 0;
}
```

提升到了 $28ms$ ，所以这可以看出使用正确的 $STL$ 容器是非常重要的。

## **折半搜索**

接下来，我在刷题解的时候偶然看到了折半搜索，感觉非常有意思，于是学习了一下。

其实在这里，折半搜索的原理并不复杂，它其实就是同时从初始状态和末尾状态往中间搜索，如果在中间碰到了，则答案就是两边的步数之和。为了尽量平均两边搜索空间的大小以做到尽可能压缩整体的搜索空间，我们采用当前状态数较小的一边优先搜索的策略。具体地，我们创建两个队列 $q_a,q_b$ ，在一开始分别向其中压入初始状态和末尾状态。然后每次比较两个队列的大小，优先扩展较小队列的状态。

在具体的实现中，为了判断在当前这个队列的状态扩展中，扩展出的新的状态是否存在于另一个队列中，以及如果存在，需要计算这个新的状态在另一个队列中从另一边达到这个状态的操作次数，我们使用两个 $unordered\_map$ 来分别对两个队列中的字符串的操作次数进行记录。

我们为什么要进行折半搜索？因为在一些问题中，我们的状态空间往往是随着操作次数呈指数级增长的，而其中有很多的状态通常是无效的。就像一个人单恋另一个人，是吧，你拼了命向ta走去，先不提最终能不能走到ta身边，就算最终走到了，往往也需要耗费你大量的时间。~~白了少年头，空悲切！~~ 。而折半搜索就像两个人双向奔赴，很快就能修成正果。

从理论上说，折半搜索可以将时间复杂度中的指数 $n$ 减半，达到显著的优化。

所以我自己写了一个：

```cpp
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <queue>
#include <unordered_set>
#include <unordered_map>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

string a, b;
const int maxn = 10, max_state = 1e5 + 10;
string ori[maxn], res[maxn];
unordered_map<string, int> opa, opb;
unordered_set<string> vis;
int cnt;
int ans = 11;
struct state
{
    string s;
    int step;
};

void bfs()
{
    queue<state> qa, qb;
    qa.push({a, 0});
    qb.push({b, 0});
    opa[a] = 0, opb[b] = 0;

    while ((!qa.empty()) && (!qb.empty()))
    {
        int size_a = qa.size(), size_b = qb.size();

        if (size_a <= size_b)
        {
            state cur = qa.front();
            qa.pop();

            string s = cur.s;
            int cur_step = cur.step;

            if (cur_step + qb.front().step > 10)
                return;

            if (s == b)
            {
                ans = cur_step;
                return;
            }

            for (int i = 1; i <= cnt; i++)
            {
                int len = ori[i].length();
                size_t pos = 0;

                while ((pos = s.find(ori[i], pos)) != string::npos)
                {
                    string temp = s;
                    temp.replace(pos, len, res[i]);

                    if (opb.find(temp) == opb.end())
                    {
                        opa[temp] = cur_step + 1;
                        qa.push({temp, cur_step + 1});
                    }
                    else
                    {
                        ans = cur_step + 1 + opb[temp];
                        return;
                    }

                    pos++;
                }
            }
        }
        else
        {
            state cur = qb.front();
            qb.pop();

            string s = cur.s;
            int cur_step = cur.step;

            if (cur_step + qa.front().step > 10)
                return;

            if (s == a)
            {
                ans = cur_step;
                return;
            }

            for (int i = 1; i <= cnt; i++)
            {
                int len = res[i].length();
                size_t pos = 0;

                while ((pos = s.find(res[i], pos)) != string::npos)
                {
                    string temp = s;
                    temp.replace(pos, len, ori[i]);

                    if (opa.find(temp) == opa.end())
                    {
                        opb[temp] = cur_step + 1;
                        qb.push({temp, cur_step + 1});
                    }
                    else
                    {
                        ans = cur_step + 1 + opa[temp];
                        return;
                    }

                    pos++;
                }
            }
        }
    }
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> a >> b;
    while (cin >> ori[++cnt] >> res[cnt])
        ;

    bfs();

    if (ans == 11)
        cout << "NO ANSWER!";
    else
        cout << ans;

    return 0;
}
```

然后跑出了 $358ms$ 的好成绩...

为什么会这么慢呢？我反思了一下，首先是代码结构太过臃肿，两份几乎一样的代码写了两遍，分支判断多，不利于 $CPU$ 优化。另外，进行了大量的字符串赋值，以及其实 $replace$ 函数并不算高效。

随即重写了一份，将相同的逻辑用一个 $extend$ 函数实现了代码复用，同时运用 $substr$ 函数以及减少了不必要的字符串拷贝，加快字符串处理效率。

```cpp
#include <iostream>
#include <cstring>
#include <iomanip>
#include <cmath>
#include <vector>
#include <algorithm>
#include <queue>
#include <unordered_set>
#include <unordered_map>
using namespace std;

#define ll long long
#define ull unsigned long long
#define debug(x) cout << #x << "=" << x << "\n";

string a, b;
const int maxn = 10, max_state = 1e5 + 10;
string ori[maxn], res[maxn];
unordered_map<string, int> opa, opb;
unordered_set<string> vis;
int cnt;
int ans = 11;
struct state
{
    string s;
    int step;
};

bool extend(
    queue<state> &q,
    unordered_map<string, int> &op1,
    unordered_map<string, int> &op2,
    string from[],
    string to[])
{
    if (q.empty())
        return false;

    state cur = q.front();
    q.pop();

    int step = cur.step;
    string &s = cur.s;

    if (step > 10)
        return true;

    for (int i = 1; i <= cnt; i++)
    {
        size_t pos = 0;
        int len = from[i].length();

        while ((pos = s.find(from[i], pos)) != string::npos)
        {

            string temp = s.substr(0, pos) + to[i] + s.substr(pos + len);

            if (op1.find(temp) == op1.end())
            {
                op1[temp] = step + 1;

                if (op2.find(temp) != op2.end())
                {
                    ans = op1[temp] + op2[temp];
                    return false;
                }

                q.push({temp, step + 1});
            }

            pos++;
        }
    }
    return true;
}

void bfs()
{
    queue<state> qa, qb;
    qa.push({a, 0});
    qb.push({b, 0});
    opa[a] = 0, opb[b] = 0;

    while ((!qa.empty()) && (!qb.empty()))
    {
        int size_a = qa.size(), size_b = qb.size();

        if (size_a <= size_b)
        {
            if (!extend(qa, opa, opb, ori, res))
                return;
        }
        else
        {
            if (!extend(qb, opb, opa, res, ori))
                return;
        }
    }
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> a >> b;
    while (cin >> ori[++cnt] >> res[cnt])
        ;

    bfs();

    if (ans == 11)
        cout << "NO ANSWER!";
    else
        cout << ans;

    return 0;
}
```

最终：

优化成功！这才真正体现出了折半搜索的效率。
