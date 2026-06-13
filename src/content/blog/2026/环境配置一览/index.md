---
title: '环境配置一览'
description: '记录了各种环境的配置方法'
pubDate: '2026-06-12'
updatedDate: '2026-06-13'
heroImage: "./hero.jpg"
tags: ["笔记"]
---

被环境配置折磨114514年之后，我决定将配置环境的流程固定记录下来，以供之后参考

## 1.FastAPI

### 1.1.Windows + Git Bash环境

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

---

## 2.让项目打开后自动进入虚拟环境

### 2.1.Windows + Git Bash环境

- 打开或创建`.bashrc`

```bash
nano ~/.bashrc
```

![GNU nano界面](GNU_nano.png)

- 将光标移动至末尾空白处，将下面的代码右键粘贴进去

```bash
# 智能自动激活虚拟环境
cd() {
    builtin cd "$@" || return
    # 检查当前目录下是否存在虚拟环境激活脚本
    if [ -f ".venv/Scripts/activate" ]; then
        # 确保没有重复激活同一个环境
        if [ "$VIRTUAL_ENV" != "$(pwd)/.venv" ]; then
            echo -e "\033[1;32m[Auto-Activate]\033[0m 发现虚拟环境，正在自动激活..."
            source .venv/Scripts/activate
        fi
    # 如果离开了带虚拟环境的目录，且当前处于虚拟环境里，就自动退出
    elif [ -n "$VIRTUAL_ENV" ]; then
        # 允许在子目录中继续保持激活状态
        if [[ "$(pwd)" != "${VIRTUAL_ENV%/.venv}"* ]]; then
            echo -e "\033[1;33m[Auto-Deactivate]\033[0m 已离开项目目录，自动退出虚拟环境。"
            deactivate
        fi
    fi
}
```

- 粘贴后，`Ctrl` + `O`保存，`Enter`确认，`Ctrl` + `X`退出

- 让配置生效

```bash
source ~/.bashrc
```

- 如果配置未生效，首先检查虚拟环境文件夹名称是否为`.venv`，如果不是，返回`nano ~/.bashrc`并修改对应名称
- 否则推测为Git Bash默认读取`.bash_profile`文件，尝试在终端中执行以下命令并重试

```bash
echo "source ~/.bashrc" >> ~/.bash_profile
```
