---
title: 'Terminal命令备忘录'
description: '记录常用终端、Git、SSH 命令，作为日常开发中的快速查阅清单'
pubDate: '2026-04-16'
updatedDate: '2026-04-16'
tags: ["笔记", "Terminal", "Git"]
heroImage: "./hero.jpg"
---

顾名思义，用来记录一些常用的终端命令，方便直接使用。

## 文件操作

|  命令   |       作用       |                                                                                                            用法                                                                                                             |
| :-----: | :--------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  `cd`   |     跳转目录     |                                                         `cd /path/to/directory`前往指定路径$\\$`cd ..`返回上一级$\\$`cd ~`回到家目录$\\$`cd -`回到上一个停留的目录                                                          |
|  `ls`   | 列出文件和子目录 |                                                             `ls -l`长格式显示$\\$`ls -a`显示所有文件$\\$`ls -lh`人性化显示大小$\\$`ls -t` / `ls -tr`按时间排序                                                              |
|  `pwd`  | 显示当前所在路径 |                                                                                                              -                                                                                                              |
| `mkdir` |     创建目录     |                                                                           `mkdir dirname`创建名为dirname的文件夹$\\$`mkdir -p a/b/c`创建嵌套路径                                                                            |
|  `rm`   |     删除文件     |                                           `rm filename`删除名为filename的文件$\\$`rm -f`强制删除$\\$`rm -r dirname`递归删除$\\$`rm -rf dirname`强制递归删除整个目录及其中所有内容                                           |
|  `cat`  |   展现文件内容   |                                                   `cat filename`打印文件全部内容$\\$`cat fileA file B > fileC`把A和B的内容连在一起存进C里$\\$`cat -n filename`带行号显示                                                    |
| `less`  |    分屏阅读器    |      `less filename`打开文件阅读界面$\\$`j`/`k`向下/向上翻一行$\\$`Space`/`b`向下/向上翻一整页$\\$`G`/`g`跳到文件最后一行/第一行$\\$`/keyword`按`/`之后输入想找的词搜索$\\$`n`/`N`跳转到下一个/上一个匹配项$\\$`q`退出      |
| `tail`  |   显示文件尾部   |                                           `tail filename`默认显示文件最后10行$\\$`tail -n num filename`显示最后num行$\\$`tail -f`进入监听模式，当文件有新内容写入，立即在终端打印                                           |
| `grep`  |     搜索内容     |                                `grep "keyword" filename`在指定文件中查找包含关键词的行$\\$`grep -r "keyword" dir/`递归搜索$\\$`grep -i`忽略大小写$\\$`grep -n`显示行号$\\$`grep -v`反向匹配                                 |
| `chmod` |     权限变更     | `r`读 `w`写 `x`执行$\\$`chmod u+x filename`给所有者增加执行权限$\\$`chmod g-w filename`去掉所属组权限$\\$`chmod o=r filename`把其他人权限设为只读$\\$`r=4, w=2, x=1`$\\$`chmod 755`7=4+2+1=可读可写可执行，5=4+1=可读可执行 |

## Git

|      命令      |                                            作用                                            |                                                                                                                                    用法                                                                                                                                     |
| :------------: | :----------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|   `git init`   |                                         初始化仓库                                         |                                                                                                                                      -                                                                                                                                      |
|   `git add`    |                                 将代码从工作区推送到暂存区                                 |                                                                                  `git add filename`添加对应文件$\\$`git add .`将当前目录下所有改动文件全部加入$\\$`git add -A`追踪所有改动                                                                                  |
|  `git commit`  |                                          创建快照                                          |                                               `git commit -m "describe"`表明修改了什么$\\$`feat`新功能$\\$`fix`修补Bug$\\$`docs`修改文档$\\$`style`格式调整$\\$`refactor`重构$\\$`perf`性能优化$\\$`test`测试$\\$`chore`杂项                                                |
|  `git status`  |                                      查看当前修改状态                                      |                                                                                                                           `git status -s`简化输出                                                                                                                           |
|   `git log`    |                                      倒序列出提交记录                                      |                                                                                 `git log --oneline`简洁格式$\\$`git log -p`显示代码差异$\\$`git log --graph --oneline --all`画出分支合并图                                                                                  |
|  `git branch`  |                                          分支操作                                          |                                                              `git branch`查看当前有哪些分支$\\$`git branch name`创建新的分支，以当前分支为模板$\\$`git branch -d name`删除分支$\\$`git branch -D name`强制删除                                                              |
| `git checkout` |                                          切换分支                                          |                                                                        `git checkout name`切换到目标分支$\\$`git checkout -b name`创建并切换分支$\\$`git checkout <commit-hash>`切换到具体的历史节点                                                                        |
|  `git merge`   |                                            合并                                            |                                                                                                                                      -                                                                                                                                      |
|  `git clone`   |                                     克隆远程仓库到本地                                     |                                                                                                      `git clone url`从指定地址同步$\\$`git clone --depth 1 url`浅克隆                                                                                                       |
|   `git push`   |                         将本地仓库已经commit的记录，同步到远程仓库                         |                                                 `git push origin branchname`将当前分支推送到远程名为`origin`的仓库$\\$`git push -u origin branchname`第一次推送加上，将本地分支和远程分支关联$\\$`git push --force`强制推送                                                 |
|   `git pull`   |                                   拉取远程仓库并尝试合并                                   |                                                                                                    `git pull --rebase`将本地改动临时挪走，先应用远程更新，再贴上本地改动                                                                                                    |
|  `git stash`   | 临时保存当前工作目录的修改（包括暂存区和工作区的改动），让仓库恢复到干净的 HEAD 提交状态。 | `git stash list`查看已有的stash列表 $\\$`git stash pop`恢复并删除该stash $\\$`git stash apply`恢复但保留该 stash $\\$`git stash drop stash@{0}` 删除指定的 stash $\\$  `git stash clear`删除所有的stash $\\$`git stash branch new-branch-name` 基于当前`branch`创建新的分支 |
|  `git reset`   |                                   撤销更改和移动分支指针                                   |                                                  `git reset --soft HEAD~1` 只撤销 commit，保留所有修改$\\$`git reset --mixed HEAD~1`此为默认命令，撤销 commit 和 add $\\$ `git reset --hard HEAD~1` 彻底撤销，丢弃所有修改                                                  |
|  `git remote`  |                                 给远程仓库起别名，记录地址                                 |                                                      `git remote -v`查看远程连接$\\$`git remote add <别名> <URL>`添加远程仓库(通常叫origin)$\\$`git remote rename <旧名> <新名>`$\\$`git remote remove <别名>`删除连接                                                      |

## 网络与安全

|     命令     |    作用    |                                  用法                                   |
| :----------: | :--------: | :---------------------------------------------------------------------: |
| `ssh-keygen` | 生成密钥对 |             `ssh-keygen -t ed25519 -C "email@example.com"`              |
| `ssh-agent`  |  管理私钥  | `eval "$(ssh-agent -s)"`启动代理$\\$`ssh-add ~/.ssh/id_ed25519`添加私钥 |
|   `ssh -T`   |  测试连接  |             `ssh -T git@github.com`验证SSH钥匙是否配置正确              |
|    `cat`     |  查看公钥  |               `cat ~/.ssh/id_ed25519.pub`用来复制给配置页               |
