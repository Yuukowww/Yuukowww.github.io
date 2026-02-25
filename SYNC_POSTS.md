# 增量同步 Post Markdown

本项目提供了一个增量同步脚本：只同步发生变化的 `source/_posts/**/*.md` 文件。

## 1. 初始化配置

```bash
cp .sync-posts.conf.example .sync-posts.conf
```

编辑 `.sync-posts.conf`，至少设置：

```bash
REMOTE_TARGET="user@server:/var/www/hexo_blog_backup"
```

## 2. 常用命令

```bash
make sync-status    # 查看当前同步基线
make sync-dry-run   # 预览将同步哪些文件
make sync-posts     # 执行同步（成功后更新基线）
make sync-reset     # 将基线重置为当前 HEAD
```

## 3. 同步逻辑

- 首次同步（无基线）: 同步所有已跟踪的 post markdown。
- 后续同步: 基于 `上次成功同步 commit -> 当前 HEAD` 计算变更。
- 同时包含当前工作区未提交的 markdown 变更（含 staged / unstaged / untracked）。
- 每次 `sync-posts` 成功后，会更新 `.sync/posts_last_sync_commit`。

## 4. 注意事项

- `.sync-posts.conf` 已加入 `.gitignore`，避免泄露服务器信息。
- 目标机器需要支持 `rsync`。
- 如果远端目录不存在，请先在服务器创建。