const { Lunar, I18n } = require('lunar-typescript');
I18n.setLanguage('en');
const lunar = Lunar.fromDate(new Date());
const eightChar = lunar.getEightChar();
console.log('EN:', eightChar.getYearGan(), eightChar.getYearZhi(), eightChar.getYearWuXing());
I18n.setLanguage('chs');
console.log('CHS:', eightChar.getYearGan(), eightChar.getYearZhi(), eightChar.getYearWuXing());
