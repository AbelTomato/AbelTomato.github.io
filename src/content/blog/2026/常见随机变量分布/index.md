---
title: '常见随机变量分布'
description: '列出了一些常见的随机变量分布的性质'
pubDate: '2026-04-22'
updatedDate: '2026-04-22'
heroImage: "./hero.jpg"
tags: ["概率统计", "笔记"]
---

## 离散型

### 伯努利分布

研究**只有两个对立结果的单次实验**的概率分布。

$$
P(X = x) =
\begin{cases}
    p, &x = 1 \\
    1 - p, &x = 0
\end{cases}
$$

或

$$
P(X = x) = p^{x} (1 - p)^{1 - x}, x \in \{0, 1 \}
$$

$X \sim Bern(p)$

- **期望**：$E(x) = p$
- **方差**：$D(x) = p(1 - p)$

### 二项分布

描述**在一系列独立的、只有两种结果的实验中，成功次数的概率分布**。

- **重复性**：进行了 $n$ 次相同的试验
- **独立性**：每次试验的结果互不影响
- **二元性**：每次试验只有两种结果
- **恒定性**：每次试验成功的概率 $p$ 是恒定不变的

用 $X$ 表示 $n$ 次试验中成功的次数，那么 $X$ 服从二项分布，记作 $X \sim B(n, p)$，其概率质量函数(PMF)如下：

$$
P(X = k) = \binom{n}{k} p^{k} (1 - p)^{n - k}
$$

- **期望**：$E(X) = np$
- **方差**：$D(X) = np(1 - p)$

### 泊松分布

用于描述**在一定时间或空间范围内，某件事发生的平均次数已知，且这些事件发生是相互独立的情况下，这件事恰好发生 $k$ 次的概率**。

若 $X \sim \text{Poisson}(\lambda)$ ，则有

$$
P(X = k) = \frac{\lambda^{k} e^{- \lambda}}{k!}
$$

#### 泊松分布期望推导

$$
\begin{aligned}
    E(X) &= \sum^{\infty}_{k = 0} k \cdot \frac{\lambda^{k} e^{- \lambda}}{k!}
\end{aligned}
$$

其中当 $k = 0$ 时对应项为 $0$ ，故从 $k = 1$ 开始

$$
\begin{aligned}
    E(X) &= \sum^{\infty}_{k = 0} k \cdot \frac{\lambda^{k} e^{- \lambda}}{k!} \\
    &= e^{- \lambda} \cdot \lambda \sum^{\infty}_{k = 1} \frac{\lambda^{k - 1}}{(k - 1)!}
\end{aligned}
$$

设 $j = k - 1$，则当 $k = 1$ 时 $j = 0$

$$
\begin{aligned}
    E(X) &= e^{- \lambda} \cdot \lambda \sum^{\infty}_{j = 0} \frac{\lambda^{j}}{j!}
\end{aligned}
$$

注意到 $f(x) = e^{x}$ 在 $x = 0$ 处的展开即为

$$
\sum^{\infty}_{j = 0} \frac{x^{j}}{j!}
$$

则

$$
E(X) = \lambda
$$

#### 泊松分布方差推导

先算 $E[X(X - 1)]$

$$
\begin{aligned}
    E[X(X - 1)] &= \sum^{\infty}_{k = 0} k(k - 1) \frac{\lambda^{k} e^{- \lambda}}{k!} \\
    &= \sum^{\infty}_{k = 2} \frac{k(k - 1) \lambda^{k} e^{- \lambda}}{k(k - 1)(k - 2)!} \\
    &= \sum^{\infty}_{k = 2} \frac{\lambda^{k} e^{- \lambda}}{(k - 2)!} \\
    &= \lambda^{2}e^{- \lambda} \sum^{\infty}_{k = 2} \frac{\lambda^{k - 2}}{(k - 2)!} \\
    &= \lambda^{2} e^{- \lambda} e^{\lambda} \\
    &= \lambda^{2}
\end{aligned}
$$

则

$$
E(X^{2}) = E[X(X - 1)] + E(X) = \lambda^{2} + \lambda
$$

$$
D(X) = E(X^{2}) - [E(X)]^{2} = \lambda
$$

## 连续型

### 均匀分布

在给定范围内，每一个点出现的概率都一模一样。在这里我们讨论连续均匀分布，离散均匀分布即类似于掷骰子，每一面概率相同。

对于连续均匀分布，有概率密度函数(PDF)：

$$
f(x) =
\begin{cases}
    \frac{1}{b - a}, &a \le x \le b \\
    0, &\text{other}
\end{cases}
$$

累积分布函数(CDF)：

$$
F(x) =
\begin{cases}
    0, &x < a \\
    \frac{x - a}{b - a}, &a \le x < b \\
    1, &x \ge b
\end{cases}
$$

若有 $X \sim U(a, b)$，则有

- **期望**：$E(X) = \frac{a + b}{2}$
- **方差**：$D(X) = \frac{(b - a)^{2}}{12}$

### 正态分布

即 $X \sim N(\mu, \sigma^{2})$，有

$$
f(x) = \frac{1}{\sigma \sqrt{2 \pi}} e^{- \frac{1}{2} (\frac{x - \mu}{\sigma})^{2}}
$$

- **期望**：$E(X) = \mu$
- **方差**：$D(X) = \sigma^{2}$

### 指数分布

用于衡量两个事件之间的时间间隔

若有 $X \sim Exp(\lambda)$

$$
f(x; \lambda) =
\begin{cases}
    \lambda e^{- \lambda x}, &x \ge 0 \\
    0, &x < 0
\end{cases}
$$

它的显著特性是无记忆性，即

$$
P\{X > s + t \mid X > s \} = P(X > t)
$$

- **期望**：$E(X) = \frac{1}{\lambda}$
- **方差**：$D(X) = \frac{1}{\lambda^{2}}$
