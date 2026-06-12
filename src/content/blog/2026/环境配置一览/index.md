---
title: '环境配置一览'
description: '记录了各种环境的配置方法'
pubDate: '2026-06-12'
updatedDate: '2026-06-12'
heroImage: "./hero.jpg"
tags: ["笔记"]
---

被环境配置折磨114514年之后，我决定将配置环境的流程固定记录下来，以供之后参考

## FastAPI

### Windows + Git Bash环境

- 打开文件夹

```bash
mkdir fastapi_project && cd fastapi_project
```

- 配置虚拟环境

```bash
python -m venv venv
```

- 激活虚拟环境

```bash
source ./venv/Scripts/activate
```

- 这里我有VPN，就不换源了，安装FastAPI和uvicorn

```bash
pip install fastapi uvicorn
```

- 固化依赖

```bash
pip freeze > requirements.txt
```

- 可行性验证
  - 建立文件`main.py`
  
  ```bash
  touch main.py
  ```

  - 打开`main.py`，加入如下代码
  
  ```python
  from fastapi import FastAPI

  app = FastAPI()

  @app.get("/")
  def read_root():
      return {"status": "success", "msg": "Hello World!"}
  ```

  - 在Git Bash中使用Uvicorn启动热更新服务器
  
  ```bash
  uvicorn main:app --reload
  ```

  - 打开浏览器，确认两个网址
  
  `http://127.0.0.1:8000/`返回JSON

  `http://127.0.0.1:8000/docs`Swagger UI界面正常交互

- 上述一切正常后，配置完成
