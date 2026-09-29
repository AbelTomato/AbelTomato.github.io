---
title: 'Attention Mask——看不见是为了更好地看见'
description: '在LLM训练中，有时候看到的太多反而不是好事，因此通过Mask掩码机制去遮住模型的眼睛'
pubDate: '2026-09-29T11:35:00+08:00'
updatedDate: '2026-09-29'
heroImage: "./hero.jpg"
tags: ["笔记", "LLM"]
column:
  slug: "transformer"
  order: 7
---

## 1.绪言

Attention机制默认能够使任意的Token两两之间交流，但是实际上，在我们应用的过程中，有些位置应当被禁止访问

因为有两个问题，第一个问题是，在实际的输入中，常常会被补齐到相同长度，补齐出来的特殊Token并没有真实的语义

第二个问题是，在文本生成任务中，当前的位置不能看到未来的内容

所以Attention不能总是让所有的位置自由交流，我们需要加入一种额外的约束，从而规定哪些位置能被看见，哪些位置应当被忽略

那么这个是怎么实现的？Transformer是如何控制信息流的？这就是我们今天要讲的Mask掩码机制

---

## 2.Mask如何插入Attention公式

前文我们已经提到过，注意力分数矩阵的计算

$$
S = \frac{QK^{T}}{\sqrt{d_{k}}}
$$

我们的掩码矩阵就应该加在这里

$$
S' = S + M
$$

随后依次得出

$$
A = \operatorname{softmax}(S') \\
O = AV
$$

这样一来，完整的公式就是

$$
O = \operatorname{softmax}(\frac{QK^{T}}{\sqrt{d_{k}}} + M) V
$$

那么其中的 $M$ 矩阵是如何定义，从而能够让Transformer不去注意特定位置的Token的呢？我们有定义

$$
M_{i, j} =
\begin{cases}
0, & 允许第 i 个\text{Query}关注第 j 个\text{Key} \\
- \infty, & 禁止第 i 个\text{Query}关注第 j 个\text{Key}
\end{cases}
$$

这里的设计很巧妙，通过将特定的位置设为负无穷，从而让注意力分数计算中针对这个位置的分数获得零权重，达到一个似乎不存在这个位置的效果，这就是所谓**掩码**，将对应的位置遮掩起来

为什么要设计为负无穷？因为在 $\operatorname{softmax}$ 计算中，$e^{-\infty} \rightarrow 0$，从而在最终的权重分布中将这个位置置零

---

## 3.Padding Mask：忽略填充Token

然后我们来看两种具体的掩码应用场景

OK我们知道在实际的Transformer计算中，常常会通过一个Batch来进行并行的计算，这样一个Batch中就有多个句子，而这些句子很可能是长短不一的，比如说

```txt
我喜欢你
我饿了
```

这种长短不一的张量是不方便直接进行矩阵计算的，所以我们需要为短的句子做补全，使用类似于`<PAD>`这种特殊Token

```txt
我喜欢你
我饿了<PAD>
```

这个特殊Token的补全只是为了使得张量的形状一致，本身并没有真实的语义，所以如果不进行处理，模型可能会把`<PAD>`当做一个普通的Token从而分配注意力

所以对于第二句话，我们可以分配这样的一个Padding Mask：

$$
[0, 0, 0, -\infty]
$$

同时简短提一点，对于`<PAD>`充当Query的情况，在不同实现中可能还会额外进行处理，比如在训练中通过`ignore_index`忽略Padding位置的损失

---

## 4.Causal Mask：看不见未来才能看见未来

在LLM训练的过程中，通常是根据之前的Token来预测下一个Token，比如说通过 $x_{1}$ 预测 $x_{2}$，通过 $x_{1}, x_{2}$ 预测 $x_{3}$，通过 $x_{1}, x_{2}, x_{3}$ 预测 $x_{4}$

但是普通的Self-Attention机制是允许每个位置去关注整个序列的，那么在预测某个位置的时候，模型可以直接看到后面的位置的信息，这样的训练就没有意义，因为这样不是学会了预测，而是直接读取答案

因此我们应当允许当前位置关注自己和之前的位置，后面的则不去关注

抱着这样的一个目的，我们就可以构造出一个下三角掩码矩阵：

$$
M =
\begin{bmatrix}
    0 & -\infty & -\infty & -\infty \\
    0 & 0 & -\infty & -\infty \\
    0 & 0 & 0 & -\infty \\
    0 & 0 & 0 & 0
\end{bmatrix}
$$

在PyTorch中，大致通过下面的代码片段实现Causal Mask矩阵

```python
seq_len = 4

causal_mask = torch.triu(
    torch.ones(seq_len, seq_len, dtype=torch.bool),
    diagonal=1
)

scores = scores.masked_fill(causal_mask, float("-inf"))
attention = torch.softmax(scores, dim=-1)
```

---

## 5.小结

从本质上看，Mask并没有改变Attention分数计算的本质，它只是在其中做了一层加工，从而改变了注意力分布权重，让一些我们不希望被看到的位置隐藏起来，去规定信息应该按照什么样的方向去流动
