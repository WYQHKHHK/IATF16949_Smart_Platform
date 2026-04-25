import fs from 'fs';
import path from 'path';

const MD_CLAUSES_PATH = 'E:\\obsidian-library\\16949标准条款.md';
const MD_INTERPRET_PATH = 'E:\\obsidian-library\\16949条款解读.md';
const IATF_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'iatfData.ts');
const GLOSSARY_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'glossaryData.ts');

function parseMarkdown() {
  if (!fs.existsSync(MD_CLAUSES_PATH)) {
    console.error(`Error: File not found at ${MD_CLAUSES_PATH}`);
    process.exit(1);
  }

  // 1. 解析解读文件 (Interpretation)
  // 支持解析: 
  // ## 条款解读
  // ### 实际应用案例
  // ### 交叉引用 (逗号分隔的条款号)
  const interpretations: Record<string, { explanation: string, cases: string, related: string[] }> = {};
  if (fs.existsSync(MD_INTERPRET_PATH)) {
    const interpretContent = fs.readFileSync(MD_INTERPRET_PATH, 'utf-8');
    const sections = interpretContent.split(/^#\s+/m);
    sections.forEach(section => {
      const lines = section.split('\n');
      const header = lines[0].trim();
      const idMatch = header.match(/^(\d+(\.\d+)*)/);
      if (idMatch) {
        const id = idMatch[0];
        const content = lines.slice(1).join('\n');
        
        // 简单正则拆分各个部分
        let explanation = '';
        let cases = '';
        let relatedStr = '';

        const expMatch = content.match(/## 条款解读\n([\s\S]*?)(?=### 实际应用案例|### 交叉引用|$)/);
        const caseMatch = content.match(/### 实际应用案例\n([\s\S]*?)(?=### 交叉引用|$)/);
        const relMatch = content.match(/### 交叉引用\n([\s\S]*?)$/);

        if (expMatch) explanation = expMatch[1].trim();
        if (caseMatch) cases = caseMatch[1].trim();
        if (relMatch) relatedStr = relMatch[1].trim();

        const related = relatedStr.split(/[,，\s]+/).map(s => s.trim()).filter(s => s);

        interpretations[id] = { explanation, cases, related };
      }
    });
  }

  // 2. 解析主条款文件
  const content = fs.readFileSync(MD_CLAUSES_PATH, 'utf-8');
  const lines = content.split('\n');

  const iatfData: any[] = [];
  const glossary: any[] = [];
  let stack: any[] = [{ subClauses: iatfData }];
  let inGlossary = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].replace(/\r$/, '');
    const trimmedLine = rawLine.trim();
    
    if (!trimmedLine) {
      if (stack.length > 1 && stack[stack.length - 1].content.length > 0) {
        stack[stack.length - 1].content.push(rawLine);
      }
      continue;
    }
    
    if (trimmedLine.includes('## 3.1 汽车行业的术语和定义')) {
      inGlossary = true;
    }
    if (inGlossary && trimmedLine.startsWith('#') && !trimmedLine.includes('3.1')) inGlossary = false;

    if (inGlossary && trimmedLine.startsWith('•')) {
      const termLine = trimmedLine.replace('•', '').trim();
      const definition = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith('•') && !lines[j].trim().startsWith('#')) {
        const defLine = lines[j].trim();
        if (defLine) definition.push(defLine);
        j++;
      }
      const termEntry = { term: termLine, definition: definition.join('\n') };
      glossary.push(termEntry);
      
      // Also add to the current clause's content so it's visible
      if (stack.length > 1) {
        const currentNode = stack[stack.length - 1];
        currentNode.content.push(rawLine);
        definition.forEach(def => currentNode.content.push(def));
      }
      
      i = j - 1;
      continue;
    }

    const headerMatch = trimmedLine.match(/^(#+)\s*(.*)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const fullTitle = headerMatch[2].trim();
      const idMatch = fullTitle.match(/^(\d+(\.\d+)*|附录[A-Z]|附录 [A-Z])/);
      const id = idMatch ? idMatch[0] : fullTitle;
      
      const newNode = { 
        id: id, 
        title: fullTitle, 
        content: [], 
        subClauses: [],
        interpretation: interpretations[id] || null
      };
      
      while (stack.length > level) {
        stack.pop();
      }
      
      stack[stack.length - 1].subClauses.push(newNode);
      stack.push(newNode);
      continue;
    }

    if (stack.length > 1) {
      const currentNode = stack[stack.length - 1];
      currentNode.content.push(rawLine);
    }
  }

  const flatData: any[] = [];
  function flatten(nodes: any[]) {
    nodes.forEach(node => {
      flatData.push({ id: node.id, title: node.title });
      if (node.subClauses && node.subClauses.length > 0) flatten(node.subClauses);
    });
  }
  flatten(iatfData);

  const fileContent = `
export interface Interpretation {
  explanation: string;
  cases: string;
  related: string[];
}

export interface Clause {
  id: string;
  title: string;
  content: string[];
  subClauses?: Clause[];
  interpretation?: Interpretation | null;
}

export const iatfData: Clause[] = ${JSON.stringify(iatfData, null, 2)};
export const flatIatfData = ${JSON.stringify(flatData, null, 2)};
`;

  const glossaryContent = `
export interface GlossaryItem {
  term: string;
  definition: string;
}
export const glossaryData: GlossaryItem[] = ${JSON.stringify(glossary, null, 2)};
`;

  fs.writeFileSync(IATF_DATA_PATH, fileContent);
  fs.writeFileSync(GLOSSARY_DATA_PATH, glossaryContent);
  console.log('Successfully synced data with offline interpretations and cross-references.');
}

parseMarkdown();
