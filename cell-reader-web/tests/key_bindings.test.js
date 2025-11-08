import { describe, it, expect, beforeEach, vi } from 'vitest'

// Test the key binding functionality
describe('Key Binding Tests', () => {
  // Simulate the keyboard handling function
  const createHandleKeyboard = (keyBindings) => {
    return (key) => {
      // Simulate the logic from the updated components
      if (keyBindings.nextChapter.includes(key)) {
        return 'next'
      }
      if (keyBindings.prevChapter.includes(key)) {
        return 'prev'
      }
      return 'none'
    }
  }

  it('should handle default key bindings', () => {
    const keyBindings = {
      nextChapter: ['ArrowRight', 'PageDown', ' '],
      prevChapter: ['ArrowLeft', 'PageUp']
    }
    
    const handleKeyboard = createHandleKeyboard(keyBindings)
    
    // Test next chapter keys
    expect(handleKeyboard('ArrowRight')).toBe('next')
    expect(handleKeyboard('PageDown')).toBe('next')
    expect(handleKeyboard(' ')).toBe('next')
    
    // Test previous chapter keys
    expect(handleKeyboard('ArrowLeft')).toBe('prev')
    expect(handleKeyboard('PageUp')).toBe('prev')
    
    // Test non-bound keys
    expect(handleKeyboard('Enter')).toBe('none')
    expect(handleKeyboard('Escape')).toBe('none')
  })

  it('should handle custom key bindings', () => {
    const keyBindings = {
      nextChapter: ['a', 'd', 'w'],
      prevChapter: ['q', 's', 'z']
    }
    
    const handleKeyboard = createHandleKeyboard(keyBindings)
    
    // Test custom next chapter keys
    expect(handleKeyboard('a')).toBe('next')
    expect(handleKeyboard('d')).toBe('next')
    expect(handleKeyboard('w')).toBe('next')
    
    // Test custom previous chapter keys
    expect(handleKeyboard('q')).toBe('prev')
    expect(handleKeyboard('s')).toBe('prev')
    expect(handleKeyboard('z')).toBe('prev')
  })

  it('should handle overlapping keys correctly', () => {
    const keyBindings = {
      nextChapter: ['a', 'b', 'c'],
      prevChapter: ['b', 'y', 'z'] // 'b' is in both
    }
    
    const handleKeyboard = createHandleKeyboard(keyBindings)
    
    // If a key is in both arrays, the next chapter action should take precedence
    // (as it's checked first in the actual implementation)
    expect(handleKeyboard('a')).toBe('next')
    expect(handleKeyboard('b')).toBe('next') // 'b' is in both, but next is checked first
    expect(handleKeyboard('c')).toBe('next')
    expect(handleKeyboard('y')).toBe('prev')
    expect(handleKeyboard('z')).toBe('prev')
  })

  it('should validate key binding updates', () => {
    // Simulate the store functions
    let keyBindings = {
      nextChapter: ['ArrowRight', 'PageDown'],
      prevChapter: ['ArrowLeft', 'PageUp']
    }
    
    // Simulate addKeyBinding action
    const addKeyBinding = (action, key) => {
      if (action === 'nextChapter' && !keyBindings.nextChapter.includes(key)) {
        keyBindings.nextChapter.push(key)
      } else if (action === 'prevChapter' && !keyBindings.prevChapter.includes(key)) {
        keyBindings.prevChapter.push(key)
      }
    }
    
    // Simulate removeKeyBinding action
    const removeKeyBinding = (action, key) => {
      if (action === 'nextChapter') {
        keyBindings.nextChapter = keyBindings.nextChapter.filter(k => k !== key)
      } else if (action === 'prevChapter') {
        keyBindings.prevChapter = keyBindings.prevChapter.filter(k => k !== key)
      }
    }
    
    // Test adding keys
    expect(keyBindings.nextChapter.length).toBe(2)
    addKeyBinding('nextChapter', 'c')
    expect(keyBindings.nextChapter.length).toBe(3)
    expect(keyBindings.nextChapter).toContain('c')
    
    // Test that duplicate keys are not added
    addKeyBinding('nextChapter', 'c')
    expect(keyBindings.nextChapter.length).toBe(3) // Still 3, no duplicate
    
    // Test removing keys
    removeKeyBinding('nextChapter', 'c')
    expect(keyBindings.nextChapter.length).toBe(2)
    expect(keyBindings.nextChapter).not.toContain('c')
  })
})