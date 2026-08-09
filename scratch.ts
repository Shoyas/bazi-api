import { Solar, I18n } from 'lunar-typescript';

const solar = Solar.fromYmdHms(1994, 12, 1, 0, 0, 0);

console.log('Default language:');
console.log('Week:', solar.getWeek());
console.log('WeekInChinese:', solar.getWeekInChinese());

I18n.setLanguage('en');
console.log('English language:');
console.log('Week:', solar.getWeek());
console.log('WeekInChinese:', solar.getWeekInChinese());
