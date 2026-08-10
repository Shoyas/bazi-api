import { Solar } from 'lunar-typescript';
const solar = Solar.fromYmdHms(2004, 1, 1, 12, 0, 0);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();
eightChar.setSect(1);
const yun = eightChar.getYun(1);
console.log('getStartAge:', yun.getStartAge());
console.log('getStartYear:', yun.getStartYear());
console.log('getStartSolar:', yun.getStartSolar().toYmd());
