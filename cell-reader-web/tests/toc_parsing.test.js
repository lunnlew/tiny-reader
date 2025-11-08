import { describe, it, expect } from 'vitest'

// Test the full TOC parsing logic
describe('Full TOC Parsing Tests', () => {
  // Simulate the parseTocFromFile logic for testing
  const parseToc = (fullContent) => {
    const toc = []
    const lines = fullContent.split(/\r?\n/)
    let contentIndex = 0
    
    // Use the enhanced regex pattern
    const regex = /(第[一二三四五六七八九十百千万零\d]+[部集卷章回节册篇目]|(卷|册|篇)[一二三四五六七八九十百千万零\d\s、\-.：:\-]+章?|上[册卷]|下[册卷]|[上下]篇|Chapter\s+\d+|番外[一二三四五六七八九十百千万零\d\s]*篇?|外传|后记|尾声|终章|楔子|序章|引子)/i
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      const match = regex.exec(line)
      
      if (match) {
        const leadingWhitespaceMatch = line.match(/^\s*/) 
        const leadingWhitespaceLength = leadingWhitespaceMatch ? leadingWhitespaceMatch[0].length : 0
        const patternIndex = match.index
        
        if (patternIndex === leadingWhitespaceLength) {
          const start = contentIndex + patternIndex
          const restOfLine = line.substring(patternIndex).trim()
          
          let chapterTitle = match[0]
          const punctMatches = [...restOfLine.matchAll(/[。！？.!?]/g)]
          let titleEndIndex = restOfLine.length
          
          if (punctMatches.length > 0) {
            const punctIndex = punctMatches[0].index
            if (punctIndex > match[0].length) {
              titleEndIndex = punctIndex + 1
            }
          }
          
          chapterTitle = restOfLine.substring(0, titleEndIndex).trim()
          
          if (chapterTitle.length >= match[0].length && !toc.some(item => item.title === chapterTitle)) {
            toc.push({ title: chapterTitle, offset: start })
          }
        }
      }
      
      contentIndex += line.length
      if (i < lines.length - 1) {
        contentIndex += 1
      }
    }
    
    return toc
  }

  it('should parse simple chapter titles correctly', () => {
    const content = `这是前言内容
第一章 简介
这是第一章的内容
第二章 详细说明
这是第二章的内容`
    
    const toc = parseToc(content)
    expect(toc.length).toBe(2)
    expect(toc[0].title).toBe('第一章')
    expect(toc[1].title).toBe('第二章')
  })

  it('should parse enhanced structural terms', () => {
    const content = `前言内容
第一卷 总论
卷一的内容
上册 序言
上册具体章节内容
下册 续篇
下册具体章节内容
第一篇 开始
第一篇详细内容
第二部 发展
第二部主要内容`
    
    const toc = parseToc(content)
    expect(toc.length).toBe(6)
    expect(toc[0].title).toBe('第一卷')
    expect(toc[1].title).toBe('上册')
    expect(toc[2].title).toBe('下册')
    expect(toc[3].title).toBe('第一篇')
    expect(toc[4].title).toBe('第二部')
  })

  it('should handle mixed structural terms', () => {
    const content = `序言
第一章 前言。介绍了背景
第二章 准备工作
第三章 实施步骤
卷一 理论基础
上册 总则
下册 分则
第四节 详细说明
第五节 补充内容
后记
结束语`
    
    const toc = parseToc(content)
    expect(toc.length).toBe(9) // Should find 9 structural elements
    const titles = toc.map(item => item.title)
    expect(titles).toContain('第一章')
    expect(titles).toContain('第二章')
    expect(titles).toContain('第三章')
    expect(titles).toContain('卷一')
    expect(titles).toContain('上册')
    expect(titles).toContain('下册')
    expect(titles).toContain('第四节')
    expect(titles).toContain('第五节')
    expect(titles).toContain('后记')
  })

  it('should not match embedded patterns', () => {
    const content = `这是一个包含章节的文档说明
这里的"第一章"是示例，不是标题
真正的第一章 标题开始
内容在这里`
    
    const toc = parseToc(content)
    expect(toc.length).toBe(1) // Should only match the real chapter, not the quoted one
    expect(toc[0].title).toBe('第一章')
  })
})