// tests/setup.js
// This file is used to set up the testing environment

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

// Mock indexedDB
global.indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
}

// Mock File API
global.File = class MockFile {
  constructor(parts, filename, properties = {}) {
    this.parts = parts
    this.name = filename
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
    this.type = properties.type || ''
    this.lastModified = properties.lastModified || Date.now()
  }

  slice(start, end) {
    const slicedParts = []
    let currentSize = 0
    for (const part of this.parts) {
      if (currentSize + part.length > start && currentSize < end) {
        const sliceStart = Math.max(0, start - currentSize)
        const sliceEnd = Math.min(part.length, end - currentSize)
        slicedParts.push(part.slice(sliceStart, sliceEnd))
      }
      currentSize += part.length
    }
    return new MockFile(slicedParts, this.name)
  }

  arrayBuffer() {
    return Promise.resolve(new TextEncoder().encode(this.parts.join('')).buffer)
  }
}

// Mock console for tests
global.console = {
  ...global.console,
  log: vi.fn(), // Mock console.log to reduce noise in tests
  warn: vi.fn(),
  error: vi.fn(),
}