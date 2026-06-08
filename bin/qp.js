#!/usr/bin/env node

/**
 * QuickPaste - 轻量级剪贴板管理工具
 * 小白 AI 出品
 */

const { QuickPaste } = require('../src/index');

const qp = new QuickPaste();
const args = process.argv.slice(2);
const cmd = args[0] || 'help';

async function main() {
  switch (cmd) {
    case 'list':
    case 'ls':
      await qp.listHistory(args[1]);
      break;

    case 'search':
    case 'find':
      await qp.search(args.slice(1).join(' '));
      break;

    case 'view':
    case 'show':
      await qp.viewItem(parseInt(args[1]) || 0);
      break;

    case 'copy':
    case 'cp':
      await qp.copyToClipboard(parseInt(args[1]) || 0);
      break;

    case 'clear':
      await qp.clearHistory();
      break;

    case 'stats':
      await qp.showStats();
      break;

    case 'watch':
      console.log('📋 监控模式启动中...');
      qp.startWatching();
      break;

    case 'export':
      await qp.exportHistory(args[1] || 'clipboard-export.json');
      break;

    case 'help':
    default:
      showHelp();
      break;
  }
}

function showHelp() {
  console.log(`
  ⚡ QuickPaste v1.0.0 - 轻量级剪贴板管理工具

  用法:
    qp list [n]        显示最近 n 条记录 (默认 10)
    qp search <关键词>  搜索剪贴板历史
    qp view [n]        查看第 n 条记录的详细内容
    qp copy [n]        将第 n 条记录复制回剪贴板 (默认最新)
    qp clear           清空所有历史记录
    qp stats           查看使用统计
    qp watch           启动监控模式 (实时记录剪贴板)
    qp export [文件]    导出历史到 JSON 文件
    qp help            显示此帮助

  📖 项目主页: https://github.com/lihaoyu-code/quickpaste
  ☕ 如果对你有用，请考虑赞助: https://github.com/sponsors/lihaoyu-code
  `);
}

main().catch(console.error);
