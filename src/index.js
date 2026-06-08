const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(os.homedir(), '.quickpaste');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const MAX_HISTORY = 1000;

const DEFAULT_CONFIG = {
  maxHistory: 500,
  watchInterval: 3000,
  autoSaveImages: false,
  imageQuality: 80,
  theme: 'default',
  shortcuts: {
    open: 'Ctrl+Shift+V',
    search: 'Ctrl+Shift+F'
  }
};

class QuickPaste {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.mkdirSync(path.join(DATA_DIR, 'images'), { recursive: true });
    }
    this.config = this.loadConfig();
    this.history = this.loadHistory();
    this._lastClip = '';
    this._watcher = null;
  }

  loadConfig() {
    try {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return { ...DEFAULT_CONFIG };
    }
  }

  saveConfig() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
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
    const max = this.config.maxHistory || MAX_HISTORY;
    if (this.history.length > max) {
      this.history = this.history.slice(0, max);
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(this.history, null, 2), 'utf-8');
  }

  addEntry(type, content, source = 'manual', tags = []) {
    const entry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type,
      source,
      tags,
      timestamp: new Date().toISOString(),
    };

    if (type === 'text') {
      entry.content = content;
      entry.size = content.length;
      entry.preview = content.substring(0, 80).replace(/\n/g, ' ');
    } else if (type === 'image') {
      entry.fileName = `img_${entry.id}.png`;
      entry.size = content.length;
      entry.preview = `[图片] ${entry.size} bytes`;
    } else if (type === 'file') {
      entry.content = content;
      entry.size = content.length || 0;
      entry.preview = `[文件] ${content || ''}`;
    } else {
      entry.content = String(content);
      entry.size = entry.content.length;
      entry.preview = entry.content.substring(0, 80).replace(/\n/g, ' ');
    }

    this.history.unshift(entry);
    this.saveHistory();
    return entry;
  }

  setConfig(key, value) {
    this.config[key] = value;
    this.saveConfig();
  }

  async listHistory(n) {
    n = n || 10;
    const count = Math.min(n, this.history.length);
    if (count === 0) {
      console.log('📋 剪贴板历史为空');
      return;
    }

    console.log(`\n📋 最近 ${count} 条记录 (共 ${this.history.length} 条):\n`);

    const formatTime = (ts) => {
      const d = new Date(ts);
      const now = new Date();
      const diff = now - d;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff/60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff/3600000)}小时前`;
      return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN').substring(0, 5);
    };

    this.history.slice(0, count).forEach((item, i) => {
      const icon = item.type === 'text' ? '📝' : item.type === 'image' ? '🖼️' : '📎';
      const time = formatTime(item.timestamp);
      const tags = item.tags && item.tags.length ? ` [${item.tags.join(', ')}]` : '';
      console.log(`  ${i.toString().padStart(2, ' ')}. ${icon} ${item.preview || ''}`);
      console.log(`      🕐 ${time}  ${item.type}${tags}`);
      console.log();
    });
  }

  async search(query) {
    if (!query) {
      console.log('❌ 用法: qp search <关键词>');
      return;
    }

    const q = query.toLowerCase();
    const results = this.history.filter(item => {
      // Fuzzy search on content
      const content = (item.content || '').toLowerCase();
      if (content.includes(q)) return true;
      // Search tags
      if (item.tags && item.tags.some(t => t.toLowerCase().includes(q))) return true;
      // Search source
      if ((item.source || '').toLowerCase().includes(q)) return true;
      return false;
    });

    if (results.length === 0) {
      console.log(`🔍 未找到包含 "${query}" 的记录`);
      return;
    }

    console.log(`\n🔍 找到 ${results.length} 条结果:\n`);
    results.forEach((item, i) => {
      const icon = item.type === 'text' ? '📝' : item.type === 'image' ? '🖼️' : '📎';
      const preview = (item.preview || '').substring(0, 60);
      const time = new Date(item.timestamp).toLocaleString('zh-CN');
      console.log(`  ${i}. ${icon} ${preview}`);
      console.log(`     🕐 ${time}`);
      console.log();
    });
  }

  async viewItem(index) {
    if (index < 0 || index >= this.history.length) {
      return console.log('❌ 未找到该记录 (可用 qp list 查看索引)');
    }

    const item = this.history[index];
    const line = '━'.repeat(30);

    console.log(`\n${line}`);
    console.log(`  📋 记录 #${index}`);
    console.log(`${line}`);
    console.log(`  类型: ${item.type}`);
    console.log(`  时间: ${new Date(item.timestamp).toLocaleString('zh-CN')}`);
    console.log(`  大小: ${this.formatSize(item.size || 0)}`);
    console.log(`  来源: ${item.source || 'manual'}`);
    if (item.tags && item.tags.length) console.log(`  标签: ${item.tags.join(', ')}`);
    if (item.fileName) console.log(`  文件: ${item.fileName}`);
    console.log(`${line}`);
    console.log(`  内容:`);
    console.log(item.content || '[不可预览]');
    console.log(`${line}\n`);
  }

  async deleteItem(index) {
    if (index < 0 || index >= this.history.length) {
      return console.log('❌ 未找到该记录');
    }
    const removed = this.history.splice(index, 1)[0];
    this.saveHistory();
    console.log(`✅ 已删除: ${removed.preview || '记录'}`);
  }

  async tagItem(index, tags) {
    if (index < 0 || index >= this.history.length) {
      return console.log('❌ 未找到该记录');
    }
    if (!tags) {
      return console.log('❌ 用法: qp tag <索引> <标签1,标签2,...>');
    }
    this.history[index].tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    this.saveHistory();
    console.log(`✅ 已打标签: ${tags}`);
  }

  async clearHistory() {
    this.history = [];
    this.saveHistory();
    console.log('✅ 剪贴板历史已清空');
  }

  async clearOlderThan(days) {
    const cutoff = Date.now() - (days * 86400000);
    const before = this.history.length;
    this.history = this.history.filter(item => new Date(item.timestamp).getTime() > cutoff);
    const removed = before - this.history.length;
    this.saveHistory();
    console.log(`✅ 已清理 ${removed} 条超过 ${days} 天的记录`);
  }

  async showStats() {
    const textCount = this.history.filter(i => i.type === 'text').length;
    const imageCount = this.history.filter(i => i.type === 'image').length;
    const fileCount = this.history.filter(i => i.type === 'file').length;
    const totalSize = this.history.reduce((s, i) => s + (i.size || 0), 0);

    const today = new Date().toDateString();
    const todayCount = this.history.filter(i =>
      new Date(i.timestamp).toDateString() === today
    ).length;

    console.log(`
  📊 QuickPaste 使用统计
  ${'─'.repeat(30)}
  总记录数:   ${this.history.length}
  文本记录:   ${textCount}
  图片记录:   ${imageCount}
  文件记录:   ${fileCount}
  今日新增:   ${todayCount}
  数据总量:   ${this.formatSize(totalSize)}
  数据位置:   ${DATA_DIR}
  ${'─'.repeat(30)}
  配置:
    最大条数:     ${this.config.maxHistory}
    监控间隔:     ${this.config.watchInterval}ms
    自动存图:     ${this.config.autoSaveImages ? '开' : '关'}
  ${'─'.repeat(30)}
    `);
  }

  startWatching() {
    if (this._watcher) {
      return console.log('⚠️ 监控已经在运行中');
    }

    console.log(`🔄 监控模式 (每 ${this.config.watchInterval/1000} 秒检查剪贴板)...`);
    console.log('按 Ctrl+C 停止\n');

    const pollClipboard = () => {
      try {
        const { execSync } = require('child_process');
        if (os.platform() === 'win32') {
          const result = execSync(
            'powershell -command "[System.Windows.Forms.Clipboard]::GetText()"',
            { timeout: 2000, encoding: 'utf8' }
          ).trim();

          if (result && result !== this._lastClip) {
            // Skip if it's just a single character (usually accidental)
            if (result.length > 1 || this._lastClip === '') {
              this._lastClip = result;
              const entry = this.addEntry('text', result, 'watch');
              const preview = result.substring(0, 50).replace(/\n/g, ' ');
              console.log(`  📝 [${new Date().toLocaleTimeString()}] ${preview}`);
            }
          }
        }
      } catch {
        // Clipboard access can fail silently
      }
    };

    // Initial read
    pollClipboard();
    this._watcher = setInterval(pollClipboard, this.config.watchInterval);

    process.on('SIGINT', () => {
      clearInterval(this._watcher);
      this._watcher = null;
      console.log('\n👋 监控已停止');
      process.exit(0);
    });
  }

  stopWatching() {
    if (this._watcher) {
      clearInterval(this._watcher);
      this._watcher = null;
      console.log('🛑 监控已停止');
    } else {
      console.log('⚠️ 监控未在运行');
    }
  }

  async importFromFile(filePath) {
    const importPath = path.resolve(filePath);
    if (!fs.existsSync(importPath)) {
      return console.log(`❌ 文件不存在: ${importPath}`);
    }

    try {
      const data = JSON.parse(fs.readFileSync(importPath, 'utf-8'));
      const items = data.items || data || [];

      if (Array.isArray(items)) {
        let count = 0;
        items.forEach(item => {
          if (item.content) {
            this.addEntry(item.type || 'text', item.content, 'import', item.tags || []);
            count++;
          }
        });
        console.log(`✅ 已导入 ${count} 条记录`);
      } else {
        console.log('❌ 无法识别的文件格式');
      }
    } catch (e) {
      console.log(`❌ 导入失败: ${e.message}`);
    }
  }

  async exportHistory(filePath) {
    const exportPath = path.resolve(filePath || `quickpaste-export-${Date.now()}.json`);
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      total: this.history.length,
      config: this.config,
      items: this.history.map(item => ({
        type: item.type,
        content: item.type === 'text' ? item.content : item.preview,
        tags: item.tags || [],
        timestamp: item.timestamp,
        source: item.source,
        size: item.size
      }))
    };
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf-8');
    console.log(`✅ 已导出 ${this.history.length} 条记录到: ${exportPath}`);
  }

  async backup() {
    const backupDir = path.join(DATA_DIR, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `history-${timestamp}.json`);
    fs.copyFileSync(HISTORY_FILE, backupFile);
    console.log(`✅ 备份已创建: ${backupFile}`);
  }

  formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }
}

module.exports = { QuickPaste, DEFAULT_CONFIG };
