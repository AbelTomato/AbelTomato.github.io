---
title: "番茄勇者RPG开坑记"
description: "个人项目RPG开坑"
pubDate: "2026-03-16"
draft: false
heroImage: "./hero.jpg"
tags: ["C++", "OOP", "项目"]
---

## 楔子

2026年3月12日，在面向对象程序设计课上，我敲下了这个游戏的第一行代码，虽然开坑记拖到16号才开始写。

开始这个项目的初衷是什么呢，其实只是刚好想到吧，反正上课也不怎么听，干脆把这些时间拿来做一个小项目，从而对“面向对象”这个词有更深的了解。

做什么项目呢？我想了一会，最终决定写一个老掉牙的文字RPG游戏。 ~~毕竟更复杂的UI设计我也不会写了~~

那么，就从这里开始吧，想得太多，不如亲自去做。

## 最开始的设计

一开始很茫然，我应该从哪一步开始？角色？怪物？地图？装备？想了一会决定先实现最基础的战斗逻辑。

既然是战斗，我们肯定需要有两个对象来互相攻击，而最经典的就是玩家和怪物之间的战斗了。仔细想想，玩家和怪物其实都可以归纳为一个基类：生物。所以我们首先要实现生物这个基类。

一个生物，首先应当有三个最基本的属性：血量，攻击力，以及名字。所以我们这样写：

```cpp
class Creature
{
protected:
    int hp, attack_power;
    std::string name;
}
```

然后还应当有什么呢，我们定义生物应当具有的行为：攻击，受伤，判断是否存活，死亡反应。

在这里我先把文字互动塞到了对应的函数里，比如：

```cpp
void Creature::attack(Creature &target)
{
    std::cout << name << "发起了攻击！\n";

    if (critical_hit())
    {
        std::cout << name << "发现了对方弱点，触发了会心一击！\n";
        target.take_damage(attack_power * 2, this);
    }
    else
        target.take_damage(attack_power, this);
}
```

但直觉中这样的设计并不好，因为等到以后需要修改文字的时候，可能需要在多个地方进行修改，比较好的选择可能是实现一个UI类，但是先这样吧，有时间填坑了再来。

做好了生物基类的设计，我们开始设计玩家即角色类。思考一下，角色有什么东西是特有的吗，自然是经验值和等级了（其实怪物也应当有等级，但要不要设计经验值给它升级我还没想好）。所以在Player类中，在对Creature类进行公有继承的基础上，我定义如下属性：

```cpp
class Player: public Creature
{
protected:
    int exp, level;
}
```

在每次获得经验值时，触发is_exp_full函数，检验当前经验值是否已满，然后按逻辑进行升级。

同理，我们完成怪物类的设计。现在就可以开始着手实现战斗了。

其实战斗逻辑非常简单，因为只是一个回合制，我们只需要一个while循环来控制即可。

```cpp
battle_result start_battle(Creature &object1, Creature &object2)
{
    std::cout << "\n===遭遇战：" << object2.get_name() << "出现了！===\n";

    while (object1.is_alive() && object2.is_alive())
    {
        std::cout << "\n[" << object1.get_name() << "HP:" << object1.get_hp() << "] vs "
                  << "[" << object2.get_name() << "HP:" << object2.get_hp() << "]\n";

        std::cout << "1.攻击 2.逃跑\n请选择：";
        int choice;
        std::cin >> choice;

        if (std::cin.fail())
        {
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            continue;
        }

        if (choice == 1)
            object1.attack(object2);
        else
            std::cout << "你试图逃跑，但腿软了没跑掉！\n";

        if (!object2.is_alive())
        {
            object2.death_reaction(&object1);
            std::cout << object2.get_name() << "倒下了！战斗胜利！\n";

            std::cout << "\n[按回车键结束战斗...]";
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cin.get();

            return battle_result::VICTORY;
        }

        object2.attack(object1);

        if (!object1.is_alive())
        {
            object1.death_reaction(&object2);
            std::cout << "你失败了\n";

            std::cout << "\n[按回车键结束战斗...]";
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cin.get();

            return battle_result::DEFEAT;
        }

        std::cout << "\n--- 按回车键进入下一回合 ---";
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cin.get();

        system("cls");
    }
}
```

诚然这非常简陋，但是作为一个开始，我觉得已经足够好了。这就当做RPG游戏的最初版了。
