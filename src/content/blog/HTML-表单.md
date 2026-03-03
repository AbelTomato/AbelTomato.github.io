---
title: '表单'
heroImage: "./HTML-表单heroImage.jpg"
pubDate: '2026-03-03'
description: '在HTML的学习中对于表单内容的一点整理'
tags: ["前端","HTML","笔记"]
---

前面的HTML学习都没有写什么笔记，但这一章感觉比较重要，主要是实现了网页的交互，表单发送数据也与后端有所关联，再加上知识点比较多而复杂，所以写一篇笔记以加深印象。

## \<form\>

### 作用

整个表单的结构基础

### 属性

有两个最为重要的属性：**action** 和 **method**

其中 **action** 控制表单的数据提交到哪里，一般指向后端接口地址。

**method** 控制表单的提交方式，常用值有 **GET \ POST** ，默认值为 **GET** ，平时需要注意 **GET** 是以明文方式提交的，安全性较差。

## \<label\>

### 作用

$\cdot$ 可点击放大区，点击文字（ **label** 中的内容）就可以选中对应的输入框。增加输入友好度。

$\cdot$ 无障碍访问：有助于屏幕阅读器用户使用。

$\cdot$ 使代码语义更清晰，确定了这些文字是给哪个输入框当标题的。

### 使用方法

和控件元素一对一绑定，如：

```html
<label for="nickname">昵称：</label>
<input type="text" id="nickname" name="nick">
```

**label** 中填写对当前表单控件的描述，即用户应当输入什么。

### 属性

**for:** 与对应控件元素的 **id** 属性相对应，是 **“点击label文字=点击控件”** 功能的核心，同时也有助于无障碍性的提升。显式关联了 **label** 和控件元素。

以及 **style** 等样式元素，不多介绍。

## \<input\>

### 作用

表单的核心功能，表示用户的输入数据项。

### 使用方法

独立元素

```html
<input type="text" name="name" id="name" />
```

### 属性

**type：** 表单控件类型，常用类型如下：

| type 值        | 外观/功能            | 典型场景         | 移动端键盘优化 | 自动校验       |
| -------------- | -------------------- | ---------------- | -------------- | -------------- |
| text           | 普通单行文本         | 姓名、用户名     | 正常键盘       | —              |
| password       | 密码（小圆点）       | 登录、注册       | 正常           | —              |
| email          | 邮箱输入             | 注册、找回密码   | 邮箱键盘       | 有@和.         |
| tel            | 电话号码             | 手机号           | 数字键盘       | —              |
| number         | 数字（可点上下箭头） | 年龄、数量       | 数字键盘       | 数字           |
| date           | 日期选择器           | 生日、入职日期   | 日期滚轮       | 格式           |
| datetime-local | 日期+时间            | 预约、活动时间   | —              | —              |
| month / week   | 只选月 / 周          | 账单周期         | —              | —              |
| time           | 只选时间             | 上课时间         | —              | —              |
| url            | 网址                 | 个人网站         | 网址键盘       | 必须http/https |
| search         | 搜索框（小叉×）      | 站内搜索         | 搜索键盘       | —              |
| checkbox       | 多选框               | 兴趣爱好、权限   | —              | —              |
| radio          | 单选框（必须同name） | 性别、支付方式   | —              | —              |
| file           | 文件上传             | 头像、简历       | —              | —              |
| color          | 颜色选择器           | 主题色、设计工具 | —              | —              |
| range          | 滑块                 | 音量、评分       | —              | —              |
| hidden         | 隐藏域（用户看不见） | 传用户ID、token  | —              | —              |

**name：** 为该数据项指定一个名称。当表单提交时，数据会以名值对的形式提交，如在

```html
<input type="text" name="email" />
```

中填入 `example@gmail.com` 时，提交数据时就会以 `email=example%40gmail.com` 的形式提交。

**id：** 指定一个用于标识该元素的ID。在这里用于将表单控件与对应的 `<label>` 标签关联起来。

**required：** 表示该表单控件在提交前必须填写。

**value：** 初始值，可用于表示某个数据项的默认值。

**placeholder：** 提示文字。

**maxlength / minlength：** 字符长度限制。

**patern：** 正则校验（自定义规则）

**autocomplete：** 浏览器自动填充

**disabled：** 禁用

**readonly：** 只读（`readonly`提交value，`disabled`不提交）

**min / max / step：** 数值 / 日期范围限制

**multiple：** 多选

**accept：** 文件类型过滤

**checked：** 默认选中

**form：** 关联 `form` （即使不在 `form` 里）

**list：** 关联 `<datalist>` 提供建议

**autofocus：** 页面加载自动聚焦

## \<button\>

### 作用

当 `<button>` 元素被放在 `<form>` 元素中时，它具有默认行为：提交表单。

### 属性

**type：** 在这里只讲和表单相关的属性，包括 **submit** （提交表单，默认），**reset** （重置表单），**button** （纯JS触发，用于弹窗、切换TAB等）

**name：** 提交时的字段名（用于多提交按钮区分）

**value：** 提交的值（name有值时生效）

**form：** 关联 `form` 的id，`button` 不在 `form` 中也能提交。

**formaction：** 覆盖 `form` 的 `action` （用于提交到别的URL等）

**formmethod：** 同理，覆盖 `form` 的 `method` 值。

**formenctype：** 覆盖 `enctype` （`multipant` / `formdata` 等）

**formnovalidate：** 提交时跳过HTML5校验。

**formtarget：** 覆盖 `target` （_blank等）

## \<textarea\>

### 作用

多行文本输入，可以让用户输入长文本（简介、留言、评论、简历等）

可以实现回车、多行、resize拖拽。

## \<select\> + \<option\> + \<optgroup\>

### 作用

下拉选择框

### 使用方法

示例：

```html
<select name="major" required>
    <option value="" disabled selected>请选择你的专业</option>
    <optgroup label="计算机类">
        <option value="cs">计算机科学与技术</option>
        <option value="se">软件工程</option>
    </optgroup>
    <optgroup label="其他">
        <option value="math">数学</option>
    </optgroup>
</select>

<select name="skills[]" multiple size="5">
  <option value="html">HTML</option>
  <option value="css">CSS</option>
  <option value="js">JavaScript</option>
</select>
```

## \<fieldset\> + \<legend\>

### 作用

将表单切分为逻辑块（个人信息、地址、支付方式等）

**\<legend\>** 是分组标题

### 使用方法

示例：

```html
<fieldset>
    <legend>个人信息</legend>
    <label for="name">姓名：</label>
    <input type="text" id="name" name="name">
    <!-- 其他输入 -->
</fieldset>

<fieldset disabled>
    <legend>管理员专区</legend>
    <!-- ... -->
</fieldset>
```

## \<datalist\>

### 作用

给 `text` 输入提供下拉的建议，用户可自定义输入，通过 **list** 属性关联 `datalist` 的 **id**

### 使用方法

示例：

```html
<input type="text" list="framworks" placeholder="输入前端框架">
<datalist id="framworks">
    <option value="React"></option>
    <option value="Vue"></option>
    <option value="Svelte"></option>
    <option value="Angular"></option>
</datalist>
```
