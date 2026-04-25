export interface AppVersion {
  version: string;
  date: string;
  changes: string[];
  type: 'major' | 'minor' | 'patch';
}

export const appVersions: AppVersion[] = [
  {
    version: '1.1.0',
    date: '2026-04-25',
    type: 'minor',
    changes: [
      '新增赞助支持功能与二维码收款',
      '新增版权归属与免责声明模块',
      '优化暗黑模式全局过渡动画（500ms平滑过渡）',
      '移除前端敏感 API 依赖，提高公开发布安全性',
      '整体代码与组件清理优化'
    ]
  },
  {
    version: '1.0.0',
    date: '2026-04-25',
    type: 'major',
    changes: [
      '初始化项目版本管理系统',
      '建立标准条款浏览基础架构',
      '集成辅助条款解读与测验功能',
      '支持基础暗黑模式'
    ]
  }
];

export const currentVersion = appVersions[0].version;
