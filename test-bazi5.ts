import { Solar, Lunar } from 'lunar-typescript';
import moment from 'moment-timezone';

const birthDate = '2004-10-30';
const birthTime = '12:00';
const gender = 'male';
const timezone = 'Asia/Dhaka';

const userTime = moment.tz(`${birthDate} ${birthTime}`, 'YYYY-MM-DD HH:mm', timezone);

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
eightChar.setSect(gender === 'male' ? 1 : 2); 

const yun = eightChar.getYun(gender === 'male' ? 1 : 0, 2);

console.log('startingDate =', yun.getStartSolar().toYmd());
console.log('yun startYear (years) =', yun.getStartYear());

const daYunArr = yun.getDaYun();
const luckPillars = daYunArr
  .filter((daYun) => daYun.getGanZhi() !== '')
  .map((daYun) => ({
    age: daYun.getStartAge(),
    pillar: daYun.getGanZhi(),
  }));

console.log('luckPillars =', luckPillars);
