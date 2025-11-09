import { create } from 'zustand';
import { decodeTextWithDetection } from '../utils/encoding';

// Constants for IndexedDB
const DB_NAME = 'readerDB';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'cachedFiles';

// Create the reader store
export const useReaderStore = create((set, get) => ({
  currentChapterContent: '',
  toc: [],
  isLoading: false,
  currentChapterIndex: 0,
  fileRef: null,
  hasCachedFile: false,
  showLargeFileNotification: false,
  wasAutoScrollPausedBySettings: false,
  isDragOver: false,

  initDB: async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          const store = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
          store.createIndex('fileId', 'fileId', { unique: true });
        }
      };
    });
  },

  saveToIndexedDB: async (fileId, data) => {
    const db = await get().initDB();
    const tx = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    await store.put({ id: fileId, ...data, timestamp: Date.now() });
    return tx.complete;
  },

  loadFromIndexedDB: async (fileId) => {
    const db = await get().initDB();
    const tx = db.transaction([OBJECT_STORE_NAME], 'readonly');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.get(fileId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  deleteFromIndexedDB: async (fileId) => {
    const db = await get().initDB();
    const tx = db.transaction([OBJECT_STORE_NAME], 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    store.delete(fileId);
    return tx.complete;
  },

  generateFileId: (file) => {
    return `${file.name}_${file.size}_${file.lastModified}`;
  },

  extractChapterPositions: (fullContent, toc) => {
    const positions = [];

    for (let i = 0; i < toc.length; i++) {
      const chapter = toc[i];

      // Find the exact position of the chapter title in the content
      let start = fullContent.indexOf(chapter.title, chapter.offset || 0);
      // If not found at expected position, try to find it from the beginning
      if (start === -1) {
        start = fullContent.indexOf(chapter.title);
      }
      // If still not found, use the original offset
      if (start === -1) {
        start = chapter.offset || 0;
      }

      let end;
      if (i < toc.length - 1) {
        // Find the start of the next chapter to determine the end position
        let nextStart = fullContent.indexOf(toc[i + 1].title, start + chapter.title.length);
        // If not found, try to find it from the beginning
        if (nextStart === -1) {
          nextStart = fullContent.indexOf(toc[i + 1].title);
        }

        // If still not found, use the full content length
        end = nextStart !== -1 ? nextStart : fullContent.length;
      } else {
        end = fullContent.length;
      }

      positions.push({ index: i, start, end, title: chapter.title });
    }

    return positions;
  },

  loadFromCache: async () => {
    const fileId = localStorage.getItem('CACHED_FILE_ID_KEY');
    const tocJson = localStorage.getItem('CACHED_TOC_KEY');
    const index = Number(localStorage.getItem('CACHED_CHAPTER_INDEX_KEY') || 0);

    let toc = [];
    if (tocJson) {
      toc = JSON.parse(tocJson);
      set({ toc });
    }
    
    set({ currentChapterIndex: index });

    if (fileId) {
      const cachedData = await get().loadFromIndexedDB(fileId);
      if (
        cachedData &&
        cachedData.fullContent &&
        Array.isArray(cachedData.chapterPositions) &&
        Array.isArray(cachedData.toc)
      ) {
        set({ hasCachedFile: true });
        // 使用缓存初始化章节内容
        const pos = cachedData.chapterPositions[index];
        if (pos) {
          set({ currentChapterContent: cachedData.fullContent.slice(pos.start, pos.end) });
        } else if (toc.length > 0) {
          // 如果没有缓存的章节位置但有目录，则加载第一章
          await get().loadChapter(index);
        }
        console.log('[reader] Cache fully loaded from IndexedDB:', fileId);
      } else {
        console.warn('[reader] IndexedDB cache invalid or missing full content');
      }
    } else if (toc.length > 0 && index < toc.length) {
      // 如果没有缓存但有目录，则加载对应章节
      await get().loadChapter(index);
    }

    console.log('[reader] loadFromCache done', {
      tocLength: toc.length,
      currentChapterIndex: index,
      hasCachedFile: get().hasCachedFile,
    });
  },

  saveToCache: () => {
    localStorage.setItem('CACHED_TOC_KEY', JSON.stringify(get().toc));
    localStorage.setItem('CACHED_CHAPTER_INDEX_KEY', String(get().currentChapterIndex));
  },

  clearCache: async () => {
    const fileId = localStorage.getItem('CACHED_FILE_ID_KEY');
    if (fileId) await get().deleteFromIndexedDB(fileId);
    localStorage.removeItem('CACHED_TOC_KEY');
    localStorage.removeItem('CACHED_CHAPTER_INDEX_KEY');
    localStorage.removeItem('CACHED_FILE_ID_KEY');
    set({ hasCachedFile: false });
  },

  loadChapterFromCache: async (index) => {
    const fileId = localStorage.getItem('CACHED_FILE_ID_KEY');
    if (!fileId) return false;
    const cachedData = await get().loadFromIndexedDB(fileId);
    if (!cachedData || !cachedData.fullContent) return false;

    const pos = cachedData.chapterPositions[index];
    if (!pos) return false;

    set({ 
      currentChapterContent: cachedData.fullContent.slice(pos.start, pos.end),
      currentChapterIndex: index 
    });
    get().saveToCache();
    return true;
  },

  loadChapter: async (index) => {
    if (get().hasCachedFile && !get().fileRef) {
      const ok = await get().loadChapterFromCache(index);
      if (ok) return;
      console.warn('[reader] Cached file missing or broken');
    }
    if (!get().fileRef) {
      alert('请先加载原始文件');
      return;
    }
    await get().loadChapterFromFile(index);
  },

  loadChapterFromFile: async (index) => {
    // First check if we have cached chapter positions for more accurate slicing
    const fileId = localStorage.getItem('CACHED_FILE_ID_KEY');
    if (fileId && get().hasCachedFile) {
      const cachedData = await get().loadFromIndexedDB(fileId);
      if (cachedData && cachedData.chapterPositions && cachedData.chapterPositions[index]) {
        const pos = cachedData.chapterPositions[index];
        // Use cached chapter positions for more accurate content extraction
        set({ 
          currentChapterContent: cachedData.fullContent.slice(pos.start, pos.end),
          currentChapterIndex: index 
        });
        get().saveToCache();
        return;
      }
    }

    // Fallback to the original method if no cached positions are available
    const toc = get().toc;
    if (!toc.length || !get().fileRef) return;
    const start = toc[index].offset;
    const end = index < toc.length - 1 ? toc[index + 1].offset : get().fileRef.size;
    const slice = get().fileRef.slice(start, end);
    const buf = await slice.arrayBuffer();
    const text = decodeTextWithDetection(buf);
    set({ 
      currentChapterContent: text,
      currentChapterIndex: index 
    });
    get().saveToCache();
  },

  processFile: async (file) => {
    set({ isLoading: true });
    set({ fileRef: file });
    await get().clearCache();

    const fileId = get().generateFileId(file);
    localStorage.setItem('CACHED_FILE_ID_KEY', fileId);

    // 解析 TOC
    const toc = await get().parseTocFromFile(file);
    set({ toc });

    const fullContent = await get().readFullFileContent(file);
    const chapterPositions = get().extractChapterPositions(fullContent, toc);

    await get().saveToIndexedDB(fileId, {
      fileId,
      fullContent,
      toc: JSON.parse(JSON.stringify(toc)),
      chapterPositions,
      currentChapterIndex: 0,
    });

    set({ 
      hasCachedFile: true,
      currentChapterIndex: 0 
    });
    get().saveToCache();

    // 加载第一章内容而不是首屏内容
    if (toc.length > 0) {
      await get().loadChapter(0);
    } else {
      // 如果没有找到章节，加载前512KB内容
      const firstChunk = file.slice(0, 512 * 1024);
      const buf = await firstChunk.arrayBuffer();
      set({ currentChapterContent: decodeTextWithDetection(buf) });
    }

    set({ isLoading: false });
    console.log('[reader] File processed successfully');
  },

  readFullFileContent: async (file) => {
    const buf = await file.arrayBuffer();
    return decodeTextWithDetection(buf);
  },

  parseTocFromFile: async (file) => {
    // Read the entire file content to get accurate positions
    const fullContent = await get().readFullFileContent(file);
    const toc = [];

    // Split content into lines to properly match chapter titles only at the beginning of lines
    const lines = fullContent.split(/\r?\n/);
    let contentIndex = 0; // Track the actual index in the full content

    // Updated regex to include more Chinese structural terms: 部、集、卷、章、回、节、册、篇、目
    // Capture both "第X[结构词]" and specific patterns like "卷X", "上册", "下册", etc.
    // Use alternation with specific ordering to avoid overlapping matches
    const regex = /(第[一二三四五六七八九十百千万零\d]+[部集卷章回节册篇目]|(卷|册|篇)[一二三四五六七八九十百千万零\d\s、\-.：:-]+章?|上[册卷]|下[册卷]|[上下]篇|Chapter\s+\d+|番外[一二三四五六七八九十百千万零\d\s]*篇?|外传|后记|尾声|终章|楔子|序章|引子)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line starts with whitespace followed by chapter title
      const match = regex.exec(line);

      if (match) {
        // Only match if the pattern occurs at the beginning of the line or after leading whitespace
        const leadingWhitespaceMatch = line.match(/^\s*/); // Match leading whitespace
        const leadingWhitespaceLength = leadingWhitespaceMatch ? leadingWhitespaceMatch[0].length : 0;
        const patternIndex = match.index;

        // The pattern should be at the start of the trimmed line (after leading whitespace)
        if (patternIndex === leadingWhitespaceLength) {
          // Only extract from the current line, not beyond
          const start = contentIndex + patternIndex; // Start from the match position
          // Consider only the rest of the current line for the title
          const restOfLine = line.substring(patternIndex).trim();

          // Find end of title within the current line
          let chapterTitle = match[0];
          const punctMatches = [...restOfLine.matchAll(/[。！？.!?]/g)];
          let titleEndIndex = restOfLine.length;

          // Find a reasonable end for the title (punctuation)
          if (punctMatches.length > 0) {
            const punctIndex = punctMatches[0].index;
            if (punctIndex > match[0].length) { // Make sure we're not cutting the title too early
              titleEndIndex = punctIndex + 1;
            }
          }

          chapterTitle = restOfLine.substring(0, titleEndIndex).trim();

          // Avoid adding duplicate titles or very short titles that might be false positives
          if (chapterTitle.length > match[0].length && !toc.some(item => item.title === chapterTitle)) {
            toc.push({ title: chapterTitle, offset: start });
          } else if (chapterTitle.length === match[0].length) {
            // If the title is just the matched pattern, add it anyway (basic case)
            toc.push({ title: chapterTitle, offset: start });
          }
        }
      }

      // Update content index for the next line (including the line break)
      contentIndex += line.length;
      if (i < lines.length - 1) { // Add newline character except for the last line
        contentIndex += 1;
      }
    }

    console.log('[reader] TOC parsed:', toc.length);
    return toc;
  },

  // Action to update drag over state
  setDragOver: (isDragOver) => set({ isDragOver }),
  
  // Action to update loading state
  setIsLoading: (isLoading) => set({ isLoading }),
}));