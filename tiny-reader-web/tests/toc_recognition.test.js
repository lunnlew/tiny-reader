import { describe, it, expect } from 'vitest'

// Mock the necessary functions that are used in the reader store
// Since we can't directly import the store in a test file without the full Vue/Pinia setup,
// we'll test the logic separately

// Test the enhanced regex pattern that includes 部、集、卷、章、回、节、册、篇、目
describe('TOC Recognition Tests', () => {
  // Define the enhanced regex pattern that was implemented
  const regex = /(第[一二三四五六七八九十百千万零\d]+[部集卷章回节册篇目]|(卷|册|篇)[一二三四五六七八九十百千万零\d\s、\-.：:\-]+章?|上[册卷]|下[册卷]|[上下]篇|Chapter\s+\d+|番外[一二三四五六七八九十百千万零\d\s]*篇?|外传|后记|尾声|终章|楔子|序章|引子)/i

  it('should recognize traditional chapter patterns with 第', () => {
    const testCases = [
      '第一章 内容介绍',
      '第1章 内容介绍',
      '第二卷 内容介绍',
      '第2卷 内容介绍', 
      '第三回 内容介绍',
      '第3回 内容介绍',
      '第四节 内容介绍',
      '第4节 内容介绍',
      '第五部 内容介绍',
      '第5部 内容介绍',
      '第六集 内容介绍',
      '第6集 内容介绍',
      '第七册 内容介绍',
      '第7册 内容介绍',
      '第八篇 内容介绍',
      '第8篇 内容介绍',
      '第九目 内容介绍',
      '第9目 内容介绍'
    ]
    
    testCases.forEach(testCase => {
      expect(regex.test(testCase)).toBe(true)
    })
  })

  it('should recognize standalone structural terms', () => {
    const testCases = [
      '卷一 内容介绍',
      '卷二 内容介绍',
      '册一 内容介绍',
      '册二 内容介绍',
      '篇一 内容介绍',
      '篇二 内容介绍',
      '上册 内容介绍',
      '下册 内容介绍',
      '上卷 内容介绍',
      '下卷 内容介绍',
      '上篇 内容介绍',
      '下篇 内容介绍'
    ]
    
    testCases.forEach(testCase => {
      expect(regex.test(testCase)).toBe(true)
    })
  })

  it('should recognize existing patterns for backward compatibility', () => {
    const testCases = [
      'Chapter 1 Introduction',
      'Chapter 10 Content',
      '番外篇 内容',
      '番外一 内容',
      '外传 内容',
      '后记 内容',
      '尾声 内容',
      '终章 内容',
      '楔子 内容',
      '序章 内容',
      '引子 内容'
    ]
    
    testCases.forEach(testCase => {
      expect(regex.test(testCase)).toBe(true)
    })
  })

  it('should NOT match invalid patterns', () => {
    const testCases = [
      '这是一个普通句子',
      '第一章和第二章',
      '章节内容',
      '我有一些章节',
      'Chapter title',
      '卷积神经网络',
      '第一章节内容',
      '123章节'
    ]
    
    testCases.forEach(testCase => {
      expect(regex.test(testCase)).toBe(false)
    })
  })

  it('should extract the correct chapter title from lines', () => {
    const testCases = [
      { line: '第一章 新的开始。这是内容', expected: '第一章' },
      { line: '   第二章 继续探索   ', expected: '第二章' },
      { line: '卷一 概述', expected: '卷一' },
      { line: '上册 总论', expected: '上册' },
      { line: 'Chapter 1 Introduction', expected: 'Chapter 1' }
    ]
    
    testCases.forEach(({ line, expected }) => {
      const match = line.match(regex)
      expect(match).not.toBeNull()
      expect(match && match[0].trim()).toContain(expected)
    })
  })
})