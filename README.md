# QuickPaste ⚡

> 轻量级剪贴板增强工具 — 快速保存、搜索和复用你的剪贴板历史

![License](https://img.shields.io/github/license/lihaoyu-code/quickpaste)
![Version](https://img.shields.io/github/v/release/lihaoyu-code/quickpaste)
![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)

## 📖 简介

**QuickPaste** 是一个轻量级的剪贴板管理工具，帮你告别"复制 + 粘贴"的烦恼。无论是代码片段、重要文本还是文件路径，QuickPaste 都能帮你保存历史记录，随时搜索和复用。

**为什么选择 QuickPaste？**
- 🪶 **极简** — 一个命令搞定，不占系统资源
- 🔍 **快速搜索** — 瞬间找到历史记录
- 💾 **自动保存** — 开启监控模式，自动记录剪贴板
- 🆓 **完全免费开源**

## 🚀 快速开始

```bash
# 安装
npm install -g quickpaste

# 查看最近 10 条记录
qp list

# 搜索历史
qp search "关键词"

# 查看某条记录的详情
qp view 0

# 查看统计
qp stats
```

## 📋 命令说明

| 命令 | 说明 |
|------|------|
| `qp list [n]` | 显示最近 n 条记录（默认 10） |
| `qp search <关键词>` | 搜索剪贴板历史 |
| `qp view [index]` | 查看第 n 条记录详情 |
| `qp copy [index]` | 将记录复制回剪贴板 |
| `qp clear` | 清空历史记录 |
| `qp stats` | 使用统计 |
| `qp watch` | 实时监控模式 |
| `qp export [file]` | 导出历史到 JSON |

## 🛠️ 技术栈

- Node.js
- 纯 CLI，零依赖

## 🤝 贡献

欢迎 Issue 和 PR！

## ☕ 赞助

如果你觉得这个项目对你有用，欢迎赞助支持我的开发：

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-%23EA4AAA)](https://github.com/sponsors/lihaoyu-code)

## 📄 许可证

MIT © lihaoyu-code
