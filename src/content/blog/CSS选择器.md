---
title: "CSS选择器"
description: "介绍了在CSS中的各种选择器"
draft: false
pubDate: "2026-03-08"
heroImage: "../../assets/Contents/Blogs/HeroImages/CSS选择器heroImage.jpg"
tags: ["前端","笔记","CSS"]
---

## 基础选择器

### 通配选择器 `*`

将匹配文档中所有类型的HTML元素。

示例：

```css
* {
    margin: 0;
    padding: 1px;
    box-sizing: border-box;
}
```

需要注意的是，浏览器在解析通配选择器时，需要解析DOM树的**每一个**节点，对性能有较大影响。

### 元素选择器

匹配文档中所有具有对应标签名的元素。

示例：

```css
p {
    color: purple;
    line-height: 1.6;
}
```

和通配选择器差不多的问题，太过于基础，只能应用于全局基本样式。

### 类选择器

匹配具有对应类名的元素。

示例：

```html
<button type="submit" class="btn-primary">提交</button>
<button type="reset" class="btn-primary">重置</button>
<button class="btn-primary">搜索</button>
```

```css
.btn-primary {
    background-color: #007bff;
    color: white;
    border-radius: 4px;
}
```

则对应的三个 `<button>` 都会呈现出相应样式。

类选择器具有较强的复用性，且能够进行多重组合，是实际应用较为广泛的一种选择器。

### ID选择器

和类选择器有相通的原理，但区别在于ID具有唯一性，且权重更高。

由于高权重使其难以被其他CSS样式覆盖，所以难以复用。

示例：

```css
#header {
    background-color: #333;
    color: white;
}
```

## 复合选择器

### 后代选择器

`A B`表示只要B是A的后代都会被选中（儿子、孙子、重孙...）都行

示例：

```html
<article>
    <p>正文...</p>
    <section>
        <p>还是正文...</p>
    </section>
</article>
```

```css
article p {
    color: red;
    font-size: 3px;
    line-height: 1.8;
}
```

在这里，两个 `<p>` 元素都会被选中。

### 子代选择器

区别于后代选择器，`A > B`表示只有当B是A的直接子元素时，才会被选中，而不会去管孙子重孙子之类的。

示例：

```html
<article>
    <p>正文...</p>
    <section>
        <p>还是正文...</p>
    </section>
</article>
```

```css
article > p {
    color: red;
    font-size: 3px;
    line-weight: 1.8;
}
```

在这里，只有第一个 `<p>` 会被选中。

### 相邻兄弟选择器

`A + B` 表示当且仅当B是紧跟在A后面的那一个兄弟元素时，B将会被选中。

注意这里必须是**紧跟、同级、后方**。

示例：

```html
<h2>一个标题...</h2>
<p>第一段</p>
<p>第二段</p>
```

```css
h2 + p {
    color: blue;
    font-weight: bold;
}
```

在这里，只有第一个 `<p>` 会被选中。

### 通用兄弟选择器

`A ~ B` 表示当B是A后面的同级兄弟时，不管距离多远，中间是否隔着其他元素，都会被选中。

示例：

```html
<h2 class="start">标题</h2>
<p>段落1</p>
<div>分隔</div>
<p>段落2</p>
```

```css
.start ~ p {
    color: blue;
}
```

则此时两个 `<p>` 都会被选中。

## 属性选择器

`[attr]`：有这个属性就行。

`[attr="val"]`：该属性必须完全等于这个`val`值。

`[attr^="val"]`：匹配开头。

`[attr$="val"]`：匹配结尾。

`[attr*="val"]`：匹配包含。

`[attr~="val"]`：属性值是以空格为分隔的列表，其中一个等于`val`。

`[attr|="val"]`：属性值等于`val`或以`val-`开头。

在`]`前加一个`i`会在匹配的时候忽略大小写。

示例：

```css
/* 只要有disabled属性的按钮都变灰 */
button[disabled] {
    opacity: 0.5;
}

/* 只有type正好是"text"时的输入框才生效 */
input[type="text"] {
    border-color: red;
}

/* 匹配所有以https开头的链接 */
a[href^="https"] {
    color: green;
}

/* 匹配所有以.pdf结尾的文件 */
a[href$=".pdf"] {
    font-weight: bold;
}

/* 匹配名字里带"user"的任何class */
[class*="user"] {
    background: #eee;
}

/* 该处用于处理自定义属性data-tags，选中属性值带有"school"单词的。
如data-tags="student school address"会被选中。
不同于*=的是它只会匹配单词，而*=会匹配子串 */
[data-tags~="school"] {
    border: 2px solid maroon;
}

/* 匹配所有中文变体 */
[lang|="zh"] {
    font-family: "PingFang SC", sans-serif;
}
```

## 伪类和伪元素

### 伪类

#### 状态伪类

##### 交互状态

`:hover`：鼠标悬停时

`:active`：激活状态（鼠标按下去还没松开的那一瞬间）

`:focus`：获得焦点

`:focus-visible`：当用户使用键盘导航到元素时显示焦点轮廓

示例：链接的**LVHA**顺序

```css
a:link {
    color: blue; /* 还没点过 */
}

a:visited {
    color: purple; /* 已经点过 */
}

a:hover {
    color: red; /* 鼠标悬停在链接上时 */
}

a:active {
    color: yellow; /* 正在点击的瞬间 */
}
```

##### 表单和输入状态

`:checked`：适用于单选框（radio）或复选框（checkbox）

`:disabled` / `:enabled`：禁用或启用状态

`:invalid` / `valid`：根据表单的验证规则（如 `required` 或 `type="email"`）实时变色

`:placeholder-shown`：当输入框的 `placeholder` 还在显示时触发

`:read-only`：只读状态

示例：

```css
input:invalid {
    border-color: red;
}

input:valid {
    border-color: green;
}
```

##### 目标和容器状态

###### 目标状态

`:target`：用于匹配当前URL中 `id` 和 `hash` 一致的元素。

举例来说，假如当前页面有一个 `<a href="#example">` 的链接，当我们点击它时，页面的URL后面会加上一个 `#example` ，当URL处于这种状态时，页面上 `id` 为 `example` 的元素就会被选中。

而此时如果我们又点击了另一个 `<a href="#another">` 的链接，URL后面就变成了 `#another` ，此时 `id` 为 `example` 的元素就不再被选中，取而代之被选中的则是 `another`

示例：利用 `id` 匹配控制显示隐藏

```html
<a href="#login-modal">打开登录窗口</a>

<div id="login-modal" class="modal">
    <div class="content">
        <a href="#" class="close">关闭 x</a>
    </div>
</div>
```

```css
.modal {
    display: none;
}

.modal:target {
    display: flex;
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
}
```

###### 逻辑容器

`:is()` 和 `:where()`：解决了CSS的冗余问题。

示例：假如你要实现下面的逻辑

```css
.post-content h1, .post-content h2, .post-content h3, .post-content p, .post-content ul {
    margin-bottom: 1rem;
}
```

是不是显得很笨重，因为我们重复了太多次同样的内容，但我们可以使用 `:is()`

```css
.post-content :is(h1, h2, h3, p, ul) {
    margin-bottom: 1rem;
}
```

`:where()` 和 `:is()` 的用法和作用类似，区别在于权重。`:is()` 的权重由括号内权重最高的元素决定，而 `:where()` 的权重始终是0

<hr />

`:has()`能够做到让父元素感知子元素的变化。在`:has()`出现之前，父元素像一个专制的父亲，只能子元素听父元素的，但在`:has()`出现之后，父元素就懂得听取儿子的意见了。

示例：

基础逻辑：父随子变

```css
.card:has(img) {
    box-shadow: 0 10px rgba(0,0,0,0.2);
    padding: 0;
}
```

状态联动

```css
/* 用户勾选了协议复选框时，注册区域样式变化 */
.registration-box:has(input#terms:checked) {
    background-color: #e6fffa;
    border-color: #38b2ac;
}

/* 输入框报错时，父容器抖动 */
.form-field:has(input:invalid:not(:placeholder-shown)) {
    animation: shake 0.5s;
    border-left: 4px solid red;
}
```

兄弟关联：

```css
/* 选中后面紧跟着图片的.container容器 */
.container:has(> img) {
    display: grid;
}
```

甚至可以感知数量

```css
/* 如果能找到第五个li，说明总数>=5 */
ul:has(li:nth-child(5)) {
    display: grid;
    grid-template-columns: 1fr, 1fr;
}
```

#### 结构伪类

`:first-child` / `:last-child`：老大和老幺

`:nth-child(n)`：选中第几个孩子

`2n` / `even`：偶数位

`2n+1` / `odd`：奇数位

`-n+3`：前三个

`:nth-last-child(n)`：从后往前数

`:only-child`：仅一个孩子时生效

`:only-of-type`：同理，如果父元素里只有这一个类型的标签

`:not()`：否定伪类

示例：

```css
/* 选中文章中第一个段落 */
article p:first-child {
    color: red;
}

/* 将偶数行的表格背景设为灰色 */
ul li:nth-child(2n) {
    background-color: gray;
}

/* 给只有一张图片的卡片去边距 */
.card :only-child {
    padding: 0;
}

/* 选中文章中第二个二级标题 */
article h2:nth-of-type(2) {
    font-style: italic;
}

/* 给列表加边框，但排除最后一个 */
li:not(:last-child) {
    border-bottom: 1px solid #eee;
}
```

### 伪元素

伪元素使用双冒号`::`，逻辑就相当于**在渲染层面伪造一个子节点**

它不可被用于类似于 `<img>` 这样的单标签元素。

假如说我们有一段HTML

```html
<div class="box">你好</div>
```

配合上下面的CSS

```css
.box::before {
    content: "★";
}
```

在渲染引擎眼中就等价于：

```html
<div class="box">
    <pseudo-element-before>★</pseudo-element-before>
    你好
</div>
```

伪元素处于宿主元素的盒子**内部**，它具有如下逻辑特性：

1.**生命周期绑定**：它完全随宿主元素的消失而消失，没有自己的 `id`,`class`，只能通过宿主元素来操控它。

2.**事件真空**：它在逻辑上时虚无的，如果点击 `content` 渲染的部分区域，浏览器会认为你点击的是它的宿主元素，且无法独立绑定 `addEventListener`

3.**内容强制性**：在引擎逻辑中，`content`属性是创造性伪元素的心脏（例如`::before`,`::after`），如果`content`为空或者根本没写，这个伪元素不会被渲染。

有以下常用伪元素：

`::before`：放在宿主元素的最前面

`::after`：放在宿主元素的最后面

`::first-letter` / `::first-line`：属于切片类，对象是宿主元素中已经存在的文本，逻辑上相当于给对应部分套上了一个隐形的`<span>`

`::selection`：指定宿主元素中被选中的部分

`::placeholder`：用于修饰输入框中的提示文字

## 容器查询

好吧这部分内容会在另一篇笔记里完成，因为和页面布局有很重要的关系，篇幅太长不再展开。

## 权重计算法则

实际上，对于CSS样式的权重，我们可以将它看作一个向量 $[a,b,c,d]$，当我们需要比较看看对于同一个元素如果有多个样式应用到它身上的时候，我们就需要比较这些样式的向量从而判断权重大小。

### 级别规定

| 级别   | 代表对象                | 权重分值 (逻辑位) | 例子                              |
| ------ | ----------------------- | ----------------- | --------------------------------- |
| 第一级 | 内联样式 (Inline Style) | 1, 0, 0, 0        | `style="color: red;"`             |
| 第二级 | ID 选择器               | 0, 1, 0, 0        | `#header`, `#abel-blog`           |
| 第三级 | 类、属性、伪类          | 0, 0, 1, 0        | `.btn`, `[type="text"]`, `:hover` |
| 第四级 | 元素、伪元素            | 0, 0, 0, 1        | `div`, `h1`, `::before`           |

### 计算逻辑

**加法计算，永不进位**，即**低等级的累加永远无法超过高等级**

例如你写了成百上千个 `.class` ，它的权重也无法和一个 `#id` 比较。

示例：

`#nav .link:hover`：1个ID（`#nav`）=`0, 1, 0, 0`，1个类（`.link`）=`0, 0, 1, 0`，1个伪类（`:hover`）=`0, 0, 1, 0`，加起来的总权重就是`0, 1, 2, 0`

### 逻辑容器的特殊权重

`:where()`：权重永远为0

`:is()` / `:not()` / `:has()`：权重为括号里权重最高的选择器

### 额外规则

`!important`：不属于权重计算体系，但是直接覆盖所有权重，如果一个有`!important`一个没有，那毫无疑问有`!important`的权重更高。但是如果两个都有，那还是按照正常的计算方法。

**继承**：继承所得的样式权重最低，甚至低于通配符选择器 `*`(`0, 0, 0, 0`)

当前面的所有东西都一样的时候，这时候就按照CSS的“后来者居上”法则，即在CSS源码中靠后的优先级更高。若有多个CSS文件，则涉及资源加载逻辑。

1.内联样式（写在标签内的）最高

2.内部样式表（`<style>`标签）

3.外部样式表（`<link>`引入）

若两个`<link>`同时引入，则写在HTML中越靠下的文件优先级越高。
