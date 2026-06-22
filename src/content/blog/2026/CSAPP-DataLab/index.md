---
title: 'CSAPP-DataLab'
description: '深入学习计算机系统第一步，关于DataLab的求解心路历程'
pubDate: '2026-06-22'
updatedDate: '2026-06-22'
heroImage: "./hero.jpg"
tags: ["笔记", "计算机系统"]
---

这两天终于拖拖拖开始看CSAPP了，花了一个晚上加半个上午的时间，看完了Lecture2-4，说实话看完感觉也就那样吧，理解了一些概念上的东西，可能并没有吃透

但是当当天晚上开始做DataLab的时候，噩梦开始了...

## 1.bitXor

```C
/* 
 * bitXor - x^y using only ~ and & 
 *   Example: bitXor(4, 5) = 1
 *   Legal ops: ~ &
 *   Max ops: 14
 *   Rating: 1
 */
int bitXor(int x, int y) {
  return 2;
}
```

非常搞笑，这个是我最后才写出来的，而且还完全没想出来怎么写，问AI才知道的

一开始写了个这个

```c
int bitXor(int x, int y) {
  return (~x) & y;
}
```

然后发现，当`x`的位为`1`，`y`的位为`0`时，本来应该返回`1`，但是这里`0 & 0 = 0`了

然后我就一直在想这里怎么处理这种情况，想不出来，干脆先写后面的了

对于异或，它的逻辑表达式是这样

$$
x \oplus y = (x \wedge \neg y) \vee (\neg x \wedge y)
$$

但是这里没有给你或`|`，所以要应用德·摩根定律

$$
\neg(A \vee B) = \neg A \wedge \neg B \implies A \vee B = \neg(\neg A \wedge \neg B)
$$

最终结果就是

```c
int bitXor(int x, int y) {
  return ~(~(x & ~y) & ~(~x & y));
}
```

---

## 2.tmin

```c
/* 
 * tmin - return minimum two's complement integer 
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 4
 *   Rating: 1
 */
int tmin(void) {
  return 2;
}
```

返回补码表示法中的最小数字，没什么好说的，就是`100...00`，直接返回`1 << 31`即可

```c
int tmin(void) {
  return 1 << 31;
}
```

---

## 3.isTmax

```c
/*
 * isTmax - returns 1 if x is the maximum, two's complement number,
 *     and 0 otherwise 
 *   Legal ops: ! ~ & ^ | +
 *   Max ops: 10
 *   Rating: 1
 */
int isTmax(int x) {
  return 2;
}
```

`Tmax`是`0111..11`，一开始想到是有一个取反之后等于加上1，然后发现`-1`也有这个性质，想不到别的做法干脆特判好了

```c
int isTmax(int x) {
  int res1 = (~x) == x + 1;
  int res2 = x + 1 != 0;
  return res1 & res2;
}
```

---

## 4.allOddBits

```c
/* 
 * allOddBits - return 1 if all odd-numbered bits in word set to 1
 *   where bits are numbered from 0 (least significant) to 31 (most significant)
 *   Examples allOddBits(0xFFFFFFFD) = 0, allOddBits(0xAAAAAAAA) = 1
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 2
 */
int allOddBits(int x) {
  return 2;
}
```

从这题开始就有点恶心了

观察一下规律，注意到其实对于每`4`位，满足条件的数字必定为`1x1x`这样的格式，那这样就比较好办了，有 $170 = (10101010)_{2}$，不断向右移位，判断四个移位结果是否均为真即可

```c
int allOddBits(int x) {
  int y = 170;

  int res1 = (x & y) == y;
  x >>= 8;

  int res2 = (x & y) == y;
  x >>= 8;

  int res3 = (x & y) == y;
  x >>= 8;

  int res4 = (x & y) == y;

  return res1 & res2 & res3 & res4;
}
```

---

## 5.negate

```c
/* 
 * negate - return -x 
 *   Example: negate(1) = -1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 5
 *   Rating: 2
 */
int negate(int x) {
  return 2;
}
```

牢记相反数就是取反加一

```c
int negate(int x) {
  return (~x) + 1;
}
```

---

## 6.isAsciiDigit

```c
/* 
 * isAsciiDigit - return 1 if 0x30 <= x <= 0x39 (ASCII codes for characters '0' to '9')
 *   Example: isAsciiDigit(0x35) = 1.
 *            isAsciiDigit(0x3a) = 0.
 *            isAsciiDigit(0x05) = 0.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 15
 *   Rating: 3
 */
int isAsciiDigit(int x) {
  return 2;
}
```

观察规律，注意到`0x30`到`0x39`就是`00...00110000`到`00...00111001`

前面的 $28$ 位是不变的，所以先把整体右移 $4$ 位，判断是否与 $3 = (0011)_{2}$ 相等

然后盯着后面四位看了半天，发现这样一个规律

- 当后四位呈现`1xxx`时，则中间的两位都不能为`1`
- 当后四位呈现`0xxx`时，随便后面怎么填

所以就简单了，只需要分别判断后面四位中的前三位是不是`1`，对结果分别进行逻辑组合即可

```c
int isAsciiDigit(int x) {
  int res1 = (x >> 4) == 3;
  int y = x & 15;
  int res2 = (y & 8) == 0;
  int res3 = (y & 4) == 0;
  int res4 = (y & 2) == 0;
  int res5 = res2 | (res3 & res4);

  return res1 & res5;
}
```

---

## 7.conditional

这题开始卡了我非常久

```c
/* 
 * conditional - same as x ? y : z 
 *   Example: conditional(2,4,5) = 4
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 16
 *   Rating: 3
 */
int conditional(int x, int y, int z) {
  return 2;
}
```

一看到，wtf！？用位运算实现三目运算符？

思考了半天，首先肯定是将`x`是否非零化为`1`或`0`的条件

然后要做到当这个条件为`1`的时候，返回`y`，当这个条件为`0`的时候，返回`z`

首先想一下，对一个数进行位运算，怎样能够得到它本身？

不考虑过于复杂的情况，有三种方法

- 将它和`111...11`取`&`
- 将它和`0`取`|`
- 将它和`0`取`^`

然后再考虑，对一个数进行位运算，怎样能得到`0`？

同样从这三种运算出发

- 将它和`000...00`取`&`
- `|`做不到
- 和它本身取`^`

现在就可以观察出来了，只有`&`运算是均可行，且不依赖它本身的

考虑怎么通过`1`和`0`取到`111...11`和`000...00`

然后想到了一个绝妙的方法（？：

首先构造出`111...11`，然后它加上`0`，还是它本身，加上`1`，就会变成`000...00`！

所以现在只需要构造出`111...11`就行啦

但是一开始我是这么构造的：

```c
int conditional(int x, int y, int z) {
    int p = x != 0;
    int q = x == 0;
    int a1 = (1 << 1) + 1;
    int a2 = (a1 << 2) + a1;
    int a3 = (a2 << 4) + a2;
    int a4 = (a3 << 8) + a3;
    int t = (a4 << 16) + a4;
    return (y & (t + q)) + (z & (t + p));
}
```

当时我还沾沾自喜，算上一开始那个`!=`里的`!`（不知道算不算），刚好16个操作符，极限！

但后来突然想到，根本不用这么麻烦...

```c
int conditional(int x, int y, int z) {
  int p = x != 0;
  int q = x == 0;
  int t = (~1) + 1;
  return (y & (t + q)) + (z & (t + p));
}
```

---

## 8.isLessOrEqual

```c
/* 
 * isLessOrEqual - if x <= y  then return 1, else return 0 
 *   Example: isLessOrEqual(4,5) = 1.
 *   Legal ops: ! ~ & ^ | + << >>
 *   Max ops: 24
 *   Rating: 3
 */
int isLessOrEqual(int x, int y) {
  return 2;
}
```

也算搞了挺久的吧，一开始甚至想到，根据符号位不同搞出好几个`condition`，然后用二分法判断最高有效位之类的，但是二分最高有效位我也写得一塌糊涂，所以就出来了这些东西

```c
int condition1 = highest_bit_x & (!highest_bit_y); // check if 1 and 0
int condition2 = highest_bit_x & highest_bit_y;   // check if both 1 that negative
int condition3 = highest_bit_x ^ highest_bit_y;   // check if different
int condition4 = !condition3;   // check if both 0 through previous conditions

int z = x ^ y;
int sum = 0;

int z_temp_1 = z >> 16;
int res1 = conditional(z_temp_1, 24, 8);
sum += conditional(res1 == 24, 24, 0);

int z_temp_2 = z >> res1;
int res2 = conditional(z_temp_2, conditional(res1 == 24, 28, 12), conditional(res1 == 24, 20, 4));
sum += conditional(res2 == conditional(res1 == 24, 28, 12), conditional(res1 == 24, 28, 12));
```

是的我甚至试图去调用前面的`conditional`函数你敢信

然后重新冷静思考了一下，确实判断符号位是必要的，如果`x`的最高位是`1`，`y`的最高位是`0`，就显然有`x <= y`

所以先写个判断

```c
int highest_bit_x = (x >> 31) & 1;
int highest_bit_y = (y >> 31) & 1;
int condition1 = highest_bit_x & (!highest_bit_y);
```

然后对于剩下的情况，当`x`为`0`，`y`为`1`的时候，显然就不成立，我们不管它，肯定为假，然后只需要判断两者符号相同的时候

看一下，当`x <= y`的时候，如果不考虑溢出，那么就有`x - y <= 0`

然后此时由于我们已经知道是同号，这样减的话是不可能溢出的，所以只需要判断`x - y`的符号位就可以了

对于`-`号，题目不允许，我们用前面的结论，相反数就是取反加一

然后就华丽丽地错了

判断一下为什么？现在看`x - y`的符号，我们可以发现，当`x = y`时，它的符号位为`0`，所以直接用符号位为`1`判断就会出错

所以我们不妨反过来，有`y - x >= 0`，此时就可以放心判断符号位为`0`了

```c
int isLessOrEqual(int x, int y) {
  int highest_bit_x = (x >> 31) & 1;
  int highest_bit_y = (y >> 31) & 1;
  int condition1 = highest_bit_x & (!highest_bit_y);
  int condition2 = !(highest_bit_x ^ highest_bit_y);

  int z = y + (~x) + 1;
  int highest_bit_z = (z >> 31) & 1;
  return condition1 | (condition2 & (!highest_bit_z));
}
```

---

## 9.logicalNeg

```c
/* 
 * logicalNeg - implement the ! operator, using all of 
 *              the legal operators except !
 *   Examples: logicalNeg(3) = 0, logicalNeg(0) = 1
 *   Legal ops: ~ & ^ | + << >>
 *   Max ops: 12
 *   Rating: 4 
 */
int logicalNeg(int x) {
  return 2;
}
```

这题盯了半天，然后发现DataLab有一个bug，它没禁用像`==`这样的判断

然后其实只需要用`x == 0`这样的判断，再赋给一个`int`，把`bool`隐式转换到`int`类型，就可以过

但是既然是来练位运算的，想一下不偷懒的方法

我们可以发现，在整数的二进制补码中，`0`是唯一一个取反前后符号位都为`0`的数

然后根据这个性质来做就行了

```c
int logicalNeg(int x) {
int neg_x = (~x) + 1;
int neg_or = x | neg_x;
return (neg_or >> 31) + 1;
}
```

---

## 10.howManyBits

```c
/* howManyBits - return the minimum number of bits required to represent x in
 *             two's complement
 *  Examples: howManyBits(12) = 5
 *            howManyBits(298) = 10
 *            howManyBits(-5) = 4
 *            howManyBits(0)  = 1
 *            howManyBits(-1) = 1
 *            howManyBits(0x80000000) = 32
 *  Legal ops: ! ~ & ^ | + << >>
 *  Max ops: 90
 *  Rating: 4
 */
int howManyBits(int x) {
  return 2;
}
```

整数部分最后一个BOSS，这题就真的要用到二分法判断最高有效位了

给一个整数，要求在补码形式下表示这个整数所需的最少二进制位数

我们很容易看出，对于一个符号位为`0`的数，其所需位数就是最高有效位的位置数加上一个符号位

那么对于一个符号位为`1`的数呢？尝试将其取反之后，我们可以发现，两者其实是一样的，都需要找到最高有效位

那么我们可以根据这种方式来将小于0的数取反，其他不取反

```c
int sign = x >> 31;
x = x ^ sign;
```

然后接下来就只需要找到最高有效位

我们来想象，先看最高16位，如果最高有效位在这个区间的话，就代表不是全`0`，这时候就只需要右移16位，然后再看高8位；如果不在这个区间，就不用右移，同样看低16位的高8位

判断一个数是不是全`0`，只需要用`!!x`即可

对于每次的移动位数，要么是`16, 8, 4, 2, 1`，要么是`0`，我们可以直接通过下面这个巧妙的方法确定

```c
int howManyBits(int x) {
  int sign = x >> 31;
  x = x ^ sign;

  int b16 = (!!(x >> 16)) << 4;
  x = x >> b16;

  int b8 = (!!(x >> 8)) << 3;
  x = x >> b8;

  int b4 = (!!(x >> 4)) << 2;
  x = x >> b4;

  int b2 = (!!(x >> 2)) << 1;
  x = x >> b2;

  int b1 = (!!(x >> 1));
  x = x >> b1;

  int b0 = x;

  return b16 + b8 + b4 + b2 + b1 + b0 + 1;    // 加一个符号位
}
```

非常之牛逼

---

## 11.floatScale2

```c
/* 
 * floatScale2 - Return bit-level equivalent of expression 2*f for
 *   floating point argument f.
 *   Both the argument and result are passed as unsigned int's, but
 *   they are to be interpreted as the bit-level representation of
 *   single-precision floating point values.
 *   When argument is NaN, return argument
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
unsigned floatScale2(unsigned uf) {
  return 2;
}
```

给了一个用IEEE浮点32位表示法表示的浮点数`f`，要求同样返回这种表示法下的`2 * f`

### 11.1.IEEE浮点表示法

我们回顾IEEE浮点表示法，在这种表示法中，任意实数可以被表示为

$$
(-1)^{S} \times M \times 2^{E}
$$

映射到二进制位中就是(以32位为例)

- 最高位为符号位 $S$，为`0`或`1`
- 从左往右数第 $2 \sim 9$ 位是阶码，$exp$
- 剩下的 $23$ 位为尾数 $M$

然后分三种情况计算出浮点数：

- 当阶码不全为`0`也不全为`1`的时候
  - 这时我们用偏置 $Bias$ 来计算 $E$，计算偏置，就是设阶码位数为 $k$，然后对应的 $Bias = 2^{k} - 1$，$E = exp - Bias$
  - 然后对于尾数 $M$，我们要在后面这 $23$ 位的基础上，加上一个 $1$，这样设计的目的是白嫖一位精度
  - 然后 $M = 1 + a_{1} \cdot 2^{-1} + a_{2} \cdot 2^{-2} + \dots + a_{23} \cdot 2^{-23}$，其中 $a_{1}, a_{2}, \dots, a_{23}$ 就是从左到右数下来的`0`或`1`
  - 再通过公式 $(-1)^{S} \times M \times 2^{E}$，就得出了对应的浮点数
- 当阶码全为`0`时
  - 这时候我们就固定 $E = 1 - Bias$，在这里也就是 $1 - 127 = -126$
  - 然后尾数的计算就没有前导`1`了，直接就是 $a_{1} \cdot 2^{-1} + a_{2} \cdot 2^{-2} + \dots + a_{23} \cdot 2^{-23}$
  - 同样通过公式计算
- 当阶码全为`1`时
  - 当尾数部分全为`0`时，这就代表无穷
  - 当尾数部分不全为`0`时，就是`NaN`(Not a number)

---

### 11.2.回到题目

然后一开始我是看完了Lecture就来做的，其实当时也没怎么看懂，所以查着概念写出来一堆不可名状之物

```c
int sign = (uf >> 31) & 1;
int cur_uf = uf ^ sign;
int exp = cur_uf >> 23;
int M = (cur_uf << 9) >> 9;
int recover_sign = (sign << 31);

if (exp == 255) {
  return uf;
}

if (exp == 0) {
  if ((M >> 22) & 1) {
    exp += 1;
  }
  int a = (((255 << 8) + 255) << 7) + 127;
  M = (M << 1) & a;
  return ((exp << 23) + M) ^ recover_sign;
}

exp += 1;
return ((exp << 23) + M) ^ recover_sign;
```

重新思考正常思路

- 当`exp == 255`时，此时不论是它本身就是`NaN`，还是什么，反正乘`2`之后必然会溢出，为`NaN`的情况，直接返回`uf`本身即可
- 当`exp == 0`时，就只需要把`uf`整体左移一位，溢出的部分会自动归为`exp`部分
- 当`exp`为其他值的时候，由于乘上`2`，考虑将`exp`加`1`，此时特判，如果`exp`变为`255`，就直接返回无穷，其他情况就正常将各部分组合起来即可

```c
unsigned floatScale2(unsigned uf) {
  unsigned sign = uf & 0x80000000;
  unsigned exp = (uf >> 23) & 0xFF;

  if (exp == 255) {
      return uf;
  }

  if (exp == 0) {
      return sign | (uf << 1);
  }

  exp++;
  if (exp == 255) {
      return sign | 0x7F800000; 
  }

  return sign | (exp << 23) | (uf & 0x7FFFFF);
}
```

---

## 12.floatFloat2Int

```c
/* 
 * floatFloat2Int - Return bit-level equivalent of expression (int) f
 *   for floating point argument f.
 *   Argument is passed as unsigned int, but
 *   it is to be interpreted as the bit-level representation of a
 *   single-precision floating point value.
 *   Anything out of range (including NaN and infinity) should return
 *   0x80000000u.
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. also if, while
 *   Max ops: 30
 *   Rating: 4
 */
int floatFloat2Int(unsigned uf) {
  return 2;
}
```

将一个浮点数转为`int`型，也就是向`0`取整

我们重新考虑一个浮点数的结构

$$
(-1)^{S} \times M \times 2^{E}
$$

将 $M$ 展开，也就是

$$
(-1)^{S} \times 2^{E} \times (1 + a_{1} \cdot 2^{-1} + a_{2} \cdot 2^{-2} + \dots + a_{23} \cdot 2^{-23})
$$

其中那个 $1$ 我们先给它加上

然后容易看出

- 当 $E \ge 31$ 时，就直接是无穷或者`NaN`了，依据题意返回`0x80000000u`即可
- 当 $E < 0$ 时，可以看到，就算乘上这些项中最大的 $1$ 也会被舍去，所以此时直接返回`0`
- 当 $E \ge 23$ 时，尾数 $M$ 的部分乘上 $2^{E}$，全部都会变成整数，没有数会被舍去
- 当 $0 \le E < 23$ 时，尾数 $M$ 最右边的 $23 - E$ 为数会被舍去，因为乘上 $2^{E}$ 还是小于 $1$

所以就有代码

```c
int floatFloat2Int(unsigned uf) {
  int sign = uf >> 31;
  int exp = (uf >> 23) & 0xFF;
  int E = exp - 127;

  if (E < 0) {
    return 0;
  }

  if (E >= 31) {
    return 0x80000000u;
  }

  int num = (uf & 0x007FFFFF) | 0x00800000;

  if (E >= 23) {
    num <<= (E - 23);
  } else {
    num >>= (23 - E);
  }

  if (sign) {
    return -num;
  }
  return num;
}
```

---

## 13.floatPower2

```c
/* 
 * floatPower2 - Return bit-level equivalent of the expression 2.0^x
 *   (2.0 raised to the power x) for any 32-bit integer x.
 *
 *   The unsigned value that is returned should have the identical bit
 *   representation as the single-precision floating-point number 2.0^x.
 *   If the result is too small to be represented as a denorm, return
 *   0. If too large, return +INF.
 * 
 *   Legal ops: Any integer/unsigned operations incl. ||, &&. Also if, while 
 *   Max ops: 30 
 *   Rating: 4
 */
unsigned floatPower2(int x) {
    return 2;
}
```

要求返回 $2.0^{x}$ 的IEEE浮点表示

然后我们根据定义，可以知道在32位下，IEEE浮点表示法所能表示的范围为

- 最低也就是`exp`全为`0`，$E = 1 - 127 = -126$，然后尾数最小 $2^{-23}$，不考虑 $0$ 的情况，最高精度就是 $2^{-149}$
- 最高就是`exp`为`254`，$E = 254 - 127 = 127$，最大尾数 $2 - 2^{-23}$，乘上就是 $(2 - 2^{-23}) \cdot 2^{127} \approx 2^{128}$

然后根据这个范围判断即可

```c
unsigned floatPower2(int x) {
    if (x >= 128) {
      return 0x7f800000;
    }
    if (x < -149) {
      return 0;
    }

    if (x >= -126) {
      int exp = x + 127;
      return exp << 23;
    }

    return 1 << (x + 149);
}
```

然后这里还发生了一点意外情况，写了代码交上去`btest`，这里总是超时，到网上复制了别人的正确代码交上去也是超时`Error`

于是请出万能的Cline，发现是`decl.c`中这个函数的测试参数范围配错了

```c
{"floatPower2", (funct_t) floatPower2, (funct_t) test_floatPower2, 1,
   "$", 30, 4,
    {{1, 1},{1,1},{1,1}}},
```

这里的 `{{1, 1}}` 对 `btest.c` 有特殊含义，它不是普通整数范围，而是触发“浮点 bit-level 输入”的特殊测试生成逻辑

然后为 `floatPower2` 生成大约6000004个测试输入，再加上这个函数和其他两个函数不同，它是`int`输入，调用约1.86亿轮循环，所以超时得华丽丽

也不知道是不是我这里效率的问题，反正给他改了然后就过来嘿嘿
