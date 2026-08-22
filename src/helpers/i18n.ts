import fs from 'fs';
import path from 'path';

const localesDir = path.join(__dirname, '..', 'locales');
const dictionaries: Record<string, Record<string, string>> = {};

// Load all json files in locales directory
try {
  if (fs.existsSync(localesDir)) {
    const files = fs.readdirSync(localesDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const lang = file.replace('.json', '');
        const content = fs.readFileSync(path.join(localesDir, file), 'utf-8');
        dictionaries[lang] = JSON.parse(content);
      }
    }
  }
} catch (error) {
  console.error('Error loading locales:', error);
}

export const translate = (text: string | null | undefined, lang: string): string => {
  if (!text) return '';
  if (lang === 'zh' || lang === 'chs' || lang === 'zh-CN') return text; // Default lunar-typescript output is Chinese
  
  const dict = dictionaries[lang] || dictionaries['en']; // Fallback to English
  if (!dict) return text;

  // We can do exact match or word by word replace. For BaZi, exact match or char by char is often needed.
  // We will do a simple string replace for all known keys.
  // Note: for production, a more robust token-based replacement is better.
  let translated = text;
  
  // Sort keys by length descending to replace longer phrases first
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (translated.includes(key)) {
      translated = translated.split(key).join(dict[key]);
    }
  }

  return translated;
};

export const translateObject = (obj: any, lang: string): any => {
  if (lang === 'zh' || lang === 'chs') return obj;
  if (!obj) return obj;

  if (typeof obj === 'string') {
    return translate(obj, lang);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => translateObject(item, lang));
  }

  if (typeof obj === 'object') {
    const translatedObj: any = {};
    for (const key in obj) {
      const translatedKey = typeof key === 'string' ? translate(key, lang) : key;
      translatedObj[translatedKey] = translateObject(obj[key], lang);
    }
    return translatedObj;
  }

  return obj;
};
