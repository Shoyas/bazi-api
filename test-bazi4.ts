import { Solar } from 'lunar-typescript';

const solar = Solar.fromYmdHms(2004, 10, 30, 12, 0, 0); 
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();
eightChar.setSect(1); // male
const yun = eightChar.getYun(1, 2);

console.log('yun.getStartYear() =', yun.getStartYear());
console.log('yun.getStartMonth() =', yun.getStartMonth());
console.log('yun.getStartDay() =', yun.getStartDay());
console.log('yun.getStartSolar().toYmd() =', yun.getStartSolar().toYmd());

const daYunArr = yun.getDaYun();
const testDaYun = daYunArr.map(d => ({
  startAge: d.getStartAge(),
  startYear: d.getStartYear(),
  ganZhi: d.getGanZhi()
}));
console.log('daYunArr =', testDaYun);
