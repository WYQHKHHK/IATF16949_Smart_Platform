import { describe, it, expect } from 'vitest';
import { iatfData, Clause } from '../src/data/iatfData';

describe('IATF Data Integrity', () => {
  it('should have loaded data', () => {
    expect(iatfData).toBeDefined();
    expect(iatfData.length).toBeGreaterThan(0);
  });

  const checkNodes = (nodes: Clause[]) => {
    nodes.forEach(node => {
      // 1. 测试标题去重：标题绝不能以 # 号开头
      expect(node.title).not.toMatch(/^#/);
      
      // 2. 测试 ID 解析正常
      expect(node.id).toBeDefined();

      if (node.subClauses && node.subClauses.length > 0) {
        // 递归检查子节点
        checkNodes(node.subClauses);
      }
    });
  };

  it('should not contain any headers with # prefix in titles due to parsing errors', () => {
    checkNodes(iatfData);
  });



  it('should correctly parse the specific level-5 clauses like 8.2.3.1.1', () => {
    let found = false;
    const findClause = (nodes: Clause[], id: string) => {
      for (const node of nodes) {
        if (node.id === id) {
          found = true;
          // Ensure it has the correct title
          expect(node.title).toBe('8.2.3.1.1 与产品和服务的要求的评审 —补充');
        }
        if (node.subClauses) findClause(node.subClauses, id);
      }
    };
    findClause(iatfData, '8.2.3.1.1');
    expect(found).toBe(true);
  });
});
