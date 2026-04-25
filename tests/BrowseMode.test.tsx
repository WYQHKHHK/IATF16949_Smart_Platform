import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BrowseMode from '../src/components/BrowseMode';
import { ProgressProvider } from '../src/ProgressContext';
import { iatfData } from '../src/data/iatfData';

// 模拟 window.scrollTo 避免 jsdom 报错
window.scrollTo = vi.fn();
// 模拟 scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('BrowseMode Component', () => {
  it('renders without crashing and displays the header', () => {
    render(<ProgressProvider><BrowseMode /></ProgressProvider>);
    expect(screen.getByText('标准条款及解读')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索条款编号或关键词...')).toBeInTheDocument();
  });

  it('renders top level clauses initially', () => {
    render(<ProgressProvider><BrowseMode /></ProgressProvider>);
    // 引言和范围作为顶级条款，应该存在
    expect(screen.getByText('IATF16949:2016引言')).toBeInTheDocument();
    expect(screen.getByText('1 范围')).toBeInTheDocument();
  });

  it('dynamically displays TOC when a clause is opened', async () => {
    render(<ProgressProvider><BrowseMode /></ProgressProvider>);
    
    // 初始状态，目录字样不应该显示
    expect(screen.queryByText('目录')).not.toBeInTheDocument();

    // 点击展开第一章
    const chapter1 = screen.getByText('1 范围');
    fireEvent.click(chapter1);

    // 目录应该出现
    expect(screen.getByText('目录')).toBeInTheDocument();
    
    // 目录中应该包含 1.1 的编号按钮
    const tocNav = screen.getByRole('complementary'); // aside element
    expect(within(tocNav).getByText('1.1')).toBeInTheDocument();
  });

  it('does not duplicate text content in rendered output', () => {
    const { container } = render(<ProgressProvider><BrowseMode /></ProgressProvider>);
    
    // 获取引言的文本内容，引言的内容比较独特，例如 "采用质量管理体系是组织的一项战略性决策"
    // 以前重复时，这个句子会被渲染成两段。现在它应该只出现一次。
    const uniqueText = "采用质量管理体系是组织的一项战略性决策";
    const textNodes = screen.queryAllByText(new RegExp(uniqueText));
    
    // 不应该出现两次
    expect(textNodes.length).toBeLessThanOrEqual(1);
  });
});
