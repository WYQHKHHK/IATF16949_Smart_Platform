import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { ClauseItem } from '../src/components/BrowseMode';
import React from 'react';

// Mock progress hook
vi.mock('../src/ProgressContext', () => ({
  useProgress: () => ({ viewedClauses: [] })
}));

describe('ClauseItem Interaction Bugs', () => {
  const mockClause = {
    id: '6.1',
    title: '6.1 Actions to address risks and opportunities',
    content: ['Test content'],
    subClauses: [
      { id: '6.1.1', title: '6.1.1 Test Sub', content: ['Sub content'] }
    ],
    interpretation: {
      explanation: 'Interpretation text',
      cases: 'Case text',
      related: []
    }
  };

  const defaultProps = {
    clause: mockClause,
    onJump: vi.fn(),
    setActiveId: vi.fn(),
    onLevel1Toggle: vi.fn(),
    bookmarks: [],
  };

  it('verifies that manual folding persists (fixes the flash bug)', async () => {
    let activeId = null;
    const setActiveId = vi.fn((id) => { activeId = id; });
    
    const { rerender } = render(
      <ClauseItem {...defaultProps} activeId={activeId} setActiveId={setActiveId} />
    );

    const title = screen.getByText(/6.1 Actions/);
    
    // 1. Open it
    fireEvent.click(title);
    expect(screen.queryByText('6.1.1 Test Sub')).not.toBeNull();

    // 2. Click to close
    fireEvent.click(title);
    
    // Wait for animation to finish (element to be removed from DOM)
    await waitForElementToBeRemoved(() => screen.queryByText('6.1.1 Test Sub'));
    
    // Rerender with same activeId
    rerender(<ClauseItem {...defaultProps} activeId={activeId} setActiveId={setActiveId} />);
    
    expect(screen.queryByText('6.1.1 Test Sub')).toBeNull();
  });

  it('verifies that interpretation visibility is synchronized with isOpen', async () => {
    const { rerender } = render(<ClauseItem {...defaultProps} />);
    
    const title = screen.getByText(/6.1 Actions/);
    
    // 1. Initially closed
    expect(screen.queryByText('Interpretation text')).toBeNull();
    
    // 2. Click to open
    fireEvent.click(title);
    expect(screen.queryByText('Interpretation text')).not.toBeNull();
    
    // 3. Click to close
    fireEvent.click(title);
    
    // Wait for animation
    await waitForElementToBeRemoved(() => screen.queryByText('Interpretation text'));
    
    expect(screen.queryByText('Interpretation text')).toBeNull();
  });

  it('verifies hierarchical expansion: opening parent does not open children', () => {
    const { rerender } = render(<ClauseItem {...defaultProps} />);
    
    const title = screen.getByText(/6.1 Actions/);
    
    // Open parent
    fireEvent.click(title);
    
    // Parent content (sub-clause title) should be visible
    expect(screen.getByText('6.1.1 Test Sub')).toBeInTheDocument();
    
    // But sub-clause CONTENT should remain hidden (since sub-clause itself is not open)
    expect(screen.queryByText('Sub content')).toBeNull();
  });
});
