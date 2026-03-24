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
> - Deepseek: [官网](deepseek.cn) [API](platform.deepseek.cn)



> **外国AI**
>
> - **Google Gemini** [官网](gemini.google.com)  [AI Studio](aistudio.google.com) 学生优惠
> - **ChatGPT** [官网](chatgpt.com) 
> - **Claude** [官网](claude.ai)



## 常见工具

> - **Claude Code** Claude 推出的 Coding Agent，CLI/VSCode插件
> - **Codex** ChatGPT 的 Coding Agent,平台 CLI/VSCode插件 + GUI(MacOS)， 免费额度大，有Business account用不完
> - **AntiGravity** Google的 AI Coding IDE, 支持Gemini Claude ChatGPT 的大杯模型, 代理模式登陆困难, 有pro大杯
> - **Cursor** AI Coding IDE
> - **Vscode Copilot** VSCode 插件，学生验证后300次/月访问，之前夯现在小丑



## 常见问题与实现

### Codex WSL checkin 遇到 NAT 通信阻拦
WSL默认NAT隔离内网，在Win11+WSL2中可以使用镜像模式，WSL可以共享宿主机的`Localhost`(如果使用Clash,通过`127.0.0.1:7890`)
```powershell
cd $env:USERPROFILE
@"
[wsl2]
networkingMode=mirrored
"@ | Add-Content "$env:USERPROFILE\.wslconfig"
wsl --shutdown
```




### Codex/ClaudeCode multi-agent实现


VSCode Codex 

使用`CODEX.md`作为主Agent的执行规范，使用`AGENT.md`作为审核Agent的执行规范
在Codex的`config.toml`或者界面进行MCP server设置, 在`config.toml`注册MCP服务器
![MCPSetting](/picture/Codex/shoot1.png)
```toml
[mcp_servers.codex-reviewer]
type = "stdio"
command = "/opt/anaconda3/bin/python3"
args = ["/Users/asuna/Asuna/study&work/git/agentframework/scripts/codex_reviewer_mcp.py"]
env = { PATH = "/opt/anaconda3/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin", HOME = "/Users/asuna", CODEX_BINARY = "/Users/asuna/.codex/bin/codex-latest", CODEX_REVIEWER_FRAMEWORK_ROOT = "/Users/asuna/Asuna/study&work/git/agentframework" }

```