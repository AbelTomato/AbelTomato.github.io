---
title: 'Multi-Head Attention——从多角度思考'
description: '脱离单套注意力分布的局限性，让模型在多个独立子空间中并行注意不同角度的语义分析'
pubDate: '2026-09-20T09:38:00+08:00'
updatedDate: '2026-09-20'
heroImage: "./hero.jpg"
tags: ["笔记", "LLM"]
column:
  slug: "transformer"
  order: 5
---

## 1.绪言

通过前面几篇文章，我想我们已经成功地对Self-Attention有了初步的了解

但是我们接下来看一个句子，还是以这句为例：

> AbelTomato is so handsome that girls are all captivated by his charm

现在我们从每个词应该关注的角度出发

比如`his`，它需要处理指代关系，关注`AbelTomato`

比如`handsome`，它需要处理修饰或者表语关系

再比如`captivated`，它又需要关注`girls`和`charm`

所以在这里可以看出，一个Token之间可能存在着多种关系，但是对于普通的Self-Attention，我们单个注意力矩阵只有一套注意力分布，在这种需要同时表示多类关系的场景下略显吃力

它并不是完全不能表示多种关系，但是多头注意力提供了多个独立表示的子空间，使得模型可以同时建立起不同类型的Token关系

一套Self-Attention，我们称之为单头的，那么此时我们尝试引入多头注意力机制

---

## 2.单头计算

假设拥有 $h$ 个注意力头，第 $r$ 个头拥有独立的参数

$$
W^{Q}_{r}, W^{K}_{r}, W^{V}_{r}
$$

然后输入矩阵为

$$
X\in\mathbb{R}^{n\times d_{\text{model}}}
$$

从而可以计算出第 $r$ 个头

$$
Q_{r} = X W^{Q}_{r} \\
K_{r} = X W^{K}_{r} \\
V_{r} = X W^{V}_{r}
$$

最后执行与普通的Self-Attention完全相同的缩放点积注意力分数计算

$$
\operatorname{head}_{r} = \operatorname{softmax} \left(\frac{Q_{r} K_{r}^{T}}{\sqrt{d_{k}}} \right) V_{r}
$$

其实到这里我们可以发现，对于单个头来说，它和普通的Self-Attention并无不同，或者换句话说，不同头的区别在于使用不同的可训练投影矩阵，而不是使用不同的Attention公式

---

## 3.拼接与输出投影

这一步才是多头注意力不同的地方，通过前面的计算我们可以得到同一个输入序列通过不同角度解析之后得到的结果也即 $\operatorname{head}_{r}$，但是现在它们仍然是孤立的，这一步就是要通过一轮concat将它们拼合起来

$$
H = \operatorname{Concat} (\operatorname{head}_{1}, \operatorname{head}_{2}, \dots, \operatorname{head}_{h})
$$

最后再经过输出投影

$$
O = H W^{O}
$$

多头注意力的优点就在于，它虽然同时计算了 $h$ 个头，但它通常不会去把注意力层的总维度扩大 $h$ 倍，模型会将总维度分配给各个头，因此当 $d_{k} = \frac{d_{\text{model}}}{h}$ 时，所有头合计处理的维度仍然是 $d_{\text{model}}$，这些头在具体实现上还可以进行并行计算
