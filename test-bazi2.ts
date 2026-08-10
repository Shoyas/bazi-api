import { Solar } from 'lunar-typescript';

const solar = Solar.fromYmdHms(2004, 1, 15, 12, 0, 0); 
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();
eightChar.setSect(1); // Male
console.log('gender parameter in getYun: male=1, female=0');
const yun = eightChar.getYun(1, 2);
console.log('male (1, 2)', yun.getStartYear());

const yunFemale = eightChar.getYun(0, 2);
console.log('female (0, 2)', yunFemale.getStartYear());

const yunMaleSect1 = eightChar.getYun(1, 1);
console.log('male (1, 1)', yunMaleSect1.getStartYear());

const yun2 = eightChar.getYun(1);
console.log('male (1)', yun2.getStartYear());
