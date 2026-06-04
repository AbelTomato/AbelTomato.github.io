---
title: "异步生成器"
description: "大致介绍了异步生成器的应用与意义"
pubDate: "2026-06-04"
updatedDate: "2026-06-04"
heroImage: "./hero.jpg"
tags: ["Agent", "JavaScript", "Python", "笔记"]
---

## 1.生成器

在介绍异步生成器之前，我们先对生成器这个概念进行大致的了解

所谓生成器，其实就是一种特殊的函数。寻常的函数采用的是**一口气**执行到底的方式，在遇到`return`或者抛出错误之前不会停止

而生成器函数则支持在某个你想要暂停的地方停下来，然后将某个阶段的结果传出到外界，这种语句称为`yield`，可以将它视作执行之后还能够恢复函数继续执行的`return`

在本文，我们采用JavaScript和Python两门语言来演示生成器相关的代码，因为它们对生成器的实现是最为经典的

例如，我们如果想要实现一个功能，调取一个函数，使得每次调取所得到的返回值都比前一次的返回值增加1

如果使用传统的JavaScript闭包实现，就是这样的：

```js
const f = () => {
  let curr = 0;
  return () => {
    curr++;
    return curr;
  };
};

const counter = f();

console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

但是如果使用生成器函数来实现，就可以做到这样的效果：

```js
function* f() {
  let curr = 0;
  while (true) {
    curr++;
    yield curr;
  }
}

const counter = f();

console.log(counter.next().value); // 1
console.log(counter.next().value); // 2
console.log(counter.next().value); // 3
```

类似地，Python里也有：

```python
def f():
    curr = 0
    while True:
        curr += 1
        yield curr

counter = f()

print(next(counter))    # 1
print(next(counter))    # 2
print(next(counter))    # 3
```

同时，生成器都是内置迭代器的，支持循环迭代

```js
const counter = f();

for (let num of counter) {
  console.log(num);
}
```

```python
counter = f();

for num in counter:
    print(num)
```

为什么需要生成器？因为它让实现更加优雅，效率更高。

在传统思维中，我们要实现对一批数据的处理，需要在外界使用例如`index`这样的变量来记录当前处理到哪里了

但对于生成器，它天生就具有**保存**当前状态并**恢复**的能力

外界不需要记住当前处理到什么地方，只需要在需要获取下一个值的时候调用生成器使其迭代即可，它具有**惰性求值**的特性

同时，我们在[JavaScript异步学习笔记](../JavaScript异步学习笔记/index.md)中也讲过，它是现代异步编程的雏形，早期的`co`库就是通过生成器实现的，这也与我们接下来要说的异步生成器有所关联

---

## 2.异步生成器

## 2.1.使用

所谓异步生成器，其实就是异步编程和生成器融合所衍生的产物

试想这样一个场景：前端需要从多个不同来源爬取数据并表现在网页上

如果你采用`Promise.all`然后`forEach`来实现，那在数据量过大的情况下，这样的爬取会瞬间撑爆浏览器的内存

异步生成器所解决的痛点就是：**按需**、**分批**、**异步**地获取数据

我们来看使用示例：

```js
async function* getData(sources) {
  for (const source of sources) {
    try {
      const response = await fetch(source);
      if (!response.ok)
        throw new Error(`HTTP Error! status: ${response.status}`);
      const data = await response.json();
      yield data;
    } catch (error) {
      console.error(`Fetch failed for ${source}`, error);
    }
  }
}

const urls = [
  "[https://example/page1.com](https://example/page1.com)",
  "[https://example/page2.com](https://example/page2.com)",
  "[https://example/page3.com](https://example/page3.com)",
];

async function processing() {
  const dataStream = getData(urls);

  for await (const data of dataStream) {
    console.log("收到数据:", data);
    renderToUI(data);
  }
}
```

```python
import httpx

async def getData(sources):
    async with httpx.AsyncClient() as client:
        for source in sources:
            try:
                response = await client.get(source)
                response.raise_for_status()
                data = response.json()
                yield data
            except Exception as e:
                print(f"{source}抓取失败：{e}")

urls = [
    "https://example/page1.com",
    "https://example/page2.com",
    "https://example/page3.com",
]

async def processing():
    streamData = getData(urls)

    async for data in streamData:
        print(f"收到数据{data}")
        # 处理逻辑...
```

---

## 2.2.意义

- 彻底解决管道堵塞与内存暴涨
  在传统异步控制中，如果我们使用`Promise.all`或者Python的`asyncio.gather`，程序会同时发起所有请求，并在内存中**同时**等待所有结果返回
  - **痛点**：如果要处理100万条流式数据，内存会直接撑爆；如果下游处理慢，数据积压在内存中会导致严重的"背压"问题
  - **解决**：异步生成器实现了**按需拉取**，只有当下游的`for await`或者`async for`腾出空来，准备消费下一个数据时，上游才会触发下一次异步操作，在概念上完美契合了**流**的思想

- 完美的**生产者-消费者**解耦
  在架构设计中，数据的**获取逻辑**和**处理逻辑**往往需要解耦

  传统的做法是引入复杂的队列和事件订阅

  而异步生成器让解耦变得极其优雅：生成器函数只扮演**生产者**，负责异步获取数据并`yield`；消费函数只扮演**消费者**，负责`for await`消费。两者的速度同步和调度完全由底层的运行时自动管理

- Agent开发的核心：LLM流式输出(Streaming)
  大模型的 **流式响应(SSE, Server-Sent-Events)** 底层是通过异步生成器实现的

  后端通过异步生成器，一边接收大模型服务商的token流，一边`yield`给HTTP响应流，前端同时用`for await`实时渲染

- 弥补同步迭代器的不足
  普通的生成器只能在计算间隙暂停，但无法在等待网络请求、磁盘IO时交出线程控制权。

  异步生成器通过允许在内部使用`await`，使得函数在暂停`yield`的同时，还能在等待IO`await`时把控制权交还给事件循环，让单线程能够处理高并发

表格总结：

|               概念                |         返回值类型          |                  暂停机制                  |                   适用场景                   |
| :-------------------------------: | :-------------------------: | :----------------------------------------: | :------------------------------------------: |
|           **普通函数**            |           单个值            |             `return`(不可恢复)             |              基础计算、常规逻辑              |
|       **异步函数**(`async`)       |     `Promise`/`Future`      |          `await`(等待单个IO完成)           |           单次网络请求、数据库查询           |
|    **同步生成器**(`function*`)    |   迭代器对象(`Iterator`)    |        `yield`(同步暂停，状态保留)         |       斐波那契数列、大文件逐行同步读取       |
| **异步生成器**(`async function*`) | 异步迭代器(`AsyncIterator`) | `await` + `yield`(异步等待 + 按需分批产出) | LLM流式输出、海量API分批爬取、股票实时数据流 |
