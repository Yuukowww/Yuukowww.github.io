---
title: LLM应用指北
date: 2026-03-23
tag: [LLM, 日常工作]
categories: AI
description: 关于市面上的生成式AI的使用攻略
---

## 常见的国内外AI

> **国内AI**
> 
> - Deepseek: [官网](deepseek.cn) [API](platform.deepseek.cn) 最新V4 Flash 与 V4pro(2.5折)
> - Qwen: [官网](https://cn.aliyun.com/benefit/scene/ai-discount?from_alibabacloud=) 学生300r羊毛
> - 智谱: [官网](https://bigmodel.cn/) Coding Plan

> **外国AI**
>
> - **Google Gemini** [官网](gemini.google.com)  [AI Studio](aistudio.google.com) 薅羊毛:学生优惠(已失效)
> - **ChatGPT** [官网](chatgpt.com) 薅羊毛:大兵优惠(已失效)、Business(闲鱼5r)、Plus
> - **Claude** [官网](claude.ai) 中转站



## 常见工具

> - **Claude Code** Claude 推出的 Coding Agent，CLI/VSCode插件 贵
> - **Codex** ChatGPT 的 Coding Agent,平台 CLI/VSCode插件 + GUI(MacOS)， 免费额度大，有Business account用不完 夯
> - **AntiGravity** Google的 AI Coding IDE, 支持Gemini Claude ChatGPT 的大杯模型, 代理模式登陆困难, 有pro大杯
> - **Cursor** AI Coding IDE
> - **Vscode Copilot** VSCode 插件，学生验证后300次/月访问，能力较差

### Claude Code / Codex 使用方式
#### 1. VSCode 插件
在Windows端最容易实现的方案，在VSCode的左侧插件市场进行安装，并登陆帐号或者配置API就可以使用。配置API的方法见后文

![fig-codexplugin](/picture/Codex/shoot3.png)
![fig-claudeplugin](/picture/Codex/shoot4.png)

#### 2. CLI - 命令行工具
CLI适合长时间改代码、跑测试、做多轮项目任务。核心策略是先看代码实际放在哪里：

**选择策略**

- **Win + WSL2**：项目本来就在Ubuntu/Linux工具链里，或者需要更稳的sandbox、Docker、bash生态，优先选这个。仓库放在`~/code`，不要放在`/mnt/c/...`，速度和权限问题会少很多。
- **Win 非WSL**：项目在`C:\`下，依赖Visual Studio、PowerShell、Windows SDK等原生工具链时选这个。Codex CLI现在原生Windows支持更完整；Claude Code原生Windows可用，但需要Git for Windows，且sandbox能力不如WSL2。
- **Macos**：直接本机安装，体验最省事。Codex用Homebrew/npm都可以；Claude Code优先官方native installer。

**Windows - WSL2**

Codex CLI
```shell
# PowerShell管理员窗口中先安装并进入WSL
wsl --install
wsl

# WSL内安装Node.js与Codex
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install 22
npm i -g @openai/codex
codex
```

Claude Code
```shell
# 官方native installer，推荐
curl -fsSL https://claude.ai/install.sh | bash
claude

# npm方案也可用，但不要用sudo
npm install -g @anthropic-ai/claude-code
```

WSL建议用WSL2。Codex新版本的Linux sandbox不再适合WSL1；Claude Code如果需要sandboxed command execution，也应该走WSL2。

**Windows - 非WSL**

Codex CLI
```powershell
winget install OpenJS.NodeJS.LTS
npm i -g @openai/codex
codex
```

原生Windows下Codex优先使用`elevated` sandbox，失败再退到`unelevated`：
```toml
# %USERPROFILE%\.codex\config.toml
[windows]
sandbox = "elevated" # or "unelevated"
```

Claude Code
```powershell
winget install --id Git.Git -e
irm https://claude.ai/install.ps1 | iex
claude
```

如果Claude Code找不到Git Bash，在`~/.claude/settings.json`里指定路径：
```json
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  }
}
```

也可以用WinGet安装Claude Code：
```powershell
winget install Anthropic.ClaudeCode
```
但WinGet/Homebrew这类包管理安装通常需要手动升级；官方native installer会自动更新。

**Macos**

Codex CLI
```shell
# Homebrew方案
brew install --cask codex
codex

# npm方案
npm i -g @openai/codex
codex
```

Claude Code
```shell
# 官方native installer，推荐
curl -fsSL https://claude.ai/install.sh | bash
claude

# Homebrew稳定版，手动升级
brew install --cask claude-code
```

登录方面：Codex首次运行`codex`会提示使用ChatGPT账号或API key登录；Claude Code首次运行`claude`会走浏览器登录，需要Pro/Max/Team/Enterprise/Console等可用账号。代理/localhost回调问题见后文常见问题。

参考：[Codex CLI官方文档](https://developers.openai.com/codex/cli)、[Codex Windows指南](https://developers.openai.com/codex/windows)、[Claude Code安装文档](https://code.claude.com/docs/en/setup)

#### 3. Desktop
Windows端安装Codex Desktop需要通过Microsoft Store，非常困难

Mac 端安装
https://persistent.oaistatic.com/codex-app-prod/Codex.dmg



## Codex Team / Plus account 管理

[Cockpit-tools](https://github.com/jlcodes99/cockpit-tools) 快速切换多个team / plus账号的Codex登陆，实时查看账户额度刷新情况
![fig](/picture/Codex/shoot2.png)
## Cli API 管理
[CC-Switch](https://github.com/farion1231/cc-switch) CC-Switch，管理API提供商，一键切换API，支持Claude Code/ Codex等管理。


## 常见问题与实现

### Codex WSL login 遇到 NAT 通信阻拦
WSL默认NAT隔离内网，在Win11+WSL2中可以使用镜像模式，WSL可以共享宿主机的`Localhost`(如果使用Clash,通过`127.0.0.1:7890`)
```powershell
cd $env:USERPROFILE
@"
[wsl2]
networkingMode=mirrored
"@ | Add-Content "$env:USERPROFILE\.wslconfig"
wsl --shutdown
```


### Gemini CLI 登陆失败问题
设置VPN TUN模式，或者添加环境变量
```shell
export HTTPS_PROXY=http://127.0.0.1:7890 // Clash监听端口7890
export HTTP_PROXY=http://127.0.0.1:7890
export ALL_PROXY=http://127.0.0.1:7890

// # 默认监听7890端口
// cat <<'EOF' >> ~/.bashrc
// if nc -z 127.0.0.1 7890 2>/dev/null; then
//    export http_proxy="http://127.0.0.1:7890"
//    export https_proxy="http://127.0.0.1:7890"
//    export all_proxy="socks5://127.0.0.1:7890" 
//    echo "🟢 Clash Proxy is running (Port 7890)"
// else
//    unset http_proxy
//    unset https_proxy
//    unset all_proxy
// fi
// EOF
// source ~/.bashrc
```






### Windows Antigravity 通过dll注入方式进行认证信息转发

[Antigravity-Proxy](https://github.com/yuaotian/antigravity-proxy/blob/main/README.md)



### Codex 异步multi-agent实现

使用`CODEX.md`作为主Agent的执行规范，使用`AGENT.md`作为审核Agent的执行规范

参见[项目](https://github.com/Asunazzz123/Codex-Reviewer)

**ClaudeCode+Codex**

通过官方plugin实现 https://github.com/openai/codex-plugin-cc

### Codex 上下文长度修改

`ChatGPT-5.4`默认支持1M的上下文，但是Codex的设定默认上下文长度为256K。通过这个方式可以进行上下文长度的修改

```shell
vim ~/.codex/config.toml
```

```toml
model_context_window = 1000000  # 上下文修改为1M
model_auto_compact_token_limit = 500000 # 当上下文到达500K后压缩上下文
```
