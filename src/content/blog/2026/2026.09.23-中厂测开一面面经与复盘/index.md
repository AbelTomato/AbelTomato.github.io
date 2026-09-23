---
title: '2026.09.23-中厂测开一面面经与复盘'
description: '2026.09.23-中厂测开一面面经与复盘'
pubDate: '2026-09-23T15:01:00+08:00'
updatedDate: '2026-09-23'
heroImage: "./hero.jpg"
tags: ["面经", "SQL"]
---

这一场主要是手撕的问题，项目什么的都感觉答得不错，除了有测试量化数据因为是最近才开始做所以有点答不上来，其他都还好

手撕一共三道，有一道算法没写出来，一道SQL因为太久没写了只写了个大概

---

首先没做出来那道算法题是这样的：

```txt
给你一个整数数组 nums 。玩家 1 和玩家 2 基于这个数组设计了一个游戏。

玩家 1 和玩家 2 轮流进行自己的回合，玩家 1 先手。开始时，两个玩家的初始分值都是 0 。每一回合，玩家从数组的任意一端取一个数字（即，nums[0] 或 nums[nums.length - 1]），取到的数字将会从数组中移除（数组长度减 1 ）。玩家选中的数字将会加到他的得分上。当数组中没有剩余数字可取时，游戏结束。

如果玩家 1 能成为赢家，返回 true 。如果两个玩家得分相等，同样认为玩家 1 是游戏的赢家，也返回 true 。你可以假设每个玩家的玩法都会使他的分数最大化。
```

然后这其实就是[力扣486.预测赢家](https://leetcode.cn/problems/predict-the-winner/)，当时看到这道题就觉得很熟悉，但是死活想不起来了

思路跑偏，想到博弈论了，一直在思考有没有 $O(n)$ 的solution，最后红温了也没想出来

但其实本质dp或者说记忆化搜索

定义状态 $dp_{i, j}$ 为在区间 $[i, j]$ 时，当前行动的人最多能比另一个人多拿多少分

这个看上去确实有点抽象，我也觉得有点阴间，但是不妨从每一轮行动的人的视角来看，就可以发现他们面对的都是同一个子问题：**对于剩余的序列，我最多能拿多少分**，转换一下，不就是使得自己与对方的分数差越大越好吗，从而我们定义这样一个状态，接下来看看怎么转移

我现在要求 $dp_{i, j}$，看分别讨论拿左端点或者右端点的情况

首先，拿 $nums_{i}$，那么剩余区间为 $[i + 1, j]$，$dp_{i + 1, j}$ 表示的不就是在区间 $[i + 1, j]$ 内另一个人能获得的相对于自己最大的分差吗？所以有 $dp_{i, j} = nums_{i} - dp_{i + 1, j}$

同理，拿 $nums_{j}$，有 $dp_{i, j} = nums_{j} - dp_{i, j - 1}$

然后当前这一轮的选手必然会想方设法使自己的分数最大，所以他必然会选择能给他带来更多净分差的状态，故有状态转移方程：

$$
dp_{i, j} = \operatorname{max}(nums_{i} - dp_{i + 1, j}, nums_{j} - dp_{i, j - 1})
$$

最后由于玩家1先手，只要 $dp_{0, n - 1} \ge 0$，那么他就赢

代码：

```cpp
bool solve(const vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> dp(n, vector<int>(n));

    for (int i = 0; i < n; ++i)
        dp[i][i] = nums[i];

    for (int i = n - 2; i >= 0; --i) {
        for (int j = i + 1; j < n; ++j) {
            dp[i][j] = max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);
        }
    }

    return dp[0][n - 1] >= 0;
}
```

然后注意到每次只用到了 $i, i + 1$ 的状态，所以可以直接用一维数组，使用滚动数组解决

---

然后是一道SQL

```txt
Employee表：id，name，salary，departmentId
Id是该表的主键列。
departmentId是Department表中ID的外键。
该表的每一行都表示员工的ID、姓名和工资。它还包含了他们部门的ID。

 

Department表：id，name

Id是该表的主键列。 该表的每一行表示部门ID和部门名。

 

高收入者 是指一个员工的工资在该部门的 不同 工资中 排名前五 。

编写一个SQL查询，找出每个部门中 收入高的员工 。

Department | Employee | Salary
```

这里当时想了半天怎么子查询，但是本质窗口函数

```sql
WITH RankedEmployees AS (
    SELECT
        e.name Employee,
        d.name Department,
        e.salary Salary,
        DENSE_RANK() OVER (
            PARTITION BY e.departmentId
            ORDER BY e.salary DESC
        ) rank
    FROM
        Employee e
    JOIN
        Department d
    ON
        e.departmentId = d.id
)
SELECT
    Department,
    Employee,
    Salary
FROM
    RankedEmployees
WHERE
    rank <= 5
```
