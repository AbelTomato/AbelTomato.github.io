---
title: '雅可比矩阵和微元变换'
description: '大概阐述了雅可比矩阵的原理及其在微元变换中的作用'
pubDate: '2026-04-23'
updatedDate: '2026-04-23'
heroImage: "./hero.jpg"
tags: ["微积分", "笔记"]
---

## 雅可比矩阵

**本质思想**：在局部，所有的曲线运动看起来都是直线的。

在一维函数中，只有一个变量 $f(x)$，则此时它的导数 $f'(x)$ 就是切线的斜率。

但当此时为多变量函数 $\mathbf{f}:\mathbb{R}^{n} \rightarrow \mathbb{R}^{m}$，此时"斜率"变为了一个矩阵。

假设函数 $\mathbf{f}$ 由 $m$ 个分量函数组成：

$$
f(x_{1}, \dots, x_{n}) =
\begin{bmatrix}
    f_{1}(x_{1}, \dots, x_{n}) \\
    \vdots \\
    f_{m}(x_{1}, \dots, x_{n})
\end{bmatrix}
$$

那么雅可比矩阵 $J$ 就是由所有偏导数组成的 $m \times n$ 矩阵：

$$
J =
\begin{bmatrix}
    \frac{\partial f_{1}}{\partial x_{1}} & \dots & \frac{\partial f_{1}}{\partial x_{n}} \\
    \vdots & \ddots & \vdots \\
    \frac{\partial f_{m}}{\partial x_{1}} & \dots & \frac{\partial f_{m}}{\partial x_{n}}
\end{bmatrix}
$$

简单来说，第 $i$ 行第 $j$ 列的元素，描述的就是：**当第 $j$ 个输入变量发生微小变动时，第 $i$ 个输出变量会怎么变**

## 微元变换

当计算重积分时，如果想从直角坐标系 $(x, y)$ 换元到极坐标或者自定义的 $(u, v)$ 坐标系，不能简单地写 $dxdy = dudv$，因为空间被拉伸，需要应用雅可比行列式的绝对值作为缩放因子来进行调整。

具体地：

$$
\iint_{D} f(x, y) dxdy = \iint_{D'} f(x(u, v), y(u, v)) \cdot | \text{det} (\frac{\partial (x, y)}{\partial (u, v)}) | dudv
$$
