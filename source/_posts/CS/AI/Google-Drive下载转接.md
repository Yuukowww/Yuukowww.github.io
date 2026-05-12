---
title: Google Drive 下载转接
date: 2026-02-21
updated: 2026-02-21
description: 用 Google Colab 和 Google Drive 转接 Figshare、Zenodo 等外网学术文件下载
tag: 日常工作
categories: AI
cover: picture/ginka1.jpg
---

# Google Drive 下载转接

有些数据集、模型权重或者压缩包在本地网络下直连下载很慢，尤其是 Figshare、Zenodo 这类学术文件站点：网页能打开，文件却经常下到一半断掉。一个比较省事的思路是把 **Google Colab 当作云端下载机器**，把 **Google Drive 当作落盘位置**：

```text
真实文件下载链接 -> Colab 临时盘 / 云端运行环境 -> Google Drive -> 本地同步 / 网页下载
```

这个方法本质上不是破解限速，而是换一个更稳定的云端网络环境做中转。适合处理公开数据集、开源模型、论文附件、课程资料这类合法资源；不适合绕过版权、付费墙或平台权限。

## 适用场景

> **比较适合**
>
> - Figshare、Zenodo、OSF 等学术数据仓库的大文件
> - GitHub Releases、公开模型权重、课程资料压缩包
> - 下载源站对本地网络不稳定，但 Google 云端访问比较顺畅的情况

> **不太适合**
>
> - 需要浏览器登录态、Cookie 或一次性 Token 的私有文件
> - 需要频繁下载上万个小文件的目录
> - Google Drive 空间不足，或者本地到 Google Drive 本身也很慢的情况

注意最后一步“从 Drive 拉回本地”仍然取决于本地网络；这个方案的优点主要是让源站到云端的下载更稳定，并且把容易断线的源站下载变成更容易恢复的 Drive 下载。

## 准备工作

> **需要的东西**
>
> - 一个 Google 账号
> - 足够的 Google Drive 空间
> - 一个 Google Colab Notebook
> - 本地下载方式：网页端下载、Google Drive for desktop，或者 `rclone`

如果只是偶尔转接文件，网页端就够了；如果经常搬大文件，建议装 Google Drive for desktop，或者配置 `rclone`，这样本地下载和断点续传更稳。

## 挂载 Google Drive

在 Colab 新建一个 Notebook，先运行：

```python
from google.colab import drive
drive.mount("/content/drive")
```

授权后，自己的云盘会出现在：

```text
/content/drive/MyDrive
```

单独建一个中转目录，避免把大量文件直接扔到 Drive 根目录：

```python
import os

save_dir = "/content/drive/MyDrive/download-relay"
os.makedirs(save_dir, exist_ok=True)
save_dir
```

同时建一个 Colab 临时目录。大文件建议先落到这里，确认完整后再复制进 Drive：

```python
tmp_dir = "/content/tmp_download"
os.makedirs(tmp_dir, exist_ok=True)
tmp_dir
```

`/content` 是 Colab 运行时临时盘，速度通常比直接写 Drive 更稳；缺点是运行时断开后可能被清空。

## 拿到真实下载链接

这一步最容易出错。很多时候复制到的是论文页面、项目页面或预览页面，而不是文件本身的下载 URL。用 `wget` 或 `aria2` 下载这种链接，最后得到的往往是一份 HTML，而不是数据文件。

> **Figshare**
>
> - 进入文件详情页，优先对具体文件的下载按钮复制链接。
> - 如果复制的链接很快失效，可以先在浏览器里点一次下载，再从浏览器下载任务里复制正在使用的下载 URL。
> - Figshare 的下载地址可能带有临时参数，过期后需要重新复制。

> **Zenodo**
>
> - 在记录页面的文件列表里，对单个文件的下载按钮复制链接。
> - 正常的文件链接通常会指向 `records/<record_id>/files/<filename>`，并带有 `download=1` 一类参数。
> - 不要只复制记录页面 URL，否则命令行拿到的是网页内容。

拿到链接后可以先探测一下响应头：

```python
url = "https://example.com/file.zip"

!wget --spider -S "$url" 2>&1 | head -n 30
```

如果响应里是 `text/html`、登录页、403、404，或者文件大小明显不对，先回到网页重新复制下载链接。

## 普通直链下载

对于可以直接 `wget` 的链接，最短写法：

```python
url = "https://example.com/file.zip"
out = "/content/drive/MyDrive/download-relay/file.zip"

!wget -c -O "$out" "$url"
```

参数含义：

> - `-c`：断点续传
> - `-O`：指定保存文件名
> - 引号：路径或链接里有特殊字符时更安全

下载完成后检查一下文件大小：

```python
!ls -lh "/content/drive/MyDrive/download-relay"
```

如果想沿用服务器返回的文件名，可以用：

```python
url = "https://example.com/file.zip"
save_dir = "/content/drive/MyDrive/download-relay"

!wget -c --content-disposition -P "$save_dir" "$url"
```

但对 Figshare、Zenodo 这类带临时参数的链接，我更推荐显式写出文件名，避免保存成一串很长的查询参数。

## 大文件用 aria2

如果目标服务器支持多连接，`aria2` 通常比 `wget` 更舒服：

```python
!apt-get -qq update
!apt-get -qq install -y aria2
```

```python
url = "https://example.com/big-file.tar.gz"
save_dir = "/content/drive/MyDrive/download-relay"

!aria2c -c -x 16 -s 16 -d "$save_dir" -o "big-file.tar.gz" "$url"
```

常用参数：

> - `-c`：继续未完成任务
> - `-x 16`：单服务器最大连接数
> - `-s 16`：分片数
> - `-d`：保存目录
> - `-o`：保存文件名

如果目标文件非常大，直接写入 Drive 有时会因为 DriveFS 抖动变慢。可以先下载到 Colab 临时盘，再复制进 Drive：

```python
import os

url = "https://example.com/big-file.tar.gz"
filename = "big-file.tar.gz"
tmp_dir = "/content/tmp_download"
drive_dir = "/content/drive/MyDrive/download-relay"

os.makedirs(tmp_dir, exist_ok=True)
os.makedirs(drive_dir, exist_ok=True)

!aria2c -c -x 16 -s 16 -d "$tmp_dir" -o "$filename" "$url"
!cp "$tmp_dir/$filename" "$drive_dir/"
```

注意 `/content` 是临时盘，运行时断开后可能清空，所以复制到 Drive 之前不要关掉运行时。

复制后可以简单校验一下大小和哈希：

```python
!ls -lh "$tmp_dir/$filename" "$drive_dir/$filename"
!sha256sum "$tmp_dir/$filename" "$drive_dir/$filename"
```

## Google Drive 分享文件

如果目标本身就是 Google Drive 分享链接，用 `gdown` 更顺手：

```python
!pip -q install gdown
```

单文件：

```python
link = "https://drive.google.com/file/d/FILE_ID/view?usp=sharing"

!gdown --fuzzy "$link" -O "/content/drive/MyDrive/download-relay/"
```

文件夹：

```python
folder = "https://drive.google.com/drive/folders/FOLDER_ID"

!gdown --folder --fuzzy "$folder" -O "/content/drive/MyDrive/download-relay"
```

如果遇到权限错误，先确认分享设置是不是“知道链接的任何人可查看”。如果是私有文件，Colab 里的 `gdown` 不会自动拿到你的浏览器登录状态。

## 多链接批量转接

可以把链接写成一个列表，然后逐个下载：

```python
urls = [
    "https://example.com/a.zip",
    "https://example.com/b.zip",
]

save_dir = "/content/drive/MyDrive/download-relay"

for url in urls:
    !aria2c -c -x 8 -s 8 -d "$save_dir" "$url"
```

更推荐把链接保存成 `urls.txt`：

```text
https://example.com/a.zip
https://example.com/b.zip
```

然后：

```python
!aria2c -c -x 8 -s 8 -i "/content/drive/MyDrive/download-relay/urls.txt" -d "/content/drive/MyDrive/download-relay"
```

这样 Notebook 里不会塞一堆长链接，也方便以后复用。对于容易过期的 Figshare 链接，不建议把 `urls.txt` 放太久；最好复制完链接后尽快启动下载。

## 从 Drive 拉回本地

> **网页端**
>
> 直接打开 Google Drive，进入 `download-relay` 文件夹下载。小文件和少量文件最省心。大文件如果仍然很慢，可以换桌面客户端或 `rclone`。

> **桌面客户端**
>
> 安装 Google Drive for desktop 后，Drive 会出现在系统文件管理器里。大文件可以等它自动同步，也可以选择需要离线保存的文件夹。

> **rclone**
>
> 命令行用户可以配置一个 Google Drive remote：

```shell
rclone config
```

假设 remote 名叫 `gdrive`，拉取中转目录：

```shell
rclone copy "gdrive:download-relay" "./download-relay" -P
```

`-P` 会显示进度，也方便观察是否卡住。

如果文件很大，可以保守一点减少并发、增加重试：

```shell
rclone copy "gdrive:download-relay" "./download-relay" -P --transfers 2 --checkers 4 --retries 10 --low-level-retries 20
```

## 常见问题

> **Colab 断开怎么办？**
>
> `wget -c` 和 `aria2c -c` 都可以尽量续传，但前提是临时文件还在。重要文件尽快写入 Drive，不要长时间依赖 `/content`。

> **Drive 挂载很慢？**
>
> 不要把上万个文件放在 `MyDrive` 根目录。建子文件夹，批量小文件最好先压缩，再写入 Drive。大文件优先先写 `/content/tmp_download`，再复制到 Drive。

> **下载下来的不是压缩包，而是 HTML？**
>
> 大概率复制错了链接，拿到的是网页地址、登录页或过期地址。用 `file` 或 `head` 检查一下：
>
> ```python
> !file "/content/drive/MyDrive/download-relay/file.zip"
> !head -n 5 "/content/drive/MyDrive/download-relay/file.zip"
> ```
>
> 如果看到 `HTML document`、`<!doctype html>` 或登录提示，就回网页重新复制真实下载 URL。

> **Figshare / Zenodo 链接过期怎么办？**
>
> 重新从文件下载按钮复制链接。Figshare 的临时下载链接尤其不要隔夜保存，复制后尽快启动 `wget` 或 `aria2`。

> **下载链接带鉴权怎么办？**
>
> 有些链接依赖浏览器 Cookie 或登录状态，直接 `wget` 会拿到 HTML 登录页。可以优先寻找官方提供的直链、API 下载方式，或者手动下载。不要把自己的 Cookie、Token 写进公开 Notebook。

> **Drive 到本地仍然慢怎么办？**
>
> 这是正常的，因为最后一步还是本地连 Google。可以换 Google Drive for desktop 或 `rclone`，也可以把大文件拆分成较少的压缩包分批同步。这个方案解决的是“源站到 Colab”这一段的稳定性，不保证“Drive 到本地”一定高速。

> **能不能拿来下任意资源？**
>
> 不建议。这个方案适合合法公开资源，不要用来绕过版权、付费墙或平台限制。

## 小结

Google Drive 下载转接的核心很简单：

```text
Colab 负责把公开文件从外网拉下来，Drive 负责保存，本地再从 Drive 取回。
```

日常使用时，我会按这个顺序操作：

> - 先确认复制的是“真实文件下载 URL”，不是网页 URL。
> - 小文件直链：`wget -c`
> - 大文件直链：`aria2c`
> - 超大文件：先下载到 `/content/tmp_download`，再复制到 `MyDrive/download-relay`
> - Google Drive 分享文件：`gdown`
> - 本地长期同步：Google Drive for desktop / `rclone`

参考：

> - [Figshare/Zenodo上的数据/文件下载不下来？尝试利用Google Colab](https://zhuanlan.zhihu.com/p/1898503078782674027)
> - [Google Drive for desktop 帮助](https://support.google.com/drive/answer/7329379)
> - [rclone 文档](https://rclone.org/docs/)
> - [Google Colab Drive FAQ](https://research.google.com/colaboratory/faq.html#drive-timeout)
