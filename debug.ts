import { I18n, Solar } from 'lunar-typescript';

I18n.setLanguage('chs');
console.log("Language after setting chs:", I18n.getLanguage());

const solar = Solar.fromYmdHms(1998, 8, 12, 10, 30, 0);
console.log("Year Pillar:", solar.getLunar().getEightChar().getYear());
