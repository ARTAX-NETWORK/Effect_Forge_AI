import { Buffer } from 'buffer';

export interface ParsedContent {
  content: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    encoding: string;
    language?: string;
  };
}

class FileParserService {
  async parseFile(file: Express.Multer.File): Promise<string> {
    try {
      switch (file.mimetype) {
        case 'text/plain':
          return this.parseTxt(file.buffer);
        
        case 'text/markdown':
          return this.parseMarkdown(file.buffer);
        
        case 'application/json':
          return this.parseJson(file.buffer);
        
        case 'text/csv':
          return this.parseCsv(file.buffer);
        
        case 'application/pdf':
          return this.parsePdf(file.buffer);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return this.parseDocx(file.buffer);
        
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return this.parseXlsx(file.buffer);
        
        case 'application/rtf':
          return this.parseRtf(file.buffer);
        
        case 'application/xml':
        case 'text/xml':
          return this.parseXml(file.buffer);
        
        default:
          throw new Error(`Unsupported file type: ${file.mimetype}`);
      }
    } catch (error) {
      throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseTxt(buffer: Buffer): string {
    // Detect encoding and convert to string
    const content = this.detectAndConvertEncoding(buffer);
    return this.cleanText(content);
  }

  private parseMarkdown(buffer: Buffer): string {
    const content = this.detectAndConvertEncoding(buffer);
    
    // Remove markdown syntax but preserve structure
    return content
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // Remove code blocks
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .trim();
  }

  private parseJson(buffer: Buffer): string {
    try {
      const content = this.detectAndConvertEncoding(buffer);
      const jsonData = JSON.parse(content);
      
      // Extract meaningful text from JSON structure
      return this.extractTextFromObject(jsonData);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  private parseCsv(buffer: Buffer): string {
    const content = this.detectAndConvertEncoding(buffer);
    const lines = content.split('\n');
    
    // Extract text content from CSV, focusing on text columns
    return lines
      .map(line => {
        const columns = this.parseCsvLine(line);
        return columns.filter(col => this.isTextColumn(col)).join(' ');
      })
      .filter(line => line.trim())
      .join('\n');
  }

  private parsePdf(buffer: Buffer): string {
    // Simplified PDF text extraction
    // In a real implementation, you'd use a library like pdf-parse
    const content = buffer.toString('binary');
    
    // Basic PDF text extraction using regex patterns
    const textMatches = content.match(/\((.*?)\)/g);
    if (textMatches) {
      return textMatches
        .map(match => match.slice(1, -1)) // Remove parentheses
        .filter(text => text.length > 2)
        .join(' ');
    }
    
    return 'PDF content extraction not fully supported';
  }

  private parseDocx(buffer: Buffer): string {
    // Simplified DOCX parsing
    // In a real implementation, you'd use a library like mammoth or docx-parser
    
    try {
      // DOCX files are ZIP archives containing XML files
      // This is a basic implementation that extracts text from the document.xml
      const content = buffer.toString('binary');
      
      // Look for text content patterns in DOCX XML structure
      const textMatches = content.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (textMatches) {
        return textMatches
          .map(match => match.replace(/<[^>]*>/g, '')) // Strip XML tags
          .join(' ')
          .trim();
      }
      
      return 'DOCX content extraction requires additional processing';
    } catch (error) {
      throw new Error('Failed to parse DOCX file');
    }
  }

  private parseXlsx(buffer: Buffer): string {
    // Simplified XLSX parsing
    // In a real implementation, you'd use a library like xlsx or exceljs
    
    try {
      const content = buffer.toString('binary');
      
      // Look for shared strings and cell values
      const textMatches = content.match(/<t[^>]*>(.*?)<\/t>/g);
      if (textMatches) {
        return textMatches
          .map(match => match.replace(/<[^>]*>/g, ''))
          .filter(text => text && text.trim().length > 0)
          .join(' ');
      }
      
      return 'XLSX content extraction requires additional processing';
    } catch (error) {
      throw new Error('Failed to parse XLSX file');
    }
  }

  private parseRtf(buffer: Buffer): string {
    const content = this.detectAndConvertEncoding(buffer);
    
    // Remove RTF control codes and extract plain text
    return content
      .replace(/\\[a-z]+\d*\s?/g, ' ') // Remove RTF commands
      .replace(/[{}]/g, '') // Remove braces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private parseXml(buffer: Buffer): string {
    const content = this.detectAndConvertEncoding(buffer);
    
    // Extract text content from XML, removing tags
    return content
      .replace(/<[^>]*>/g, ' ') // Remove all XML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private detectAndConvertEncoding(buffer: Buffer): string {
    // Simple encoding detection and conversion
    const content = buffer.toString('utf8');
    
    // Check for BOM markers
    if (content.startsWith('\uFEFF')) {
      return content.slice(1); // Remove UTF-8 BOM
    }
    
    // Check for common encoding issues and attempt to fix
    if (content.includes('�')) {
      // Try latin1 encoding if UTF-8 fails
      return buffer.toString('latin1');
    }
    
    return content;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .replace(/\t/g, ' ') // Convert tabs to spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private extractTextFromObject(obj: any, depth = 0): string {
    if (depth > 10) return ''; // Prevent infinite recursion
    
    const texts: string[] = [];
    
    if (typeof obj === 'string') {
      return obj;
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return String(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.extractTextFromObject(item, depth + 1)).join(' ');
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.length > 2) {
          texts.push(value);
        } else if (typeof value === 'object') {
          const nestedText = this.extractTextFromObject(value, depth + 1);
          if (nestedText) texts.push(nestedText);
        }
      }
    }
    
    return texts.join(' ');
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private isTextColumn(value: string): boolean {
    // Check if a CSV column contains meaningful text (not just numbers or short codes)
    if (!value || value.length < 3) return false;
    
    // Skip if it's just a number
    if (!isNaN(Number(value))) return false;
    
    // Skip if it's just a date
    if (/^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$/.test(value)) return false;
    
    // Skip if it's just an ID or code
    if (/^[A-Z0-9_-]+$/i.test(value) && value.length < 10) return false;
    
    return true;
  }

  async getFileInfo(file: Express.Multer.File): Promise<ParsedContent['metadata']> {
    const content = await this.parseFile(file);
    
    return {
      wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
      characterCount: content.length,
      encoding: 'UTF-8',
      language: this.detectLanguage(content),
    };
  }

  private detectLanguage(content: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const frenchWords = ['le', 'la', 'les', 'et', 'ou', 'mais', 'dans', 'sur', 'à', 'pour', 'de', 'avec'];
    
    const words = content.toLowerCase().split(/\s+/).slice(0, 100); // Check first 100 words
    
    const englishMatches = words.filter(word => englishWords.includes(word)).length;
    const frenchMatches = words.filter(word => frenchWords.includes(word)).length;
    
    if (englishMatches > frenchMatches) return 'en';
    if (frenchMatches > englishMatches) return 'fr';
    
    return 'unknown';
  }
}

export const fileParser = new FileParserService();
