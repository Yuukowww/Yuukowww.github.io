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
> - **Google Gemini** [官网](gemini.google.com)  [AI Studio](aistudio.google.com) 薅羊毛:学生优惠(已失效)
> - **ChatGPT** [官网](chatgpt.com) 薅羊毛:大兵优惠(已失效)、Business(闲鱼5r)
> - **Claude** [官网](claude.ai)



## 常见工具

> - **Claude Code** Claude 推出的 Coding Agent，CLI/VSCode插件 贵
> - **Codex** ChatGPT 的 Coding Agent,平台 CLI/VSCode插件 + GUI(MacOS)， 免费额度大，有Business account用不完 夯
> - **AntiGravity** Google的 AI Coding IDE, 支持Gemini Claude ChatGPT 的大杯模型, 代理模式登陆困难, 有pro大杯
> - **Cursor** AI Coding IDE
> - **Vscode Copilot** VSCode 插件，学生验证后300次/月访问，之前夯现在中杯



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

参见[项目](https://github.com/Asunazzz123/Codex-Reviewer)