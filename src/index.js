const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(os.homedir(), '.quickpaste');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const MAX_HISTORY = 500;

class QuickPaste {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.history = this.loadHistory();
  }

  loadHistory() {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveHistory() {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(this.history, null, 2), 'utf-8');
  }

  addEntry(type, content, source = 'manual') {
    this.history.unshift({
      id: Date.now(),
      type,
      content: type === 'text' ? content : content.substring(0, 500),
      source,
      timestamp: new Date().toISOString(),
      size: typeof content === 'string' ? content.length : content.length || 0
    });

    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(0, MAX_HISTORY);
    }
    this.saveHistory();
  }

  async listHistory(n = 10) {
    const count = Math.min(n, this.history.length);
    if (count === 0) {
      console.log('📋 剪贴板历史为空');
      return;
    }

    console.log(`\n📋 最近 ${count} 条剪贴板记录:\n`);
    this.history.slice(0, count).forEach((item, i) => {
      const icon = item.type === 'text' ? '📝' : item.type === 'image' ? '🖼️' : '📎';
      const preview = item.type === 'text'
        ? (item.content || '').substring(0, 60).replace(/\n/g, ' ')
        : `[${item.type}] (${item.size} bytes)`;
      const time = new Date(item.timestamp).toLocaleString('zh-CN');
      console.log(`  ${i}. ${icon} ${preview}`);
      console.log(`     🕐 ${time}\n`);
    });
  }

  async search(query) {
    if (!query) {
      console.log('❌ 请输入搜索关键词');
      return;
    }

    const results = this.history.filter(item =>
      item.content && item.content.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
      console.log(`🔍 未找到包含 "${query}" 的记录`);
      return;
    }

    console.log(`\n🔍 找到 ${results.length} 条包含 "${query}" 的记录:\n`);
    results.forEach((item, i) => {
      const icon = item.type === 'text' ? '📝' : '🖼️';
      const preview = (item.content || '').substring(0, 80).replace(/\n/g, ' ');
      console.log(`  ${i}. ${icon} ${preview}`);
      console.log(`     🕐 ${new Date(item.timestamp).toLocaleString('zh-CN')}\n`);
    });
  }

  async viewItem(index) {
    const item = this.history[index];
    if (!item) {
      console.log('❌ 未找到该记录');
      return;
    }

    console.log(`\n━━━ 第 ${index} 条记录 ━━━`);
    console.log(`类型: ${item.type}`);
    console.log(`时间: ${new Date(item.timestamp).toLocaleString('zh-CN')}`);
    console.log(`大小: ${item.size} bytes`);
    console.log(`来源: ${item.source}`);
    console.log(`━━━ 内容 ━━━`);
    console.log(item.content || '[二进制内容]');
    console.log(`━━━━━━━━━━━\n`);
  }

  async copyToClipboard(index) {
    console.log('⚠️  请手动复制——在终端中选中上方内容即可');
    await this.viewItem(index);
  }

  async clearHistory() {
    this.history = [];
    this.saveHistory();
    console.log('✅ 剪贴板历史已清空');
  }

  async showStats() {
    const textCount = this.history.filter(i => i.type === 'text').length;
    const imageCount = this.history.filter(i => i.type === 'image').length;
    const fileCount = this.history.filter(i => i.type === 'file').length;
    const totalSize = this.history.reduce((s, i) => s + (i.size || 0), 0);

    console.log(`
  📊 QuickPaste 使用统计

  总记录数: ${this.history.length}
  文本记录: ${textCount}
  图片记录: ${imageCount}
  文件记录: ${fileCount}
  数据总量: ${this.formatSize(totalSize)}
  数据位置: ${DATA_DIR}
    `);
  }

  startWatching() {
    // Monitor mode - placeholder for future implementation
    console.log('🔄 监控模式 (每 5 秒检查剪贴板)...');
    console.log('按 Ctrl+C 停止\n');
    
    const interval = setInterval(() => {
      // Simple polling mode
      try {
        const { execSync } = require('child_process');
        if (os.platform() === 'win32') {
          // Check clipboard via PowerShell
          const result = execSync('powershell -command "[System.Windows.Forms.Clipboard]::GetText()"', { timeout: 2000 });
          const text = result.toString().trim();
          if (text && (!this._lastClip || text !== this._lastClip)) {
            this._lastClip = text;
            this.addEntry('text', text, 'watch');
            const preview = text.substring(0, 40).replace(/\n/g, ' ');
            console.log(`  📝 已捕获: ${preview}`);
          }
        }
      } catch {
        // Silently handle clipboard errors
      }
    }, 5000);

    process.on('SIGINT', () => {
      clearInterval(interval);
      console.log('\n👋 监控已停止');
      process.exit(0);
    });
  }

  async exportHistory(filePath) {
    const exportPath = path.resolve(filePath);
    const exportData = {
      exportedAt: new Date().toISOString(),
      total: this.history.length,
      items: this.history
    };
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf-8');
    console.log(`✅ 已导出 ${this.history.length} 条记录到: ${exportPath}`);
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
}

module.exports = { QuickPaste };
