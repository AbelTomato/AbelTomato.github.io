---
title: 'Fiber架构、state与渲染'
description: '简单介绍了React中的Fiber架构，并阐述了其在Render与Commit中的作用方式'
pubDate: '2026-05-08'
updatedDate: '2026-05-08'
heroImage: "./hero.png"
tags: ["前端", "React", "笔记"]
---

## 1.前言

在使用React的组件的过程中，我们发现，有时候我们需要去维护一些只隶属于组件本身的数据。比如说一个相册组件，我们需要记录当前翻到了第几页，从而能够在"点击下一页"这个动作发生后，重新渲染的过程中，通过当前的页数推断下一步的渲染结果，是翻到最后一页了不再重新渲染新图片，还是渲染下一张图片。而这个页数就是我们需要记录的。

在一般的思维下，我们可能会这样实现：

```ts
import { images } from './assets';

export default function Gallery() {
    let index = 0;

    function nextPage() : void {
        index = Math.min(index + 1, images.length - 1);
    }

    return (
        <>
            <button onClick={ nextPage }>下一页</button>
            <img src={images[index]} alt={ `第${index}张图片` } />
        </>
    );
}
```

但是当我们实际去运行代码的时候，就可以发现点击按钮之后并没有触发重新渲染，这是为什么？

原因有二：

- **缺乏触发机制**：在React中，局部变量的改变不会告诉React需要更新UI，所以你狂点下一页什么都不会发生，虽然实际上在这个组件内部，index的值确实在不断增长，但无法触发重新渲染，所以也就体现不出效果。
- **缺乏持久化能力**：根据我们想要实现的效果，假设我们通过某种手段让`Gallery`组件触发了重新渲染，在React中，它将会再次调用`Gallery()`这个组件函数，而结果就是在一开头的`let index = 0;`处，使得`index`重新被置为0，则更改也未能生效。

所以显然使用这种方式来存储组件内部状态是不可行的，那么这就是我们今天要讲的，React提供的`state`方法很好解决了这个问题。

---

## 2.Fiber架构

在介绍`state`之前，我们需要先简要讲一下Fiber架构。

### 2.1.为什么要有Fiber架构？

这里是一些历史问题，稍微提一下。

大概来说，就是在React 15以及更早之前，React使用的是**Stack Reconciler(栈协调器)**。

我们不细说它的工作方式，只需要知道：**它一旦开始，就必须一口气跑完**。

毫无疑问，任何人都可以看出，在无比复杂的浏览器环境中，谁知道在你渲染的时候用户会不会又去点什么按钮？然后用户看到没反应，急性子就直接把网页关掉了。

- **痛点**：如果组件树太深，JavaScript引擎就会长时间地霸占主线程，然后你知道的。
- **后果**：由于主线程被React占用，浏览器无法处理用户点击、动画刷新，在用户看来，网页就像死机了一样。

---

### 2.2.Fiber是什么？

Fiber本质上是React的一种**工作单元(Unit of Work)**。

具体来说，你可以把它理解成一种**虚拟DOM节点**，什么叫虚拟DOM节点？区别于真正的DOM节点，它是一种**JavaScript对象**，使用的目的是为了减少对真实DOM节点的直接操作，聚焦于真正需求的核心属性，从而降低性能压力。

而Fiber相对于普通的虚拟DOM节点，又多了一个比较牛逼的功能：**它可以被打断，也可以被恢复**。这也就是说明，在它内部存储了当前的工作状态，它是具有"记忆性的"。

Fiber架构就是对于每个Fiber节点，通过维护它的`child`、`slibing`、`return`三个指针，所组成的单向链表树。

- `child`：指向第一个子节点。
- `slibing`：指向下一个兄弟节点。
- `return`：指向父节点。

这种链表结构，也就是**Fiber Tree**，取代了之前的树状结构，让React可以像遍历链表一样遍历Fiber节点，随时停下来去干别的事，并且可以再回来找"进度条"。

---

### 2.3.Fiber的核心：时间分片(Time Slicing)

Fiber架构将渲染过程分成了两个阶段：

#### 2.3.1.第一阶段：Reconciliation(协调阶段 / Render阶段)

- **特点**：**异步、可中断**
- **工作内容**：React将会在这个阶段对比新旧内容，找出哪些地方需要更新。这里使用到了**Diff算法**。
- **中断**：如果此时用户点击了某个按钮或者执行了什么需要立即处理的操作，React会直接丢下当前的工作，去处理用户交互。等待主线程闲置，再回来处理没完成的工作(或者推倒重来)。

#### 2.3.2.第二阶段：Commit(提交阶段)

- **特点**：**同步、不可中断**
- **工作内容**：当前面第一阶段将所有需要更改的地方都计算完毕时，就会一次性将这些变换应用到真实的DOM上。

---

### 2.4.双缓存技术(Double Buffering)

为了提升树的构建与替换速度，React采用了双缓存技术。具体来说，在React内部，维护了两棵Fiber树：

- **`current tree`**：当前屏幕上正在显示的树
- **`workInProgress tree`**：正在内存中构建的树

当 **`workInProgress tree`** 构建完成并且commit到DOM后，React只需要简单地交换一下指针，新的树就变成了 **`current tree`**

---

## 3.`state`

### 3.1.介绍

我们上面提到，由于`index`是活在组件函数里面的，每次组件函数被调用之后都会重置它的状态，且在实际情况中，我们显然会多次地在重新渲染网页的过程中调用组件函数。

而在这里我们用到的`useState`就是一种Hook，即钩子函数。什么叫Hook？具体来说，它是在React 16.8引入的一套函数，能够在不写`class`的情况下，去"勾住"**组件的状态(state)和生命周期(lifecycle)**

那么我们可以通过什么方法存储数据，从而让组件函数被重新调用后，数据保持不变呢？既然放在组件内部不行，那我们就把持久化存储。如何持久化存储呢？这就用到了我们前面所提到的Fiber节点。

我们先来看看`state`的用法：

```ts
import { useState } from 'react';
import { images } from './assets';

export default function Gallery() {
    const [index, setIndex] = useState(0);

    function nextPage() : void {
        setIndex(Math.min(index + 1, images.length - 1));
    }

    return (
        <>
            <button onClick={ nextPage }>下一页</button>
            <img src={ images[index] } alt={ `第${index}张图片` } />
        </>
    )
}
```

在这里，`[index, setIndex]`中，`index`就是我们维护的状态变量，`setIndex`就是`setter`函数，`useState(0)`代表将`index`初始化为`0`。

当我们调用`setIndex(newValue)`时，就会发出一个在下一轮渲染时将`index`的值修改为`newValue`的异步请求。

我们前面提到，`useState`是一种Hook，它用于存储组件的状态。那这些Hook又放在哪呢？这就又需要引入我们说过的Fiber节点。

1.**Hook住在Fiber里**

我们提到Fiber是一个JavaScript对象，它具有记忆性。

当我们初次调用一个状态变量的`useState()`时，React并不是在函数内部开辟空间，而是找到当前正在执行的那个**Fiber节点**。

对于每个Fiber节点，都有一个属性叫做`memorizedState`，这个属性不是存一个值，而是存一个链表。

2.**第一次渲染：Mount阶段**

- **工作内容**：第一次执行`Gallery()`时，`useState(0)`会在对应Fiber节点的`memorizedState`属性维护的链表上挂下第一个节点(Hook对象)
- **存储内容**：这个Hook对象里存着`baseState: 0`和一个空的`queue`(更新队列)

3.**当`setIndex()`执行时**

- **动作**：假设当前的`index`值为`0`，则此时我们执行`setIndex(1)`
- **发生了什么**：需要注意的是，它并不像我们所预想的那样，立即改变`memorizedState`链表中对应的`index`值，而是往这个Hook对象中，我们前面提到的`queue`里塞入了一个更新任务。
- **触发**：随后React调度一次新的渲染，告诉浏览器应当开始构建`workInProgress tree`了

4.**Update阶段的对号入座**

当我们重新进行渲染，执行到`Gallery()`组件函数，即第二次调用时，React再次运行到`const [index, setIndex] = useState(0)`时，不会再创建一个新的状态并挂载到链表中，而是去`current tree`对应的Fiber节点里面寻找到那个Hook链表。

此时再按照顺序找到第一个Hook，把`queue`里面的更新计算出来，返回新的值给`index`

---

我们大概整理一下：每个React组件对应一个Fiber节点，同时每个React组件又有很多状态(Hook)，于是Fiber节点在`memoizedState`属性中维护一个Hook对象链表，将每个Hook依次挂载到上面，维护状态值，以及一个`queue`代表更新队列。

下面我们来详细拆解一下逻辑。

---

### 3.2.`queue`

#### 3.2.1.介绍

在Fiber节点的`memoizedState`中，每个Hook对象都有自己的`queue`

```js
const queue = {
    pending: null,      // 指向最后一个处理的 update 对象
    interleaved: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderdReducer: reducer,
    lastRenderedState: (initialState)
};
```

---

#### 3.2.2.结构

对于这个`queue`，它并不是简单的数组，而是一个环形链表。

当你调用`setState()`时，React会创建一个`update`对象并把它塞进`queue.pending`

在这里，`queue.pending`指向的永远是最后加入的那个更新，而`queue.pending.next`指向的就是第一个更新，这是由它的环形结构决定的。

为什么要这样做呢？这样的话，React只需要维护一个`pending`指针，就能够同时快速访问到链表的头和尾。而Fiber是内存敏感的，采用这个设计使得空间得到了优化。

并且当`queue.pending`指向最后一个`update`时，`queue.pending.next`就是第一个`update`，这意味着在进行并发更新时，不需要遍历整个链表就能直接完成插入操作。

---

#### 3.2.3.工作流程

##### 3.2.3.1.阶段一：入队(Dispatch Phase)

假设用户点了三次按钮，发起了三次`setState()`请求。

对于第一次，由于`queue`内部为空，将`pending`指向`update1`，同时自己连自己。

对于后续更新，则有：

- `update2.next = update1`
- `update1.next = update2`
- `queue.pending = update2`
- `update3.next = update2`
- `update2.next = update3`
- `queue.pending = update3`

#### 3.2.3.2.阶段二：渲染(Render Phase)

当React开始处理这个Hook的更新时：

1.它首先会拿到`queue.pending`

2.根据`queue.pending.next`拿到链表头

3.将环形链表剪断，变成普通的单向线性链表

4.从头开始遍历，根据`baseState`以及每一步的计算逻辑依次计算每一个`update`后的值

5.**处理优先级(Lanes)**：如果某个更新的优先级不够，React将会跳过它，但是把剩下的更新保存在`baseQueue`中，等到下次渲染再进行计算。

---

## 4.调用`setState()`之后

### 4.1.`update`挂载到两棵树的`queue`里

我们知道，React内部维护了两棵Fiber树，一棵是当前在网页上显示出来的，即为`current tree`，另一棵是正在内存中构建的`workInProgress tree`(WIP)

当一个组件调用`setState()`函数，创建`Update`对象，它会将这个对象发往哪棵树上的`queue`呢？答案是两棵树都会发送。

假如说我们只挂在`current`，那正在构建的`WIP`可能已经处理完这个Hook了新状态就漏掉了。

如果只挂在`WIP`，我们知道Fiber架构显著的特点就是可中断性，假如说这次渲染因为其他高优先级任务被中断，而且`WIP`被废弃了，那么下次渲染时，React还是得要从`current`克隆，没挂在`current`上面的更新就丢掉了。

所以为了确保这次更新能够及时且安全，我们选择在两棵树上都挂上`Update`

---

### 4.2.指针交换与旧树复用

当`WIP`树在内存中完全构建好(进入Commit阶段)时，React执行`root.current = workInProgress;`

需要注意的是，交换之后，原来的旧`current`并没有被销毁，而是作为草稿。

等待下一次更新到来，需要再次构建`WIP`树时，在这个废弃的旧树的基础上，与`current`进行对比，进行按需覆盖。

具体如何覆盖？首先我们需要知道一个核心机制：**Alternate(替身)**

在Fiber架构中，每个Fiber节点都有一个`alternate`属性

- `current.alternate`指向`WIP`节点
- `WIP.alternate`指向`current`节点

在`WIP`的构建中，如果一个节点发生了变化，React会先检查`current.alternate`是否已经存在一个旧的`WIP`节点(也就是上次渲染留下的)

如果有的话，直接把那个旧对象的属性覆盖掉，完成了复用。

如果没有，才去`new`一个新的Fiber对象。

---

### 4.3.WIP树的构建

- 从Fiber Root开始，逐渐向下。
- 对每个Fiber节点，先看`current`树中的节点，看`props`更新了吗？`context`变了吗？`queue`里面有更新吗？如果没有变化，直接复用原来的；否则创建新的Fiber子节点
- 如果是新生成的Fiber，React将会给它打上`Placement`(移动)、`Update`(更新)之类的**EffectTag**
- 到达底部之后开始向上回溯，把子节点的补丁一层层向上汇总到根节点。

---

### 4.4.`beginWork`

所谓`beginWork`，就是一个函数，它接收一个Fiber节点，判断它是否需要更新，以及如果需要，如何生成它的子节点。

它在`WIP`树上工作，对于每个`WIP`树上的Fiber节点，它对比`current`树上对应的节点，决定这个`WIP`节点应该长什么样。

#### 4.4.1.复用还是更新

在执行具体逻辑前，`beginWork`将会先对比`current`和`WIP`对应节点的属性。

- **Bailout(复用 / 跳过)**：
  如果`props`、`context`没变，且节点本身没有需要处理的`update`，React将会调用`bailoutOnAlreadyFinishWork`,意思就是不执行组件函数，直接克隆旧的子Fiber
- **进行更新**：
  如果上述条件不满足，就会进入具体更新逻辑。
- **具体步骤**：
  我们在这里以上面的`Gallery()`组件函数为例，看看它是怎么进行更新的：

  - **执行函数**：首先调用`Gallery()`
  - **计算状态**：这一步就和前面的`queue`有紧密的关系，通过更新队列来计算最新的`index`
  - **返回结果**：函数执行完之后，通过新的状态返回新的JSX代码
- **协调子节点**：
  此时，我们知道`beginWork`拿到了新的JSX，那么就会和当前的`current`树去做一个对比(Diff)

  - **如果是新来的**：创建一个新的Fiber节点，挂到WIP树上，打一个`Placement`标签
  - **如果是删掉的**：在`WIP`树中不管了，但是在对应的旧节点上打一个`Deletion`标记
  - **如果是位置换了**：把旧节点拿回来复用，改个指针，打个`Placement`标签

---

#### 4.4.2.分发逻辑：身份识别

我们在4.4.1中所提到了逻辑其实只是`beginWork`函数针对不同Fiber节点进行不同处理逻辑中的一种。

`beginWork`将会根据Fiber节点的`tag`类型不同走不同的分支：

- **FunctionComponent**：执行组件函数，处理Hook逻辑
- **HostComponent**：处理原生DOM标签
- **HostText**：处理文本节点
- **Fragment / ContextProvider**：处理对应的特殊组件逻辑

---

#### 4.4.3.`beginWork`何时开始？

在React中，从`FiberRoot`开始执行`beginWork`的过程，叫做**进入Render阶段**，它会由以下的几种情况触发：

1.**初始渲染(Mount)**

当第一次调用`root.render(<Gallery />)`时，React将会创建`FiberRoot`

此时React发现这是一片空白，于是从头开始构建。立即调度一个任务，从`FiberRoot`开始，向下执行`beginWork`

2.**状态更新(Update)**

当我们调用`setIndex()`时，React会创建一个`Update`对象，把它挂载到对应的Fiber节点的`queue`里

然后从这个Fiber节点开始，向上溯源，直到寻找到`FiberRoot`，沿途对路径上的所有Fiber节点都打上"有子节点需要更新"的信号(Lanes优先级)

`FiberRoot`收到信号之后，向浏览器请求一个空闲时间。

等到浏览器有空闲时间时，React将会从`FiberRoot`开始，依次向下执行`beginWork`。其中如果某个Fiber节点没有被打上更新标记，浏览器会跳过对应的整个子树。

---

### 4.5.`completeWork`

如果说`beginWork`是在根据`current`树的状态去调度发布任务的过程，那么`completeWork`就是完成这些任务，最终构建出`WIP`树的关键步骤。

它主要负责两件事：

1.**创建或更新DOM节点(针对原生标签)**

2.**收集副作用(Flags / EffectTag)**：告诉后面的Commit阶段，哪些节点要增删改。

它什么时候触发？就在`beginWork`返回`null`，即代表已经遍历完成之后，开始自底向上回溯。

---

### 4.6.Commit阶段

在前面的Render阶段，虽然看上去轰轰烈烈，但实际上对你屏幕上显示什么并没有影响。因为它实际上只是在计算Diff，而Commit阶段才是真正意义上地去操纵真实DOM。而它是同步执行的，无法被中断。

它具有三个主要的子阶段：

- **Before Mutation(渲染前)**：
  React将会在这里遍历Fiber树，看看有没有类组件实现了`getSnapshotBeforeUpdate`

  - **核心任务**：触发相关生命周期，调度`useEffect`
- **Mutation(渲染中)**：
  在这个阶段，React将会根据Fiber节点的`flags`执行对应的DOM操作(插入、更新、删除)

  如果是`Deletion`，还会递归地清理子节点的Ref和卸载相关的生命周期
- **Layout(渲染后)**：
  此时DOM已经更新完毕，但还没有绘制屏幕，React开始处理布局

  它会执行`useLayoutEffect`的回调函数，并更新类组件的`componentDidMount`或者`componentDidUpdate`。同时将真实的DOM节点挂载到`ref.current`上

---

### 4.7.总结

1.**触发**：`setState()`发起更新请求

2.**调度**：`Scheduler`算出谁的优先级比较高

3.**渲染阶段(Render Phase)**：

- `beginWork`：向下分叉，找差异
- `completeWork`：向上收束，建DOM

4.**提交阶段(Commit Phase)**：一次性把内存里的`WIP`树映射到真实世界
