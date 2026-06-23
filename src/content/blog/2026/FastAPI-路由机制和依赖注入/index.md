---
title: 'FastAPI-路由机制和依赖注入'
description: '从实际需求出发，探索FastAPI中的路由机制(APIRouter)和依赖注入(Depends)，浅谈Python装饰器特性'
pubDate: '2026-06-23'
updatedDate: '2026-06-23'
heroImage: "./hero.jpg"
tags: ["笔记", "FastAPI", "Python"]
---

## 1.绪言

今天写项目，被FastAPI的这个路由机制给干懵逼了，啥叫`router`？给`app`加上一个`include_router`是干啥用的？装饰器又是啥？

严肃意识到自己的基础仍然非常薄弱，于是整理下面的笔记，以供后来参考

---

## 2.Why路由？

在一开始对FastAPI的使用中，我们一般都会写出这样的代码：

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def get_item():
    return { "status": "ok" }
```

是吧，虽然一开始我也不知道这是什么原理，但只需要知道，上面`app`的方法里填路径，下面写一个处理函数，这个函数就会被注册到对应的路径下，访问时就会执行对应逻辑

但是我们知道，所有的架构都是需要复杂的项目逻辑来验证的，当逻辑变得更加复杂之后

```python
def handle_request(request):
    if request.path == "users/" and request.method == "GET":
        return get_all_users()
    elif request.path == "items/" and request.method == "POST":
        return create_item()
    # ...若干
```

我们知道，如果代码里写了非常多个`if-else`，那么基本可以把它归为垃圾一类了

所以总之，如果单纯采用手动判断转发的方式，无疑会极大程度上影响结构和逻辑清晰度

此外，路由机制可以将不同逻辑解耦到不同文件中，而不至于全部塞到`main.py`里堆成一座屎山

---

## 3.理解`app`是什么

### 3.1.概念阐述

在一开始，我提到FastAPI的`app`，只能模糊说出，这大概是一个总体的应用程序？（~~什么鬼话~~

事实上，`app`可以理解为

> 整个后端应用的总路由表 + 请求处理入口

当你的浏览器，或者说测试代码，请求一个

```text
GET /health
```

FastAPI会问：我的`app`里有没有注册过一个路径是`/health`，方法是`GET`的处理函数？如果有，就调用那个函数

`app = FastAPI()`创建了一个ASGI应用对象，然后`uvicorn`监听端口，接受HTTP请求，转发给`app`，然后`app`做路由匹配、参数解析、调用函数、生成响应

---

### 3.2.关于网络端口

写到这里，发现网络端口这块也需要讲一下

当主机连接到互联网中时，会被分配一个IP地址，例如像`192.168.x.x`这样的，代表在这个网络内，这个地址就指向你的主机

而在这个IP地址后面，有时我们会看到类似于`192.168.x.x:8000`这样的东西，这是什么？后面的那个`8000`就叫做**端口**

在你的主机上运行着很多应用程序，然后其中很多应用程序都需要接入网络，然后我们会想到，肯定不能把它们全部接在一起，这样一来不好管理，所以我们引入了端口的概念，每个应用程序，或者说进程，被分配到一个端口，用来和外界网络连接

我们可以想象，就像进程在堆区开辟属于它自己的一块内存资源空间一样，每个程序也相当于独占了一个房间

FastAPI在这个房间跑着服务器，React在那个房间渲染网页，像微信，QQ这些，也都占据着各自的房间

此时为了区分，到底哪个房间是FastAPI在的地方？端口就像**门牌号**，标在上面，外面一看就知道应该把哪些请求，哪些资源送到哪里

总而言之，**IP决定数据发往哪栋楼，而端口决定数据发往哪个房间**

这里不再详述了，感觉以后可以专门写一篇，等我计网什么的通了，从一个主机到服务器再到主机，这个过程每一步都发生了什么 ~~（立个flag~~

---

## 4.路由装饰器

### 4.1.装饰器

#### 4.1.1.装饰器基本介绍

在讲路由装饰器之前，我们先需要阐明一下Python装饰器的定义

对于Python的装饰器，它实现的功能其实很简单，就是给一个已有的函数添加功能

假如说，我现在需要测试某个函数运行花费了多少时间

```python
import time


def waste_time(n: int):
    for i in range(n):
        print(i)


def check_cost_time(func):
    start_time = time.time()
    func()
    end_time = time.time()
    
    cost = end_time - start_time

    print(f"花费{cost}秒")
```

这样写虽然也可以实现测量运行时间的功能，但问题在于，它并不是给**原有**函数添加功能，在意图和语义上和我们所期望的有所偏差

所以我们可以使用装饰器：

```python
import time


def timer(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        func(*args, **kwargs)
        end_time = time.time()

        cost = end_time - start_time

        print(f"花费{cost}秒")
    
    return wrapper


@timer
def waste_time(n: int):
    for i in range(n):
        print(i)

# 然后直接调用
waste_time(114514)
```

这里的`@`其实就只是一个语法糖，它实际上实现了`waste_time = timer(waste_time)`

---

#### 4.1.2.`*args`和`**kwargs`

我们注意到，在前面的`wrapper`包裹函数中，参数列表里提到了`*args`和`**kwargs`

这两个其实是Python提供的变长参数，可以自动匹配任意多个参数

- `*args`：用于接收位置参数(Positional Arguments)，在函数内部打包成一个元组
  
例如：

```python
def get_sum(a, b, c=0, d=0):
    return sum((a, b, c, d))  # 不可能预知有多少个参数

def get_sum(*args):
    return sum(args)

print(get_sum(1, 2, 3, 4, 5))   # 传多少个都可以
```

- `**kwargs`：用于接收关键字参数(Keywords Arguments)，在函数内部打包成一个字典

例如：

```python
def configure_agent(**kwargs):
    print(f"kwargs的类型是{type(kwargs)}，内容是{kwargs}")
    if "llm_model" in kwargs:
        print(f"正在启动模型{kwargs['llm_model']}")

configure_agent(llm_model="gemini", api="xxx", token=1919810)
```

这里其实不一定要叫`args`和`kwargs`，只是一种约定俗成的命名规范，你用`*wsvsbyellowds`什么的也是可以的，但就像`self`你非要写成`mine`一样，~~很容易被打~~

额外讲一点，其实`*`和`**`不止能用来打包，还能用来解包

例如：

```python
def connect_db(host, port, user):
    print(f"成功连接到{host}:{port}，用户：{user}")

db_tuple = ("127.0.0.1", 8000, "Abel")                      # 元组
db_dict = {"host": "127.0.0.1", "port": 8000, "user": "Abel"}     # 字典

# 解包
connect_db(*db_tuple)
connect_db(**db_dict)
```

---

#### 4.1.3.带参数的装饰器

装饰器本身也可以接收参数，比如说，指定日志的级别：

```python
def logger(level):
    def decorator(func):
        def wrapper(*args, **kwargs):
            print(f"{level.upper()}开始执行{func.__name__}")
            return func(*args, **kwargs)

        return wrapper

    return decorator

@logger(level="info")
def api_call(api):
    print("API正在调用...")

api_call("xxx")
```

---

#### 4.1.4.元数据丢失

需要注意的是，当使用装饰器装饰一个函数时，这个函数的元数据会丢失，例如`__name__`, `__doc__`

```python
@timer
def foo():
    pass
```

此时调用`foo.__name__`，拿到的不会是`"foo"`，而是`"wrapper"`

为了解决这个问题，我们可以应用`functools.wraps`将数据拷贝回来

```python
from functools import wraps


def better_timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    
    return wrapper
```

---

#### 4.1.5.类装饰器

除了用函数实现装饰器以外，还可以用类来实现，只需要这个类实现了`__call__`方法

```python
class Counter:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"已经被调用了{self.count}次")
        return self.func(*args, **kwargs)

@Counter
def submit():
    pass
```

装饰器是个非常有意思的东西，但在这里我们就不扩展讲太多了

---

### 4.2.路由装饰器

#### 4.2.1.从示例开始

现在我们回到路由装饰器本身，举个例子

```python
@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

在这里，`@app.get("/health")`做了三件事：

- 记录HTTP方法：`GET`
- 记录URL路径：`/health`
- 记录事件处理函数：`health_check`

因此，FastAPI内部会记录这样一条规则：

```txt
GET /health -> health_check()
```

当请求进来时，触发

```txt
GET /health
```

调用

```python
await health_check()
```

---

#### 4.2.2.HTTP请求与RESTful规范

##### 4.2.2.1.HTTP请求

关于HTTP请求，我们这里暂时只讲HTTP请求方法，像上文`@app.get()`里的`get`就是HTTP请求的一种

| HTTP方法 | FastAPI中对应的装饰器 |         语义         |
| :------: | :-------------------: | :------------------: |
|  `GET`   |     `@app.get()`      |    获取/读取资源     |
|  `POST`  |     `@app.post()`     |    创建/提交资源     |
|  `PUT`   |     `@app.put()`      |  完整更新/替换资源   |
| `DELETE` |    `@app.delete()`    |       删除资源       |
| `PATCH`  |    `@app.patch()`     | 局部更新资源（修补） |

---

##### 4.2.2.2.RESTful规范

它实际上是一种API架构设计规范风格，核心思想就是：**把网络上的所有东西都看作“资源”（Resource），用“统一的接口”去操作它们**

有四大准则：

- 用“名词”表示资源(URL设计)
- 用 HTTP 方法（Method）表示“动作”
- 善用 URL 路径表达层次关系
- 状态码(Status Codes)合理设计

---

#### 4.2.3.路径参数

所以我们现在就可以理解了，路由装饰器中你使用了什么函数，比如`@app.post()`，就对应着HTTP请求方法(`POST`)

且在像`get()`这样的括号里，能填的不止有静态的URL字符串

- 路径变量

将路由动态化，用`{}`占位，同时要在函数参数里声明同名变量，底层Pydantic实现校验

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id, "status": "Abel Coding"}
```

- 响应状态码

反应操作成功后的状态码

```python
@app.post("/user", status_code=201)
def create_user():
    return {"status": "创建成功"}
```

- 标签与文档

FastAPI会自动生成Swagger文档，在路由装饰器里写的参数可以用于标识处理函数的功能等

```python
@app.post(
    "/run-query", 
    tags=["Agent核心接口"], 
    summary="运行Agent的查询",
    description="这是用来触发AI Agent的接口"
)
def run_query():
    return {"result": "success"}
```

---

## 5.解耦——路由分发

我们前面也有提到，如果把所有接口都写在`main.py`，很快会变成这样

```python
@app.get("/health")
async def health_check():
    ...

@app.get("/api/problems")
async def list_problems():
    ...

@app.post("/api/problems")
async def create_problem():
    ...

@app.get("/api/contests")
async def list_contests():
    ...

@app.post("/api/agents")
async def create_agent():
    ...
```

我们很容易想到，应当将不同的业务逻辑拆分到多个不同的文件中，那怎么实现`app`这个应用入口和其他业务逻辑联系在一起呢？FastAPI提供了`APIRouter`

假如说，以我现在在写的`Multi-Agent-Algorithmic-Arena`项目为例，`/problems`和`/contests`显然是两个不同的路由，我们现在来给它做一个拆分

- `routers/problems.py`

```python
from fastapi import APIRouter, Request
from app.database import get_db
from sqlalchemy import select
from app.models.problem import Problem


router = APIRouter(
    prefix="/api/problems",
    tags=["problems"]
)


@router.get("/{problem_id}")
async def get_problem(problem_id: int):
    # 这里先省略session会话的获取细节，后面会讲
    session = ???
    statement = select(Problem).where(Problem.id == problem_id)
    result = await session.execute(statement)

    return result


@router.post("/")
async def post_problem(request: Request):
    problem = handle_request(request)       # 假设有这样一个函数
    session = ???

    session.add(problem)
    await session.commit()
```

- `routers/contests.py`

```python
from fastapi import APIRouter, Request
from app.database import get_db
from sqlalchemy import select
from app.models.contest import Contest


router = APIRouter(
    prefix="/api/contests",
    tags=["contests"]
)


@router.get("/{contest_id}")
async def get_contest(contest_id: int):
    session = ???
    statement = select(Contest).where(Contest.id == contest_id)
    result = await session.execute(statement)

    return result


@router.post("/")
async def post_contest(request: Request):
    contest = handle_request(request)
    session = ???

    session.add(contest)
    await session.commit()
```

- `main.py`

```python
from app.routers.problems import router as problem_router   # 引入路由
from app.routers.contests import router as contest_router
from fastapi import FastAPI


app = FastAPI()

app.include_router(problem_router)      # 将路由挂到app上
app.include_router(contest_router)


@app.get("/health")
async def check_health():
    return {"status": "ok"}
```

通过这样的方式，我们就成功将业务逻辑解耦，分发到不同模块的路由上了

对于`problems`和`contests`各自的`router`，可以理解为，它们各自模块的一个小路由表，或者说小`app`

---

## 6.Depends

### 6.1.从需求出发

回顾我们上面的代码，在`GET`方法中，我们需要从数据库中查找题目，所以想要一个数据库`session`会话

```python
async def get_problem():
    session = ???
```

现在问题在于，这个`session`应当从哪里来？由谁创建？由谁关闭？每个请求是不是需要一个新的`session`？出错怎么管理？

对于这些逻辑，如果我们在每个路由中都这样手动去写：

```python
session = async_session()
try:
    ...
finally:
    await session.close()
```

会重复，也可能容易漏，不方便统一管理

所以FastAPI提供了`Depends`，通过`Depends`，路由函数只需要声明"我需要什么"，然后FastAPI在请求期间准备，传入，结束后统一管理

---

### 6.2.最小心智模型

我们的`get_db()`类似于这样：

```python
async def get_db():
    async with async_session() as session:
        yield session
```

这是一个资源申请，分配，释放的完整过程，我们不希望通过复杂而难以管理的手动逻辑去管理它

所以通过`Depends`，我们的`get_problem`就变成

```python
async def get_problem(session: AsyncSession = Depends(get_db))
```

它不代表`session`的默认值是`Depends(get_db)`，而是FastAPI看到这个参数之后，并不让客户端传`session`，而是自己去调用`get_db()`，把结果传给`session`

请求流程如下：

```txt
client.get("/api/problems")
        ↓
FastAPI 匹配 GET /api/problems
        ↓
发现路由函数需要 session
        ↓
发现 session 来自 Depends(get_db)
        ↓
执行 get_db()
        ↓
yield 出 AsyncSession
        ↓
调用 get_problems(session=这个 AsyncSession)
        ↓
函数执行数据库查询
        ↓
请求结束后，回到 get_db()，自动退出 async with，关闭 session
```

---

### 6.3.使用示例

我们先从一个玩具例子出发：

```python
from fastapi import Depends, FastAPI


app = FastAPI()


def get_current_user():
    return "Abel"


@app.get("/me")
def read_user(user: str = Depends(get_current_user)):
    return {"user": user}
```

在这里，`user`不来自URL，不来自query，而是从依赖函数中来

所以现在我们修改上面的代码

- `routers/problems.py`

```python
from fastapi import APIRouter, Depends, Request
from app.database import get_db
from sqlalchemy import select
from app.models.problem import Problem
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(
    prefix="/api/problems",
    tags=["problems"]
)


@router.get("/{problem_id}")
async def get_problem(problem_id: int, session: AsyncSession = Depends(get_db)):
    statement = select(Problem).where(Problem.id == problem_id)
    result = await session.execute(statement)

    return result


@router.post("/")
async def post_problem(request: Request, session: AsyncSession = Depends(get_db)):
    problem = handle_request(request)       # 假设有这样一个函数

    session.add(problem)
    await session.commit()
```

- `routers/contests.py`

```python
from fastapi import APIRouter, Depends, Request
from app.database import get_db
from sqlalchemy import select
from app.models.contest import Contest
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(
    prefix="/api/contests",
    tags=["contests"]
)


@router.get("/{contest_id}")
async def get_contest(contest_id: int, session: AsyncSession = Depends(get_db)):
    statement = select(Contest).where(Contest.id == contest_id)
    result = await session.execute(statement)

    return result


@router.post("/")
async def post_contest(request: Request, session: AsyncSession = Depends(get_db)):
    contest = handle_request(request)

    session.add(contest)
    await session.commit()
```

`Depends`不止能依赖函数，还能往里面塞依赖类和其他`Depends`的链式调用等等，非常灵活，但这里先不说了，~~因为我也还不会~~
