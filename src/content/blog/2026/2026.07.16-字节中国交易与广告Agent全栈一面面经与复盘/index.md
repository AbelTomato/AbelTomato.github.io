---
title: '2026.07.16-字节中国交易与广告Agent全栈一面面经与复盘'
description: '2026.07.16-字节中国交易与广告Agent全栈一面面经与复盘'
pubDate: '2026-08-23'
updatedDate: '2026-08-23'
heroImage: "./hero.jpg"
tags: ["面经"]
---

## 八股

### 箭头函数和普通函数有哪些区别

|      维度       |               普通函数(`function`)                |               箭头函数(`() => {}`)               |
| :-------------: | :-----------------------------------------------: | :----------------------------------------------: |
|   `this`指向    | 动态绑定(谁调用指向谁，可用`call/apply/bind`改变) | 词法绑定(捕获定义时外层作用域的`this`，不可改变) |
| `arguments`对象 |            拥有内置的`arguments`伪数组            |    没有`arguments`(需用Rest参数`...args`替代)    |
|  构造函数能力   |         可以作为构造函数，通过`new`实例化         |       不能作为构造函数，使用`new`时会报错        |
| `prototype`属性 |                        有                         |                       没有                       |
|   重复参数名    |             非严格模式下允许同名参数              |               语法级别禁止同名参数               |

关于`arguments`对象那一行

在普通函数中，JS引擎会自动注入一个名为`arguments`的隐式对象，其中包含了调用该函数时传入的所有实参

它表面上是数组，但其实是伪数组，它有`length`属性，但是无法调用诸如`map, filter, reduce`这样的数组方法

对于箭头函数，`arguments`对象不存在，如果在箭头函数中尝试调用`arguments`，它会尝试顺着作用链向外层寻找使用别人的`arguments`

```js
const arrow = () => {
    console.log(arguments); // 浏览器环境中直接报错ReferenceError，Node环境中拿到的是Node模块的arguments
};

function outer() {
    const inner = () => {
        console.log(arguments[0]);
    };
    inner();
}

outer("a"); // 输出"a"
```

在ES6，为了满足对应需求，箭头函数可以使用Rest参数

```js
const makeSum = (...args) => {
    console.log(Array.isArray(args));   // True
    return args.reduce((acc, cur) => acc + cur, 0);
};

console.log(makeSum(1, 2, 3, 4)); // 10
```

此时的`args`就是真正的数组了

---

### 跨域

跨域就是浏览器出于安全考虑，限制了一个源的脚本与另一个源的资源进行交互

源由三要素组成：**协议**、**域名**、**端口**，只要这三者中有一个不同，浏览器就认定其为不同源，即为跨域

先解析一下网址的构成:

```txt
http://www.example.com:8080/index.html
```

- 最开始的`http:`是协议
- 后面`www.example.com`为域名
- `8080`为端口
- 再后面`index.html`即为文件路径

在跨域中，看的就是前面三个的一致性

需要注意的是，**跨域是浏览器的行为，而不是服务器的限制**。你的请求其实已经发送到了服务器且正常响应返回数据，但是浏览器发现跨域，拦截了响应

以及`<img>`、`<script>`、`<link>`等标签引入资源不受同源策略限制，只有Ajax或者Fetch这种发起的异步HTTP请求才会被拦截

---

### React组件通信方式

大致有以下几种方式：

- 父传子：Props
- 子传父：回调函数
- 跨层级通信：Context API，Props透传过多会引起代码结构复杂混乱，使用`React.createContext`和`useContext`构建区域上下文
- 状态提升：兄弟组件通信，把共享的状态放到它们最近的共同父组件中管理，一个子组件触发父组件的更新，一个子组件实时读取更新后的Props
- 全局状态管理：Redux / Zustand / Jotai (中央仓库)
- 订阅/发布模式或者自定义事件

代码示例：

**Props与回调：**

```ts
import { useState } from 'react';

function Child({ name, onUpdateName } : { name : string, onUpdateName : (newName : string) => void }) {
    return (
        <div>
            <p>{name}</p>
            <button onClick={() => onUpdateName(`${name}114514`)}>
                change
            </button>
        </div>
    );
}

export default function Parent() {
    const [userName, setUserName] = useState('Abel');

    return (
        <h2>State: {userName}</h2>
        <Child name={userName} onUpdateName={(newName) => setUserName(newName)} /> 
    );
}
```

**状态提升：**

```ts
import { useState } from 'react';

function InputSibling({ value, onChange}: { value: string, onChange: (v: string) => void}) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="输入..."
        />
    );
}

function DisplaySibling({ text }: { text: string }) {
    return <div>同步显示: {text || "暂无内容"}</div>;
}

export default function Ancestor() {
    const [sharedText, setSharedText] = useState('');

    return (
        <InputSibling value={sharedText} onChange={(newValue) => setSharedText(newValue)} />
        <DisplaySibling text={sharedText} />
    );
}
```

**跨层级通信：**

```ts
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<{ theme: string; toggleTheme: () => void } | null>(null);

function GrandChild() {
    const context = useContext(ThemeContext);
    if (!context) return null;

    return (
        <button onClick={context.toggleTheme}>
            当前主题：{context.theme}
        </button>
    );
}

export default function GrandParent() {
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div style={{ background: theme === 'light' ? '#fff' : '#333', color: theme === 'light' ? '#000' : '#fff', padding: '20px '}}>
                <GrandChild />
            </div>
        </ThemeContext.Provider>
    );
}
```

**Zustand全局状态管理：**

```ts
import { create } from 'zustand';

interface UserStore {
    user: string;
    setUser: (newUser: string) => void;
}

const createUserStore = create<UserStore>((set) => ({
    user: 'Abel',
    setUser: (newUser) => set({ user: newUser }),
}));

export function AnyComponent() {
    const { user, setUser } = useUserStore();

    return (
        <p>用户：{user}</p>
        <button onClick={() => setUser('Tomato')}>切换</button>
    );
}
```

---

### React的Hooks

在这里面试官问我为什么需要Hooks，然后我扯了一堆回调的东西，显然是错了，回调是实现方法，而Hooks是贴合React的，让组件拥有生命周期的一种性质或者说工具

在Hooks出现之前，如果想要让组件持有状态，就要使用类组件，搞出各种复杂的生命周期函数，而Hooks就让你能够在纯函数组件里，拥有状态管理和副作用处理的能力

什么叫纯函数组件，就是针对一定的输入，输出的UI永远相同的组件，且在这个过程中没有任何副作用，即不修改外部变量，不产生网络请求，不直接操作DOM，不修改传入参数

但是现实开发中不可能全都是死板的静态组件，我们需要请求，需要订阅数据，这些都是副作用

而React选择了将渲染与副作用分离，渲染逻辑保持纯净，而副作用则交由Hooks或者用户事件触发Callback

例如：

```js
function UserProfile({ userId }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchUserData(userId).then(res => setData(res));
    }, [userId]);

    if (!data) return <div>Loading...</div>;
    return <div>{data.name}</div>;
}
```

这里的`useEffect`就是Hooks，当`userId`改变后，就触发了其中的回调函数，发起`fetch`请求去获取用户数据

在用户数据获取成功之前，组件仍然保持旧的用户数据，或者此时组件初次挂载，数据`data`为空，显示Loading...

最后使用Hooks时需要注意两点：

- 只在最顶层调用Hooks，不要在循环、条件语句或者嵌入函数中调用Hooks，React依赖Hooks的调用顺序来追踪状态
- 只在React函数组件或者自定义Hooks中调用Hooks

如何区分回调与Hooks？回调是JavaScript自身的语法特性，而Hooks才是与React组件生命周期以及Fiber树、Virtual DOM息息相关的能力

像是`useEffect(() => { .. }, [])`中，里面的那个`() => { ... }`确实是一个回调函数，但它对于`useEffect`来说只是一个入参，`useEffect`本身才是Hook

列一个对比表

|   维度   |             普通回调函数             |               React Hooks                |
| :------: | :----------------------------------: | :--------------------------------------: |
|   本质   |       传递一个代码块/函数引用        |           调用的框架级特征接口           |
|  控制权  |    你或者第三方决定什么时候调用它    |       React渲染引擎统一调度与挂载        |
| 状态感知 | 依赖闭包或者外部作用域，无法存留状态 |  跨渲染周期存留状态(通过Fiber节点挂载)   |
| 执行时机 |      事件触发或者异步完成时执行      | 组件渲染流程的特定阶段(如Render, Commit) |
| 规则限制 |                无限制                |       顶层调用、不可在条件、循环中       |

---

### POST请求与GET请求的区别

|       维度        |                 GET                 |              POST              |
| :---------------: | :---------------------------------: | :----------------------------: |
|     **语义**      |              获取数据               |            提交数据            |
| **参数传递方式**  |            拼接在URL后面            |        放在HTTP请求体中        |
|   **数据安全**    |                极低                 |            相对较高            |
| **数据长度限制**  | 有限制，受浏览器和服务器URL长度限制 |  无严格限制，取决于服务器配置  |
| **幂等性与缓存**  |            幂等且可缓存             |        非幂等且不可缓存        |
| **刷新/回退行为** |        浏览器直接回退，无害         | 浏览器弹窗询问是否重新提交表单 |

底层本质都是TCP，POST也非绝对安全，如果没有用HTTPS协议，一样可以被抓包

---

### HTTPS的加密方式

先讲讲对称与非对称加密

如果用一句话总结，那么就是

- **对称加密**：用**同一把钥匙**锁门和开门
- **非对称加密**：用**公钥**锁门，用**私钥**开门

依旧对比一下

|      维度      |                 对称加密                 |              非对称加密              |
| :------------: | :--------------------------------------: | :----------------------------------: |
|  **核心机制**  |                  单密钥                  |                密钥对                |
| **加解密速度** |                   极快                   |                 极慢                 |
|  **密钥传输**  |         在传密钥过程中容易被劫持         | 没问题，公钥随便发，私钥握在手中即可 |
|  **常见算法**  |              AES, ChaCha20               |               RSA, ECC               |
|  **适用场景**  | 大文件传输、数据库敏感字段加密、磁盘加密 |     身份认证、数字签名、秘钥协商     |

回到HTTPS加密方式，它不是一种单一的加密算法，而是一套混合加密系统，简单来说就是**用非对称加密搞定密钥交换，再用对称加密传输真正的数据**

总体来说分为三部分：

- 非对称加密(RSA / ECC)负责身份认证和秘钥协商，相当于公开的信箱，谁都可以拿公钥投信也就是加密，但只有持有限制私钥的服务器能开锁也就是解密。客户端与服务器在**握手阶段**，用它来安全地协商出接下来的**会话秘钥**
- 对称加密(AES / ChaCha20)负责后续的全部数据传输，相当于一把普通的锁，协商好会话秘钥之后，后续所有的HTTP请求和响应都用它加密，计算速度极快
- 数字证书与哈希摘要(CA证书 + SHA-256)防止中间人攻击，主要充作防伪身份证以及防篡改封条。为了避免中间人伪造公钥，服务器必须出示CA机构颁发的数字证书，客户端用系统预装的CA根证书验证签名，确保获取真服务器公钥

建立连接的过程大致如下：

- **客户端打招呼**：浏览器发给服务器：支持的TLS版本、密码套件列表以及一个客户端随机生成的随机数 $R_{1}$
- **服务器回应并出示身份证**：服务器选定加密套件，回传一个服务器随机数 $R_{2}$，并把包含服务器公钥的**数字证书**回传给客户端
- **客户端查验身份并发暗号**：浏览器校验证书有效性，验证通过后，生成第三个随机数(预主密钥Pre-Master Secret)，用服务器公钥加密后发过去
- **两边各自合成会话密钥**：服务器用自己的私钥解密拿到第三个随机数，此时双方手头上都有了 $R_{1}$, $R_{2}$, 预主密钥，用相同算法计算出最终的对称密钥
- **开启对称加密通信**：双方发一条后续通信全加密的通知，TLS握手结束，接下来的HTTP请求全都用这个对称密钥加密传输

---

## 项目

### HardSeat Hero

首先是问了项目里使用了什么设计模式，我答了选择Provider的策略模式以及构造Provider的工厂模式

但其实这里实际上更接近的应该是适配器模式，Provider在其中充当一个主搜索逻辑以及数据源之间的中间适配层

随后是算法部分，跟他讲了一下Pareto剪枝以及瓶颈不在算法而是网络I/O

但是又嘴瓢了，把请求数讲成 $3300^2$ 约九百多万次请求了，其实单次最多也就 $2 * 3300$ 次差不多，这波确实是脑子糊了

同时虽然说瓶颈不在算法部分，但是算法达成的优化幅度也应该讲一下，不过这里也确实没有测试过，0.5的RPS感觉算法有没有优化真的没区别了

缓存部分答了一下三级缓存以及TTL和SQLite的特性等

然后比较烂的部分就是他问了一下缓存命中率，这个没有测...于是只能随口报了百分之二三十，因为记得命中也确实不是很高

---

### BeamDrop

面试官问了项目中遇到什么难点，是怎么解决的

我回答是在为局域网传输工具设计GUI的时候遇到了链路过长导致状态同步困难以及问题难以定位的问题，但也还是没有清晰的结构化表达

如果准确地定义问题，就是如何让原生C++异步接收服务的生命周期状态，可靠地穿过pybind11、FastAPI、WebSocket，最终在React UI上及时同步

如果逼格高一点，就可以讲成异步状态机、阻塞I/O取消、跨线程状态同步、跨语言状态传播、REST与WebSocket的一致性，但是我讲成了接口调不通

---

## 手撕

### 单向队列实现栈

这里真的是脑子抽了，只记得以前写过的两个单向队列实现栈，现在只给一个，一下子不知道怎么写了，结果他妈整了个临时vector出来

其实很简单...最后看到很无语，就是 $O(n)$ 的插入

```cpp
class Stack {
private:
    queue<int> q;

public:
    void push(int x) {
        q.push(x);
        while (q.size() > 1) {
            int val = q.front();
            q.pop();
            q.push(val);
        }
    }

    int pop() {
        int res = q.front();
        q.pop();
        return res;
    }

    int top() {
        return q.front();
    }
};
```

---

### 删除链表中的倒数第n个节点

这波也是真的忘了力扣的时候怎么刷的了，一门心思想着去弄长度了，然后面试官提示我快慢指针，我tm接着拿快慢指针求长度，分前后两段求，无语了，其实只要让快的指针先走n步就好了

```cpp
struct ListNode {
    int val;
    ListNode* next;
};

ListNode* delete_last_n(ListNode* head, int n) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode *slow = &dummy, *fast = &dummy;

    int cnt = 0;
    while (cnt < n && fast) {
        ++cnt;
        fast = fast->next;
    }

    if (cnt < n) {
        throw std::runtime_error("invalid input");
    }

    while (fast->next) {
        slow = slow->next;
        fast = fast->next;
    }

    slow->next = slow->next->next;

    return dummy.next;
}
```
