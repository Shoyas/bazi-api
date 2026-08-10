import { Solar } from 'lunar-typescript';
import moment from 'moment-timezone';

const userTime = moment.tz('2004-10-30 10:30', 'YYYY-MM-DD HH:mm', 'Asia/Dhaka');
const solar = Solar.fromYmdHms(
  userTime.year(),
  userTime.month() + 1,
  userTime.date(),
  userTime.hour(),
  userTime.minute(),
  userTime.second()
);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();
eightChar.setSect(1); // male
const yun = eightChar.getYun(1, 2);

console.log('yun.getStartSolar().toYmd() =', yun.getStartSolar().toYmd());
console.log('luckPillars[0].age =', yun.getDaYun().filter(d => d.getGanZhi() !== '')[0].getStartAge());
