#!/usr/bin/env node

/**
 * QuickPaste v2.0 - 轻量级剪贴板管理工具
 * 小白 AI 出品 | https://github.com/lihaoyu-code/quickpaste
 */

const { QuickPaste } = require('../src/index');

const qp = new QuickPaste();
const args = process.argv.slice(2);
const cmd = args[0] || 'help';

async function main() {
  switch (cmd) {
    case 'list':
    case 'ls':
      await qp.listHistory(parseInt(args[1]) || 10);
      break;

    case 'search':
    case 'find':
      await qp.search(args.slice(1).join(' '));
      break;

    case 'view':
    case 'show':
      await qp.viewItem(parseInt(args[1]) || 0);
      break;

    case 'delete':
    case 'del':
      await qp.deleteItem(parseInt(args[1]));
      break;

    case 'tag':
      await qp.tagItem(parseInt(args[1]), args.slice(2).join(''));
      break;

    case 'clear':
      if (args[1] === '--older' || args[1] === '-o') {
        await qp.clearOlderThan(parseInt(args[2]) || 30);
      } else {
        await qp.clearHistory();
      }
      break;

    case 'stats':
      await qp.showStats();
      break;

    case 'watch':
      qp.startWatching();
      break;

    case 'stop':
      qp.stopWatching();
      break;

    case 'backup':
      await qp.backup();
      break;

    case 'export':
      await qp.exportHistory(args[1]);
      break;

    case 'import':
      await qp.importFromFile(args[1]);
      break;

    case 'config':
      if (args[1] && args[2]) {
        // qp config <key> <value>
        let val = args[2];
        if (val === 'true') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(val)) val = Number(val);
        qp.setConfig(args[1], val);
        console.log(`✅ 配置已更新: ${args[1]} = ${val}`);
      } else {
        console.log('\n⚙️  当前配置:\n');
        Object.entries(qp.config).forEach(([k, v]) => {
          console.log(`  ${k}: ${JSON.stringify(v)}`);
        });
        console.log();
      }
      break;

    case 'help':
    default:
      showHelp();
      break;
  }
}

function showHelp() {
  const v = require('../package.json').version;
  console.log(`
  ⚡ QuickPaste v${v} - 轻量级剪贴板管理工具
  ${'─'.repeat(40)}

  基本操作:
    qp list [n]          显示最近 n 条记录 (默认 10)
    qp search <关键词>    搜索剪贴板历史
    qp view [index]      查看第 n 条记录详情
    qp delete <index>    删除某条记录

  管理:
    qp tag <index> <标签> 给记录打标签, 例: qp tag 0 代码,重要
    qp clear             清空全部历史
    qp clear --older 30  清理 30 天前的记录
    qp stats             查看使用统计

  监控:
    qp watch             启动监控模式 (自动记录剪贴板)
    qp stop              停止监控

  数据:
    qp export [文件]      导出历史到 JSON 文件
    qp import <文件>      从 JSON 文件导入
    qp backup            创建备份

  设置:
    qp config            查看全部配置
    qp config maxHistory 1000     最大记录数
    qp config watchInterval 2000  监控间隔(ms)

  其他:
    qp help              显示此帮助

  ${'─'.repeat(40)}
  📖 https://github.com/lihaoyu-code/quickpaste
  ☕ 如果好用，请考虑赞助支持开发
  `);
}

main().catch(console.error);
