---
title: 'Python项目结构和pytest'
description: '对开发中常见Python项目结构进行了澄清，以及对pytest测试工具作了简单的介绍'
pubDate: '2026-06-18'
updatedDate: '2026-06-18'
heroImage: "./hero.jpg"
tags: ["笔记", "开发", "Python"]
---

## 1.一个Python项目通常的组成

现代 Python 项目通常不是只有 `.py` 文件，而是由以下几层组成：

```text
backend/
├── app/                  # 业务代码，也就是应用本体
│   ├── __init__.py
│   ├── main.py           # FastAPI 入口
│   └── ...
├── tests/                # 测试代码
│   └── test_health.py
├── requirements.txt      # 依赖清单，告诉 pip 要安装哪些第三方包
├── pyproject.toml        # 项目元信息 + 工具配置
├── .env.example          # 环境变量示例，可以提交 Git
└── .env                  # 本机真实环境变量，不应提交 Git
```

从 Python 的视角，可以分成五层：

| 层级       | 作用                         | 本项目示例         |
| ---------- | ---------------------------- | ------------------ |
| 代码层     | 真正的业务代码               | `backend/app/`     |
| 测试层     | 验证代码是否正确             | `backend/tests/`   |
| 依赖层     | 声明项目依赖哪些包           | `requirements.txt` |
| 工具配置层 | 配置测试、格式化、Python版本 | `pyproject.toml`   |
| 运行环境层 | 环境变量、虚拟环境、数据库等 | `.env`、`.venv`    |

- 核心心智模型：
  - `requirements.txt`管"安装什么包"
  - `pyproject.toml`管"项目和工具怎么工作"
  - `pytest`管"怎么验证代码是否正确"

## 2.`pyproject.toml`是什么

`pyproject.toml` 是现代 Python 项目的项目配置中心。

它可以配置如下内容

- 项目名称、版本、Python 版本要求；
- pytest 测试行为；
- ruff 代码检查规则；
- black 格式化规则；
- mypy 类型检查规则；
- poetry、hatch、uv 等构建或包管理工具。

以我当前的一个项目的配置为例：

```toml
[project]
name = "multi-agent-algorithmic-arena-backend"
version = "0.1.0"
description = "FastAPI backend for Multi-Agent Algorithmic Arena"
requires-python = ">=3.11"

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
asyncio_mode = "auto"
asyncio_default_fixture_loop_scope = "function"

[tool.ruff]
line-length = 100
target-version = "py311"
```

### 2.1.`[project]`：项目元信息

```toml
[project]
name = "multi-agent-algorithmic-arena-backend"
version = "0.1.0"
description = "FastAPI backend for Multi-Agent Algorithmic Arena"
requires-python = ">=3.11"
```

这一段用于描述这个Python项目本身

- `name`：项目名
- `version`：项目版本，常见格式为语义化版本`major.minor.patch`
- `description`：描述
- `requires-python`：表示本项目要求的Python版本

### 2.2.`[tool.pytest]`：pytest配置

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
asyncio_mode = "auto"
asyncio_default_fixture_loop_scope = "function"
```

这一段告诉 pytest：运行测试时应该如何找测试、如何处理导入、如何处理异步测试

- `testpaths = ["tests"]`：表示pytest默认只在`tests/`目录下查找测试
- `pythonpath = ["."]`：等价于告诉pytest，运行测试时把 `backend/` 加入Python的模块搜索路径
- `asyncio mode = "auto"`：FastAPI会大量使用异步代码，pytest本身需要配合`pytest-asyncio`才能方便地运行异步测试
- `asyncio_default_fiture_loop_scope = "function"`：表示异步测试的fixture默认使用函数级别作用域

### 2.3.`[tool.ruff]`：代码检查配置

```toml
[tool.ruff]
line-length = 100
target-version = "py311"
```

Ruff 是一个很快的 Python 代码检查和格式化工具，可以检查未使用的import，变量命名问题，代码风格问题等等

## 3.`pyproject.toml` 和 `requirements.txt` 的区别

| 文件               | 主要作用       | 主要给谁用               |
| ------------------ | -------------- | ------------------------ |
| `requirements.txt` | 依赖安装清单   | `pip`                    |
| `pyproject.toml`   | 项目和工具配置 | pytest、ruff、构建工具等 |

对于`requirements.txt`

```txt
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy[asyncio]==2.0.36
aiosqlite==0.20.0
alembic==1.14.0
pydantic-settings==2.7.1
python-dotenv==1.0.1
pytest==8.3.4
pytest-asyncio==0.25.2
httpx==0.28.1
```

它回答的问题是：

- 这个项目运行和测试需要安装哪些第三方库？

执行：

```bash
pip install -r requirements.txt
```

pip 就会根据这个文件安装依赖

而 `pyproject.toml` 回答的是：

- 这个项目叫什么？
- 要求什么 Python 版本？
- pytest 怎么运行？
- ruff 怎么检查？
- 构建工具怎么工作？

## 4.pytest是什么

`pytest` 是 Python 最常用的测试框架之一，它的作用是自动发现测试文件，运行测试函数，报告哪些通过、哪些失败

### 4.1.测试文件

```python
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_returns_api_message() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Multi-Agent Algorithmic Arena API"}


def test_health_check_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

### 4.2.如何查找

pytest 默认会查找：

```text
test_*.py
*_test.py
```

并运行其中以 `test_` 开头的函数

这两个函数会被运行：

```python
def test_root_returns_api_message() -> None:
    ...


def test_health_check_returns_ok() -> None:
    ...
```

### 4.3.pytest 如何判断测试是否通过

pytest 主要看 `assert`，例如：

```python
assert response.status_code == 200
```

如果实际结果是 200，测试通过。

如果实际结果是 404，pytest 会报告失败，并告诉你类似于

```text
assert 404 == 200
```
