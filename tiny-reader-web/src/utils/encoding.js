// GBK and GB2312 character mapping tables (simplified - in a real implementation, these would be much larger)
// These are simplified lookup tables for demo purposes
const gbkMap = new Map();
const gb2312Map = new Map();

// Helper function to detect encoding from buffer
function detectEncodingFromBuffer(buffer) {
  try {
    const uint8Array = new Uint8Array(buffer);
    
    // Check for BOM (Byte Order Mark)
    if (uint8Array.length >= 3 && uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
      console.log('Detected UTF-8 BOM');
      return 'utf-8';
    } 
    // Check for UTF-16 LE BOM
    else if (uint8Array.length >= 2 && uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) {
      console.log('Detected UTF-16 LE BOM');
      return 'utf-16le';
    }
    // Check for UTF-16 BE BOM
    else if (uint8Array.length >= 2 && uint8Array[0] === 0xFE && uint8Array[1] === 0xFF) {
      console.log('Detected UTF-16 BE BOM');
      return 'utf-16be';
    }
    // For GBK/GB2312 detection, analyze byte patterns common in Chinese text
    else {
      // Simple heuristic for Chinese encodings: check for common patterns
      let chineseByteCount = 0;
      let totalBytes = Math.min(uint8Array.length, 100); // Check first 100 bytes
      
      for (let i = 0; i < totalBytes - 1; i++) {
        const byte1 = uint8Array[i];
        const byte2 = uint8Array[i + 1];
        
        // Check for GBK/GB2312 patterns (high bytes followed by specific ranges)
        if ((byte1 >= 0x81 && byte1 <= 0xFE) && 
            ((byte2 >= 0x40 && byte2 <= 0x7E) || (byte2 >= 0x80 && byte2 <= 0xFE))) {
          chineseByteCount++;
        }
      }
      
      // If 20% or more of the checked bytes follow Chinese character patterns,
      // assume it's a Chinese encoding
      if (chineseByteCount >= Math.max(3, totalBytes * 0.2)) {
        console.log('Detected potential Chinese encoding (GBK/GB2312)');
        return 'gbk'; // Default to gbk for Chinese content
      }
      
      console.log('Using UTF-8 encoding (no specific pattern detected)');
      return 'utf-8';
    }
  } catch (err) {
    console.log('Error detecting encoding, defaulting to UTF-8');
    return 'utf-8';
  }
}

// Improved text decoding that can handle GBK/GB2312
function decodeTextWithDetection(buffer) {
  try {
    const encoding = detectEncodingFromBuffer(buffer);
    
    if (encoding === 'utf-8' || encoding === 'utf-16le' || encoding === 'utf-16be') {
      // Try the native TextDecoder for standard encodings
      try {
        const decoder = new TextDecoder(encoding);
        return decoder.decode(buffer);
      } catch (e) {
        // Fallback to UTF-8 if the specific encoding fails
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(buffer);
      }
    } 
    else if (encoding === 'gbk' || encoding === 'gb2312') {
      // For GBK/GB2312, since TextDecoder may not support these in all browsers,
      // we'll use a polyfill approach or attempt to detect support
      try {
        // Try native TextDecoder first (some browsers may support it)
        const decoder = new TextDecoder(encoding, { fatal: false });
        return decoder.decode(buffer);
      } catch (e) {
        // If native TextDecoder doesn't support GBK/GB2312, use a polyfill
        // In a real implementation, we'd want to use a proper library like iconv or jschardet
        console.warn(`${encoding} not supported by native TextDecoder, falling back to UTF-8`);
        
        // For now, fallback to UTF-8 (this will not properly decode GBK/GB2312 content)
        // In a production environment, you'd want to import and use a proper polyfill
        return attemptGBKDecode(buffer);
      }
    } 
    else {
      // Default to UTF-8 for any other encoding
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(buffer);
    }
  } catch (error) {
    console.error('Error during text decoding:', error);
    // Final fallback: try UTF-8 with error tolerance
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      return decoder.decode(buffer);
    } catch (e) {
      // If all else fails, return an empty string or handle error appropriately
      console.error('All decoding attempts failed:', e);
      return '';
    }
  }
}

// Fallback function for GBK decoding using a polyfill approach
function attemptGBKDecode(buffer) {
  // Modern browsers have started to support GBK via TextDecoder, but not all do
  // This is a fallback for when the encoding is known to be GBK but native decoder doesn't support it
  
  // Try common Chinese encodings in order of likelihood
  const encodingsToTry = ['gbk', 'gb2312', 'utf-8'];
  
  for (const enc of encodingsToTry) {
    try {
      // Check if the browser supports this encoding
      new TextDecoder(enc);
      // If we get here, the encoding is supported
      const decoder = new TextDecoder(enc, { fatal: false });
      const result = decoder.decode(buffer);
      // Verify that the result makes sense for Chinese text
      if (looksLikeChineseText(result)) {
        console.log(`Successfully decoded with ${enc}`);
        return result;
      }
    } catch (e) {
      // This encoding is not supported, continue to try the next
      continue;
    }
  }
  
  // If we still can't properly decode, we can try a more sophisticated approach
  // For now, let's return the UTF-8 fallback with error tolerance
  console.warn('GBK/GB2312 encoding not supported by TextDecoder, using UTF-8 with error tolerance');
  const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
  return utf8Decoder.decode(buffer);
}

// Simple heuristic to check if text looks like Chinese
function looksLikeChineseText(text) {
  // Count Chinese characters (Unicode range for CJK)
  const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
  const totalChars = text.length;
  
  // If at least 10% of characters are Chinese, consider it likely Chinese text
  return totalChars > 0 && (chineseChars.length / totalChars) >= 0.1;
}

export { decodeTextWithDetection, detectEncodingFromBuffer };