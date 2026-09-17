---
title: 'Self-Attention——让我们抓住要点'
description: '从RNN时代开始，浅淡Attention到Self-Attention的演进'
pubDate: '2026-09-17T16:35:00+08:00'
updatedDate: '2026-09-17'
heroImage: "./hero.jpg"
tags: ["笔记", "LLM"]
column:
  slug: "transformer"
  order: 2
---

## 1.绪言

经过Tokenizer和Embedding的处理，我们现在成功拿到了Token所对应的向量

假设输入的语句长度为 $seq$，然后Embedding的语义维度为 $d$，那么现在就相当于给出了一个 $seq \times d$ 的矩阵

大模型要对输入的语句进行语义分析，我们尝试来看一个句子：

> AbelTomato is so handsome that girls are all captivated by his charm

如果让人类对这句话进行语义分析，就会很快地抓住其中的his指代的是AbelTomato，captivated与charm有紧密的关联

但是对于LLM来说，面对Embedding阶段后得到的每个Token向量，它们是独立的，没有融合上下文的语义，为了能够让LLM计算不同位置之间的关联，人们引入了自注意力机制——Self-Attention

---

## 2.RNN时代的Attention

事实上，Attention机制并不是Transformer架构的专属，在此之前就已经被应用于RNN模型之中

从机器翻译讲起，在把一个句子翻译为另一种语言的过程中，采用的是一种Encoder-Decoder架构，其中Encoder读完整个句子，然后将其压缩为一个固定长度的向量；随后Decoder负责解析这个向量，从头开始一步步解压，最终翻译成目标语言的文字

其中Encoder和Decoder内部都是用RNN即循环神经网络实现的，这里不阐述具体原理，大致的工作方式就是，RNN一边读句子，一边更新内部状态，读完最后一个词之后，将最终生成出的那个隐藏状态向量扔给Decoder作为初始状态，Decoder再进行逐步地解码

但是RNN的这种工作方式同样存在问题，首先是长程梯度消失问题，说成大白话就是句子太长的时候，由于RNN是逐步往后面传递信息，前面的信息在往后传递的过程中稀释得越来越厉害，最终会模糊不清

以及压缩成为定长向量的形式，不管是只有几个词的短句，还是几百词的长篇，最终都会压缩成为相同固定长度的向量，内容一长就难以在向量中清晰地表示原文的所有信息，同样造成了语义模糊

因此，RNN引入了Attention机制，具体来说，跟人类翻译文章的思路比较相似，即专注于上下文

它抛弃了传统做法中只依赖于最终Encoder输出的向量，而是将Encoder-Decoder的流程拆成了下面三个部分：

1. 首先是保留了所有的隐藏状态，即Encoder在处理原句的过程中，将每一个词所对应的隐藏状态 $h_{1}, h_{2}, ... , h_{T}$ 全部保存下来
2. 随后Decoder每准备生成一个新词，比如当前状态为 $s_{t}$，就拿这个 $s_{t}$ 去和Encoder计算得出的每一个隐藏状态 $h_{i}$ 去打点积或者过一个线性层，计算出关联度得分，然后经过Softmax处理，归一成一个概率分布 $\alpha_{t, i}$，即权重
3. 最后用这个权重和Encoder的所有隐藏状态 $h_{i}$ 进行加权求和，得到动态变化的上下文向量 $c_{t} = \sum \alpha_{t, i} h_{i}$，Decoder根据这个 $c_{t}$ 和当前状态，预测出对应的翻译词

RNN使用的Attention机制解决了在翻译或者更一般性地说，处理原句的过程中，Decoder应该去关注原句的哪些部分

但是我们会进一步想，如果原句中的一个词能够自主地去关注同一句中的其他词，那是不是就可以建立词与词之间的语义联系？

因此，Transformer的重要机制——Self-Attention出现了

---

## 3.从Attention到Self-Attention

重新来看绪言中提到的句子：

> AbelTomato is so handsome that girls are all captivated by his charm

对于普通的Attention机制，Decoder在翻译这个句子的时候，处理到第 $t$ 个状态，它会提出一个问题：在原句之中，哪些部分更值得我现在去关注？

而Self-Attention的Self就在于，它是原序列对自身的注意力生成，比如说看到`handsome`，就去关注谁`handsome`？是`AbelTomato`，造成了什么影响？`girls are all captivated...`

同样地，看到`captivated`，就更多地注意到`girls`和`charm`

Self-Attention的核心过程其实和Attention没有太大差别，最主要的差异就是信息的来源，在传统的Encoder-Decoder Attention中，查询来自Decoder，被关注的信息来自Encoder；而对于Self-Attention，查询和被关注的信息都来自于一个序列
