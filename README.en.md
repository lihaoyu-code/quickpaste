# QuickPaste ⚡

> Lightweight clipboard manager — Save, search, and reuse your clipboard history

![License](https://img.shields.io/github/license/lihaoyu-code/quickpaste)
![Version](https://img.shields.io/github/v/release/lihaoyu-code/quickpaste)

## 📖 About

**QuickPaste** is a lightweight clipboard manager that helps you save, search, and reuse your clipboard history — code snippets, important text, file paths, and more.

**Why QuickPaste?**
- 🪶 **Minimal** — One command, zero bloat
- 🔍 **Instant Search** — Find any clipboard item in seconds
- 💾 **Auto-Save** — Watch mode automatically captures your clipboard
- 🆓 **100% Free & Open Source**

## 🚀 Quick Start

```bash
# Install
npm install -g quickpaste

# Show last 10 items
qp list

# Search history
qp search "keyword"

# View item details
qp view 0

# Show statistics
qp stats
```

## 📋 Commands

| Command | Description |
|---------|------------|
| `qp list [n]` | Show last n items (default 10) |
| `qp search <query>` | Search clipboard history |
| `qp view [index]` | View item details |
| `qp copy [index]` | Copy item back to clipboard |
| `qp clear` | Clear all history |
| `qp stats` | Usage statistics |
| `qp watch` | Real-time monitoring mode |
| `qp export [file]` | Export history to JSON |

## ☕ Support

If you find this project useful, please consider sponsoring:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-%23EA4AAA)](https://github.com/sponsors/lihaoyu-code)

## 📄 License

MIT © lihaoyu-code
