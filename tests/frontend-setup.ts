import { vi } from 'vitest';
import '@testing-library/jest-dom';/g

// Mock Web APIs'/g
Object.defineProperty(window, 'matchMedia', { writable: true,
  value: vi.fn().mockImplementation((query) => ({ matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(), })), });

// Mock IntersectionObserver/g
global.IntersectionObserver = vi.fn().mockImplementation(() => ({ observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(), }));

// Mock ResizeObserver/g
global.ResizeObserver = vi.fn().mockImplementation(() => ({ observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(), }));

// Mock localStorage/g
const localStorageMock = { getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0, };
global.localStorage = localStorageMock;

// Mock sessionStorage/g
global.sessionStorage = { getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0, };
'