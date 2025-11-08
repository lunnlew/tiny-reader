// Utility function to detect and decode text with proper encoding
export function decodeTextWithDetection(buffer) {
  // First, try to detect if it's UTF-8 with BOM
  const uint8Array = new Uint8Array(buffer);
  
  // Check for UTF-8 BOM (Byte Order Mark)
  if (uint8Array.length >= 3 && 
      uint8Array[0] === 0xEF && 
      uint8Array[1] === 0xBB && 
      uint8Array[2] === 0xBF) {
    return new TextDecoder('utf-8').decode(buffer.slice(3));
  }
  
  // Try UTF-8 first
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    const decoded = utf8Decoder.decode(buffer);
    // Check if the decoded text contains replacement characters which may indicate wrong encoding
    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch (e) {
    // UTF-8 decoding failed, try other encodings
  }
  
  // Try UTF-16 (little endian with BOM)
  if (uint8Array.length >= 2 && 
      uint8Array[0] === 0xFF && 
      uint8Array[1] === 0xFE) {
    return new TextDecoder('utf-16le').decode(buffer.slice(2));
  }
  
  // Try UTF-16 (big endian with BOM)
  if (uint8Array.length >= 2 && 
      uint8Array[0] === 0xFE && 
      uint8Array[1] === 0xFF) {
    return new TextDecoder('utf-16be').decode(buffer.slice(2));
  }
  
  // Try common encodings in order of likelihood
  const encodings = ['gbk', 'gb2312', 'big5', 'shift-jis', 'utf-16le'];
  
  for (const encoding of encodings) {
    try {
      const decoder = new TextDecoder(encoding, { fatal: true });
      const decoded = decoder.decode(buffer);
      // If there are no replacement characters, it's likely correct
      if (!decoded.includes('\uFFFD')) {
        return decoded;
      }
    } catch (e) {
      // This encoding didn't work, try the next one
    }
  }
  
  // If all else fails, use UTF-8 with replacement characters for invalid sequences
  return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
}