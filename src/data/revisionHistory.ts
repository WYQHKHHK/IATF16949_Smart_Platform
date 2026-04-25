export interface RevisionEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'major_release' | 'si' | 'faq';
  relatedClauses?: string[];
}

export const historyData: RevisionEvent[] = [
  {
    id: 'ts16949-1999',
    date: '1999年3月',
    title: 'ISO/TS 16949:1999',
    description: '国际汽车工作组 (IATF) 颁布的第一版。旨在统一全球供应商的质量评估。',
    type: 'major_release'
  },
  {
    id: 'ts16949-2002',
    date: '2002年3月',
    title: 'ISO/TS 16949:2002',
    description: '第二版，与以过程为导向的 ISO 9001:2000 标准接轨。',
    type: 'major_release'
  },
  {
    id: 'ts16949-2009',
    date: '2009年6月',
    title: 'ISO/TS 16949:2009',
    description: '第三版，与 ISO 9001:2008 接轨。更加强调缺陷预防以及减少供应链中的变差和浪费。',
    type: 'major_release'
  },
  {
    id: 'iatf16949-2016',
    date: '2016年10月',
    title: 'IATF 16949:2016 (第一版)',
    description: '从 ISO/TS 过渡到 IATF。严格遵循 ISO 9001:2015 的高阶结构。强调基于风险的思维、产品安全、内嵌软件要求以及增强领导团队的责任与担当。',
    type: 'major_release'
  },
  {
    id: 'si-1-9-2017',
    date: '2017年10月',
    title: '认可解释 (SIs) 1-9',
    description: '首批是对 2016 年初始文本的 SI 修改。涉及客户特定要求的处理、供应商 QMS 发展限制以及特定的管理评审输入。',
    type: 'si',
    relatedClauses: ['3.1', '8.4.2.3', '9.3.2.1']
  },
  {
    id: 'si-10-15-2018',
    date: '2018年4月',
    title: '认可解释 (SIs) 10-15',
    description: '明确了关于产品安全议定、应急计划强制考虑事项，以及提高内部质量审核员的胜任能力要求。',
    type: 'si',
    relatedClauses: ['4.4.1.2', '6.1.2.3', '7.2.3']
  },
  {
    id: 'si-16-18-2019',
    date: '2019年10月',
    title: '认可解释 (SIs) 16-18',
    description: '明确了全尺寸检验和功能测试的要求，以及控制计划在日常量产环境中的实际应用。',
    type: 'si',
    relatedClauses: ['8.6.2', '8.5.1.1', 'Annex A']
  },
  {
    id: 'si-19-22-2020',
    date: '2020年8月',
    title: '认可解释 (SIs) 19-22',
    description: '为解决疫情期间全球标准合规问题而出台的更新，包括远程内部审核程序和带有嵌入式软件的产品的更新。',
    type: 'si',
    relatedClauses: ['8.4.2.4.1', '9.3.2.1', '8.3.2.3']
  },
  {
    id: 'si-23-25-2021',
    date: '2021年5月',
    title: '认可解释 (SIs) 23-25',
    description: '澄清了有关替代制造方法、组织角色以及作业准备验证责任的安全与合规相关内容。',
    type: 'si',
    relatedClauses: ['8.5.6.1.1', '5.3.1', '8.5.1.3']
  },
  {
    id: 'si-26-29-2024',
    date: '2024年5月',
    title: '认可解释 (SIs) 26-29',
    description: '近期关于强化校准要求、外部实验室使用规则，以及控制计划与 FMEA 及过程流程图一致性的更新。',
    type: 'si',
    relatedClauses: ['7.1.5.2.1', '7.1.5.3.2', '8.5.1.1']
  },
  {
    id: 'iatf-rules-6th-2024',
    date: '2024年4月',
    title: 'IATF 认证规则 (Rules) 第 6 版发布',
    description: '取代第 5 版规则，于 2025 年 1 月 1 日正式生效。优化了审核策划、远程支持场所（RSL）管理以及证书周期的要求。',
    type: 'major_release'
  },
  {
    id: 'si-rules-1-17-2024',
    date: '2024年11月',
    title: '规则第 6 版认可解释 (SIs 1-17)',
    description: '针对第 6 版规则的首批修正，明确了见证审核数量、制造现场审核周期图表以及审核策划的详细要求。',
    type: 'si'
  },
  {
    id: 'si-rules-19-21-2025',
    date: '2025年11月',
    title: '规则第 6 版最新认可解释 (SIs 19-21)',
    description: '最新的修订内容：明确了认证机构法人实体持股要求（SI 19）、细化了合并审核计划的限制（SI 20），并澄清了内部体系审核记录的提交要求（SI 21）。',
    type: 'si'
  }
];
