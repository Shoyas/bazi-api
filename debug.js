"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lunar_typescript_1 = require("lunar-typescript");
lunar_typescript_1.I18n.setLanguage('chs');
console.log("Language after setting chs:", lunar_typescript_1.I18n.getLanguage());
const solar = lunar_typescript_1.Solar.fromYmdHms(1998, 8, 12, 10, 30, 0);
console.log("Year Pillar:", solar.getLunar().getEightChar().getYear());
