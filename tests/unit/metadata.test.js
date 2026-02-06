import { describe, it, expect } from '@jest/globals';

describe('Metadata System', () => {
  it('should track file changes', () => {
    const previous = [{ path: 'test.js', size: 100 }];
    const current = [{ path: 'test.js', size: 200 }, { path: 'new.js', size: 50 }];
    
    const added = current.filter(f => !previous.find(p => p.path === f.path));
    const modified = current.filter(f => {
      const prev = previous.find(p => p.path === f.path);
      return prev && prev.size !== f.size;
    });
    
    expect(added).toHaveLength(1);
    expect(modified).toHaveLength(1);
  });

  it('should count files by type', () => {
    const files = [
      { type: 'js' },
      { type: 'js' },
      { type: 'ts' }
    ];
    
    const byType = files.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {});
    
    expect(byType.js).toBe(2);
    expect(byType.ts).toBe(1);
  });
});
