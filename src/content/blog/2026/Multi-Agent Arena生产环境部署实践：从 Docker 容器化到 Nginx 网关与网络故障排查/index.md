---
title: 'Multi-Agent Arena生产环境部署实践：从 Docker 容器化到 Nginx 网关与网络故障排查'
description: '以Multi-Agent Arena项目生产部署为实战场景，浅谈Docker与Nginx，并阐述部署流程中的故障排查流程思路'
pubDate: '2026-09-11T09:13:00+08:00'
updatedDate: '2026-09-11'
heroImage: "./hero.jpg"
tags: ["笔记", "Docker", "Nginx", "Linux"]
---

## 1.绪言

回顾了一下，发现现在没有一个项目是已经部署上线的，全都是类似于本地拉起服务的demo这样，所以决心部署一个项目上线，于是选取了Multi-Agent Arena

---

## 2.部署思路

到目前为止，项目已经撘出了一个MVP架构，并且已经在本地跑成功了

大概描述一下，假设现在前端需要获取一道题目的数据，那么链路就是这样的：浏览器向后端发起API请求，后端处理并从数据库读，读出之后再响应返回到前端，就是这样一个链路

于是可以注意到，这里出现了三个角色：前端，后端，数据库

现在我们要把这个项目部署上线，就是期望用户能够通过公网域名访问到我们的前端界面，并且能够顺利地请求后端，获取题目数据

当然我们不妨思考，我们应当让公网直接访问后端吗？或者说，直接让公网访问后端会带来什么问题？

首先后端接口完全暴露，一旦有人恶意大量请求接口，那么后端服务显然容易快速崩溃，频繁地读写数据库也是一样，所以我们需要在中间添加一个缓冲层

因此我们引入了Nginx作为网关层，自此整体架构大致如下：

```mermaid
flowchart LR
    A[公网] --> B[Nginx]
    B --> C[后端]
    C --> D[数据库]
```

可以看到这个架构还是比较简单的，毕竟暂时也只是一个个人项目，用户也不会太多

具体来说，这里实现了职责的分离，Nginx作为网关层，可以专注于处理静态文件预加载以及直面公网，承担流量压力，做分流和在网关层就拒绝一些明显不合理的请求，从而减少后端的压力

这样，后端就可以专注业务逻辑，数据库也只用负责存储

---

## 3.Nginx

在这里进一步讲讲Nginx在整个架构中起到了什么作用

Nginx是什么？简单来说，它是一个经典的网关基础设施，与寻常的正向代理设施帮客户端去拿他们本来拿不到的数据不同，反向代理是给服务端进行代理，任何想要访问后端服务器的流量都必须先经过Nginx

那么经过Nginx层有什么作用？我们这里不谈Nginx在高并发场景下是如何解决传统服务器的C10K痛点的，因为属实远远超过当前的范围了，我们就只考虑它是怎么帮助后端服务器挡住恶意请求、降低流量压力的

其实也很简单，在Nginx层设计防限流防刷配置，如果有大量的恶意请求进来可以直接在Nginx层就被拦下来，但是显然这也不是无敌的，因为说到底你的Nginx也是部署在服务器上，如果攻击流量已经把ECS带宽或者CPU资源打满，还是会崩溃

同时Nginx可以在网关层就完成TLS终止，与公网间实现HTTPS交流，服务器内部再通过Docker网络通信

---

## 4.容器化与Docker

### 4.1.为什么我们需要容器化

在容器出现之前，应用开发部署上线过程中最常出现的一个问题就是：

> 我本地明明能跑啊？！

这就是一个代码与配置在不同环境下的适配问题，为了解决这个问题，人们引入了容器

---

### 4.2.容器镜像

在讲容器之前，我们需要先理解什么叫镜像，容器是基于镜像运行的

其实所谓镜像，其实就是一个压缩包或者说快照文件，它把运行某个系统或者应用所需的一切，包括代码、环境配置像Python和Node.js依赖，甚至于操作系统都打包到一起

这里的容器镜像也是一样，就是将对应应用的依赖全部打包成统一文件

---

### 4.3.容器

当需要拉起对应的应用服务的时候，容器就根据镜像启动，如果说镜像是静态的类，容器就是根据类创建的动态实例

它是独立而不受外界干扰的，应用服务就在容器中运行，但是又和虚拟机有所不同，比如启动速度是容器更快；虚拟机是硬件级隔离，有独立OS，而容器是进程级隔离，共享宿主机OS；以及虚拟机占用内存更多，以GB级计算，而容器占用内存少，以MB计算

对于容器的原理，我们这里以Linux内核为基础的容器为例进行介绍，当然Windows等任何可以提供资源限制和视图限制的操作系统，都可以搭载容器，但是Linux在这里的生态要远远更为成熟

探究容器的底层，其实核心就是三个：**Namespace**、**Cgroups**、**联合文件系统**

---

#### 4.3.1.Namespace

首先所谓**Namespace**，代表的就是**隔离**，我们前面提到容器相当于一个独立的进程环境，因此要实现容器的搭载，首先操作系统就需要提供将容器进程和其他进程隔离开的能力

而Linux Namespace就是Linux内核用来做视图隔离的技术，它营造一种错觉：让容器内的进程误以为自己独占了整个操作系统

Linux内核一共提供了6种核心Namespace，通过`clone()`或`unshare()`系统调用触发

- **PID Namespace**：进程隔离，容器内主进程的PID为`1`，但是在宿主机的视角来看，它只是一个普通的PID，比如PID `1234`
- **NET Namespace**：网络隔离，每个容器拥有自己独立的网络设备、IP、路由表
- **MOUNT Namespace**：文件挂载点隔离，容器看得到的容器挂载点，宿主机或者其他容器都看不到
- **UTS Namespace**：主要是做Host Name和NIS Domain Name的隔离，容器有独立的主机名和网络信息服务域名
- **IPC Namespace**：进程间的通信隔离，隔离它们的信号量、消息队列和共享内存
- **USER Namespace**：用户隔离，宿主机的`root`用户到容器中可能只是普通用户，防止越权

---

#### 4.3.2.Cgroups

其次就是`Cgroups(Control Groups)`，也即资源限制，即使有个Namespace隔离资源，如果每个容器无限地吃内存、抢占CPU，宿主机一样会崩溃，而Cgroups就是内核用来限制隔离进程组资源的机制

在此之前，我们需要先介绍一下**伪文件系统**

区别于真实的文件系统挂载到像SSD这样的物理存储设备，伪文件系统的数据是存储在RAM，或者直接由操作系统内核生成的

那么为什么需要这么设计？这就涉及到Linux的哲学：一切皆文件

为了保证用户态的程序能够用最简单的`cat`、`open`、`read`这些系统级指令去和系统内核交互，内核干脆就把自己包装成了一个文件系统，它实际上是一个动态的数据接口，在OS中看起来就像一个普通的文件目录，但是实际上磁盘内完全不存在对应的文件

那么这又和我们提到的Cgroups有什么关系？在Linux中，Cgroups的API是通过伪文件系统暴露出来的，例如默认挂载在`/sys/fs/cgroup/`，其中的这个`/sys`就是Linux中一个核心的伪文件系统，用于结构化地展示驱动、总线、硬件设备的关系

例如需要限制CPU，就通过`cpu.cfs_quota_us`和`cpu.cfs_period_us`来限制CPU时间片；要限制Memory，就通过`memory.limit_in_bytes`设定最大内存；还有限制磁盘读写吞吐量这样

当然上面提到的这些实际上是Cgroups v1的接口，当今大部分Linux发行版已经在采用Cgroups v2了

---

#### 4.3.3.联合文件系统(UnionFS)

我们提到了容器需要独立的、完整的文件系统，如果每个容器都需要拷贝一份完整的OS文件，对硬盘的压力极大，而且每次拷贝所需的时间也拖慢了容器的启动

所以我们要考虑如何去复用镜像，因此引入了联合文件系统

联合文件系统是一种分层、轻量级并且高性能的Linux文件系统技术，核心能力就是叠层，能够把多个不同的物理目录甚至不同的文件系统联合挂载到同一个虚拟目录下，向用户呈现出一个统一的文件系统视图

这里就是通过分层的思想解决了上面的问题，我们并不动镜像层，而是在文件的最上层搭建一层读写层，容器只与这一层进行交互，而不会影响到镜像

---

### 4.4.Docker

讲完了容器，我们现在需要考虑怎么管理容器，也就是如何构建、打包、运行

---

#### 4.4.1.镜像与文件系统

Docker镜像是开发中较为常用的一种镜像，它的精髓在于**分层存储**和**写时复制**，具体来说，呈现如下结构：

- **基础层**：像是精简版的Ubuntu或者AIpine系统文件
- **依赖层**：像是Python和Node.js环境
- **应用层**：业务代码和配置文件
- **容器运行层**：镜像本身只读，当Docker启动镜像生成容器的时候，会在最顶上覆盖一层极薄的可读写层，运行时的所有改动都在这一层进行，完全不破坏下面的结构

但是实际上Docker镜像仍然只是一堆静态的只读文件夹，需要配合联合文件系统才能搭建出容器运行时文件系统

这里以现在主流的OverlayFS为例，看看它是怎么通过四个关键的角色把Docker的镜像与容器串联起来的：

首先是`lowerdir`，对应的就是镜像的所有只读层，是底层目录，可以包含多层向上叠加

然后`upperdir`，这是容器的可读写层，容器运行期间产生的所有修改和新文件都保存在这里

`workdir`，这是Docker内部的工作目录，只读，用于做文件原子操作时的中间过渡

`merged`，这是容器最终看到的完整视图，也就是挂载点，将`lowerdir`和`upperdir`叠加合并后的统一入口

Docker从`merged`视角操作文件，而在读写删除文件的时候，遵循的都是同一个原则：不动`lowerdir`，将操作移动至`upperdir`

例如读文件的时候，先看`upperdir`里面有没有，如果有就直接读，否则就从`lowerdir`里面读

写文件的时候，绝不直接写`lowerdir`，而是采用 **写时复制(CoW)机制** ，先将文件拷贝一份到`upperdir`，再在其中修改

删除文件的时候，也不删除`lowerdir`的文件，而是在`upperdir`中创建一个遮蔽文件，营造出被删除的现象，这样再读的时候，读到这个遮蔽文件，就知道已经被删除，而不会继续再去`lowerdir`中寻找

---

#### 4.4.2.Docker Compose

现在我们有两个服务，后端服务和数据库服务，如果需要启动的话，就要分别启动后端Docker和数据库Docker，假如以后需要加入缓存，又可能需要启动一个Redis Docker

这无疑是不方便管理的，那么有没有什么东西能够让我们一键启动所有的Docker服务，同时能够对这些容器进行统一管理的呢？

这就是Docker Compose，它是Docker提供的自动化多容器编排工具，通过配置文件`compose.yaml`来管理多容器

例如就在这个项目中的配置：

```yaml
services:
    postgres:
        image: postgres:16.4
        ...

    backend:
        build:
            context: ./backend
            ...
```

可以看到将数据库和后端服务分开管理

然后还有Docker Volume进行数据持久化：

```yaml
volumes:
    postgres_data:
```

因为容器本身用完就扔掉了，重启丢失数据，通过Docker Volume起到一个外挂硬盘的作用，把数据存储在宿主机上

---

#### 4.4.3.Dockerfile

Docker Compose是用来组织多容器工作，而Dockerfile用来制作出后端镜像，它包含了项目依赖、Python版本、基础镜像、FastAPI后端代码、Alembic数据库迁移文件以及启动命令：

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN groupadd --system app && useradd --system --gid app --create-home app

COPY requirements.txt ./
RUN pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./alembic.ini
COPY pyproject.toml ./pyproject.toml

RUN chown -R app:app /app
USER app

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 5.开始部署

### 5.1.服务器基础环境和防火墙

这里AI建议我去找个2 core 4GB的VPS，但是看了一眼tm太贵了，于是决定拿暑假开的一个本来打算用来玩MC的2 core 2GB的ECS服务器来搭载服务

首先是配置服务器的基础环境和防火墙，通过

```bash
sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

保留了外部针对服务器的SSH、HTTP、HTTPS的入站服务，但是把像是PostgreSQL的`5432`和FastAPI的`8000`端口给关掉了，这也是出于前面的所说的私密性设计

---

### 5.2.Docker官方软件源TLS失败

然后尝试安装软件，从Docker开始，使用官方软件源安装的时候发现失败了：

```txt
OpenSSL SSL_connect: SSL_ERROR_SYSCALL
```

于是自底向上开始排查：

首先排查系统时间发现没问题，为什么这里要排查系统时间？因为TLS握手极度依赖数字证书校验，其中重要的一项就是生效时间和过期时间，如果系统时间抽风穿越到1970年或者进入赛博朋克2077，就会出现校验发现还未生效或者已失效的情况

从而排除了本地校验证书没通过的问题

然后把目光放在下一层，也就是DNS层

什么叫DNS？可以简单理解为将我们人类便于识别的网址，例如`google.com`，定位到具体的对应IP地址的工具，相当于从人类语言到机器易识别的语言的过程

于是检查了DNS，发现也可以正常解析`download.docker.com`，所以并不是DNS找不到IP或者被劫持污染的问题

接着下一层，那现在连接的前置条件排除了都没问题，那有没有可能是连接建立不起来呢？

所以接下来检查TCP连接是否能够建立，发现也是可以的

那么就是TLS握手了，TCP连接虽然建立成功了，但是也不意味着HTTPS服务可用，因为还需要完成TLS握手和证书协商

然后反应过来，服务器在深圳，所以很可能是服务器到Docker官方的握手阶段直接失败了，现在继续重试同一个软件源没有意义了，配置代理比较麻烦，所以考虑换一个软件源

切换到了阿里云的ECS内网镜像，参考了Alibaba Cloud Linux 3的官方安装方式，安装了兼容插件，自此Docker安装成功

---

### 5.3.Docker Hub Registry访问超时

现在Docker软件安装好了，要测试一下到底能不能用，所以尝试下一个测试用的镜像看看能不能拉起容器

于是计划从Docker Hub Registry拉一个`hello-world`镜像下来看看，然后拉取失败了

看了一下发现是Docker软件包虽然可以下载，但是又和镜像是不同的访问路径，于是配置了阿里云专属的镜像加速器：

```json
{
  "registry-mirrors": [
    "https://uk52zpri.mirror.aliyuncs.com"
  ]
}
```

然后`hello-world`对应镜像可以成功拉取然后运行

---

### 5.4.PostgreSQL镜像拉取失败

然后就是尝试拉取PostgreSQL的镜像了，但是发现失败：

```txt
manifest unknown
```

然后Docker回退访问到Docker Hub，从而再次超时

重新定位了一下，发现首先是Docker服务器这边的client尝试用你给的镜像加速器去抓对应的PostgreSQL镜像

发现对应的`/v2/`接口是活跃正常的，就以为服务正常，尝试直接通过这个加速器去抓

但是实际上可能这个加速器根本没有缓存PostgreSQL的镜像，抓取失败

Docker client误以为是你配错了，就降级回退到官方默认途径，通过Docker Hub去抓取，在国内网络环境失败

于是考虑采用Daocloud库，根据他们的文档方式拉取官方镜像，感谢Daocloud~

```bash
sudo docker pull m.daocloud.io/docker.io/library/postgres:16.4
sudo docker pull m.daocloud.io/docker.io/library/python:3.12-slim
```

---

### 5.5.Dockerfile的`sed`精确替换未生效

上面提到我们需要改用稳定的Daocloud方式，所以得同步在Dockerfile配置里改一下，原来的第一行是这样的：

```dockerfile
FROM python:3.12-slim
```

所以本来在服务器做了一个`sed`的精确替换，但是后面发现诶怎么没变过来？就因为这个折腾了好久，最后发现是Dockerfile的第一行根本没有被替换

解析了一下，可能是从我这里Windows工作区上传的文本包含了CRLF换行符，带有行尾字符的时候，`sed`要求整行精确匹配所以没有匹配到

所以做了行号替换，解决了

---

### 5.6.容器健康但是宿主机无法访问8000端口

在初次启动后端之后，出现了一个让人非常疑惑而且矛盾的现象，后端容器显示healthy，但是服务器上的`127.0.0.1:8000`无法访问

也就说明，虽然容器正常，但是宿主机的端口发布失败了

首先通过

```bash
sudo docker compose ps -a
```

得到

```txt
app-backend-1   Up ... (healthy)
app-postgres-1  Up ... (healthy)
```

如果按照直觉，此时后端应该可以访问才对，但是`curl`了一下发现被refuse了

```bash
curl http://127.0.0.1:8000/health
```

返回了：

```txt
curl: (7) Failed to connect to 127.0.0.1 port 8000: Connection refused
```

意即宿主机的`8000`端口没有可用的监听，即使容器的`8000`端口已经在监听了，但此二者不能混为一谈

然后检查日志，发现日志中大量出现

```txt
127.0.0.1:xxxxx - "GET /health HTTP/1.1" 200 OK
```

这也证明了健康的检查请求确实进入了FastAPI，问题确实在外部

然后尝试从容器内部直接访问

```bash
sudo docker compose exec backend \
  python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3).read().decode())"
```

结果是status ok，说明FastAPI进程正常、容器内部的端口正常、健康检查正常

问题被缩小到Docker的端口映射层、Docker的网络层、宿主机的NAT/iptables层

然后检查了Compose中的配置

```yaml
backend:
  ports:
    - "127.0.0.1:8000:8000"
```

这里是从宿主机的`127.0.0.1:8000`到容器的`8000`，是后端backend的访问链路，所以理论上我们的配置文件也没有问题，那到底是哪里？

考虑实际上的解析配置是不是出了问题，也就是需要检查实际上的端口绑定

```bash
sudo docker inspect app-backend-1 \
  --format 'network_mode={{.HostConfig.NetworkMode}} ports={{json .HostConfig.PortBindings}}'
```

结果也显示正常：

```txt
network_mode=app_arena_private
ports={"8000/tcp":[{"HostIp":"127.0.0.1","HostPort":"8000"}]}
```

所以接下来检查Docker实际上有没有正确地把规则转发给宿主机

首先获取容器的IP

```bash
BACKEND_IP=$(sudo docker inspect -f \
  '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' \
  app-backend-1)

echo "$BACKEND_IP"
```

拿到IP`172.18.0.3`，尝试从宿主机直接访问容器IP

```bash
curl -i http://172.18.0.3:8000/health
```

返回

```txt
HTTP/1.1 200 OK
{"status":"ok"}
```

所以证明了这个路径其实是通的，问题范围进一步缩小

尝试执行

```bash
sudo ss -ltnp | grep ':8000'
```

没有输出，说明`8000`端口没有在监听，然后之前还执行过

```bash
sudo docker port app-backend-1
```

也没有输出，组合这些现象，比较异常，`HostConfig.PortBindings`存在，容器IP可以访问，但是`docker port`没有输出，宿主机也没有监听端口`8000`

这说明Docker的端口发布可能没有完整实现，而Docker在Linux上通常通过`iptables`创建，并管理NAT、端口转发、bridge网络隔离、以及其他容器访问外部网络所需的规则

什么叫NAT？就是Network Address Transition，网络地址转换，在这里就是让Docker访问外界网络所做的IP转换

我们不妨先看看Docker容器是如何借助宿主机访问外部网络的，这个整体流程是什么

首先澄清一些概念上的东西：

- **虚拟管道(veth pair)**：可以看做Linux内核实现的一条虚拟的网线，分别连接两端，当一段传入数据包时，另一端就会收到数据包
- **虚拟网桥**：传统的虚拟机之间通信，需要同时接到同一台交换机上，但是像Docker这种容器，如果在同一台宿主机，如何实现Docker容器之间的通信呢？就是使用虚拟网桥，典型的就是`docker0`网桥，通过网桥接收容器的网络请求，看是直接转发到同一台宿主机的另一个Docker容器还是继续向外转发到外网

OK，那我们现在开始，首先Docker容器内得到需要发送到的外网的目标IP，得出请求体

但是前面我们提到，每个容器拥有自己的独立(在它们自己的视角下)的网络设备，也即网络命名空间，那么怎么发出去呢？就是通过自己的虚拟网卡`eth0`，它与宿主机内部所持有的虚拟网桥`docker0`之间建有一条虚拟管道veth pair，于是直接把数据包塞到了虚拟网桥上

虚拟网桥看了一圈，发现这个目标IP地址是外网的，应该通过宿主机的物理网卡向外转发

但是问题又来了，注意到现在数据包的源IP其实还是容器的IP，但是外网根本不认识这是啥，可能路由到别的设备去了，所以在真正发出之前，宿主机的iptables将数据包拦截，并做了SNAT也即源地址转换，换成宿主机自己的IP，再发出去

外部服务返回响应，宿主机的连接跟踪模块追踪到这个连接记录，再原路顺着网桥和虚拟管道把响应内容塞回去

好，我们现在知道了Docker是如何向外部网络发送请求的了，回到问题，我们已经检查了Docker容器内部、虚拟管道连通性均没有问题，接下来来看iptables层

检查

```bash
sudo iptables -t nat -L DOCKER -n -v
```

发现没有端口`8000`相关的DNAT规则，也就是外网到Docker的数据传输很可能被拦截了

然后检查了Docker的相关配置，发现iptables并没有被禁用，也就是不会是Docker daemon把iptables杀了

然后检查防火墙设置

```bash
sudo systemctl is-active firewalld
sudo firewall-cmd --get-active-zones
```

结果发现Docker相关的zone已经被启用，允许了相关转发，同时`ip_forward=1`，说明内核IP转发也已经开启，所以不能说明防火墙给数据拦下来了

最后定位到原始的Compose网络配置层：

```yaml
networks:
  arena_private:
    driver: bridge
    internal: true
```

这里的`internal: true`原本的设计意图是让FastAPI和PostgreSQL只在Docker内部通信，创建一个隔离的Docker网络，但是在当前环境中出了实际问题，将该配置项移除后恢复正常

最后发现是对于该配置项的定义出现了误差，`internal: true`会使创建一个隔离的内部网络，使得该网络上的容器无法直接访问外部网络，这样一来前面的问题都能说得通了

---

### 5.7.前端生产构建误用本地地址

然后就是安装了Nginx，用Nginx托管了`frontend/dist`，代理后端接口，但是在实际拉起服务的时候，发现一个问题，通过浏览器访问页面的时候显示无法连接后端，但是直接访问公网API是正常的

访问公网API正常，那么说明后端服务和Nginx网关层是没有问题的，推测根因出在前端中

随后发现是`.env.local`中将开发中使用的`VITE_API_BASE_URL=http://localhost:8000`给上传到了服务器，前端基于这个URL构建，在访问时尝试访问`http://localhost:8000`，而本地又没有拉起后端服务，于是导致失败

于是在生产构建之前移走`.env.local`，使得`VITE_API_BASE_URL`变量值为空，从而前端代码中的

```ts
fetch(`${apiBaseUrl}${path}`)
```

变为了相对路径，浏览器通过同一域名访问Nginx，再由Nginx代理到FastAPI

---

## 6.小结

最后部署成功，可以通过ECS的公网IP地址访问到页面了，但是我申请的域名还在ICP备案，所以暂时做不了配置DNS和HTTPS切换

这一路配置下来花了我大概有两三天的时间，在这个过程中感觉确实对Linux Kernel有了更加深入的了解，也同样发现容器化技术并不是之前想的那么简单
