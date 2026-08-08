"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateObject = exports.translate = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const localesDir = path_1.default.join(__dirname, '..', 'locales');
const dictionaries = {};
// Load all json files in locales directory
try {
    if (fs_1.default.existsSync(localesDir)) {
        const files = fs_1.default.readdirSync(localesDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const lang = file.replace('.json', '');
                const content = fs_1.default.readFileSync(path_1.default.join(localesDir, file), 'utf-8');
                dictionaries[lang] = JSON.parse(content);
            }
        }
    }
}
catch (error) {
    console.error('Error loading locales:', error);
}
const translate = (text, lang) => {
    if (!text)
        return '';
    if (lang === 'zh' || lang === 'chs' || lang === 'zh-CN')
        return text; // Default lunar-typescript output is Chinese
    const dict = dictionaries[lang] || dictionaries['en']; // Fallback to English
    if (!dict)
        return text;
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
exports.translate = translate;
const translateObject = (obj, lang) => {
    if (lang === 'zh' || lang === 'chs')
        return obj;
    if (!obj)
        return obj;
    if (typeof obj === 'string') {
        return (0, exports.translate)(obj, lang);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => (0, exports.translateObject)(item, lang));
    }
    if (typeof obj === 'object') {
        const translatedObj = {};
        for (const key in obj) {
            translatedObj[key] = (0, exports.translateObject)(obj[key], lang);
        }
        return translatedObj;
    }
    return obj;
};
exports.translateObject = translateObject;
