import fs from 'fs';
import path from 'path';
import { flatIatfData } from '../src/data/iatfData.js'; // Use .js extension or just read json if compilation fails.

// Wait, the iatfData is a ts file. It's better to just read it via fs if tsx is problematic.
// Let's do string parsing or regex on the generated iatfData.ts to avoid ts-node compilation issues in pure JS context if needed.
const iatfDataPath = path.join(process.cwd(), 'src', 'data', 'iatfData.ts');
const outPath = 'E:\\obsidian-library\\16949条款解读.md';

const dataContent = fs.readFileSync(iatfDataPath, 'utf-8');

// Use regex to extract flatIatfData
const match = dataContent.match(/export const flatIatfData = (\[[\s\S]*?\]);/);
if (match) {
  const flatData = JSON.parse(match[1]);
  let content = '';
  
  // Add some pre-filled content to show how it works
  const prefilled: any = {
    "4.1": {
      exp: "IATF 16949标准中，条款4.1“理解组织及其环境”是建立有效质量管理体系的基石。在汽车制造业中，这要求组织主动识别并监控那些可能影响其战略方向、QMS预期结果的内外部因素。这意味着要从更宏观的视角审视自身，而不是仅仅关注日常运营。",
      cases: "**案例：** 某汽车零部件公司在定义范围时，除了工厂现场，还明确将位于上海的研发中心（支持职能）纳入体系，并在手册中详细列出了顾客（如上汽、大众）的特殊要求清单。",
      rel: "6.1, 8.5.1.1"
    }
  };

  flatData.forEach((clause: any) => {
    if (clause.id.startsWith('IATF') || clause.id.startsWith('附录')) return;
    
    const pre = prefilled[clause.id];
    
    content += `# ${clause.title}\n`;
    content += `## 条款解读\n`;
    content += `${pre ? pre.exp : '[请在此处输入条款解读]'}\n\n`;
    content += `### 实际应用案例\n`;
    content += `${pre ? pre.cases : '[请在此处输入应用案例，如果没有可留空]'}\n\n`;
    content += `### 交叉引用\n`;
    content += `${pre ? pre.rel : '[如：8.5.1.1, 9.2.2]'}\n\n`;
  });

  fs.writeFileSync(outPath, content);
  console.log('Template generated successfully!');
} else {
  console.error('Failed to parse iatfData.ts');
}
