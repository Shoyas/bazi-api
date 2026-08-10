import { Solar } from 'lunar-typescript';

const solar = Solar.fromYmdHms(2004, 8, 12, 12, 0, 0);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();
eightChar.setSect(1); // male
const yun = eightChar.getYun(1, 1);

console.log('TaiYuan:', eightChar.getTaiYuan());
console.log('MingGong:', eightChar.getMingGong());
console.log('ShenGong:', eightChar.getShenGong());

const daYunArr = yun.getDaYun();
const firstDaYun = daYunArr[0];
const firstMajorDaYun = daYunArr[1]; // Index 1 is usually the first major

if (firstMajorDaYun) {
  const liuNian = firstMajorDaYun.getLiuNian();
  console.log('First Major DaYun LiuNian length:', liuNian.length);
  if (liuNian.length > 0) {
    console.log('LiuNian[0]:', liuNian[0].getYear(), liuNian[0].getAge(), liuNian[0].getGanZhi());
  }
}

if (firstDaYun) {
  const xiaoYun = firstDaYun.getXiaoYun();
  console.log('XiaoYun length:', xiaoYun.length);
  if (xiaoYun.length > 0) {
    console.log('XiaoYun[0]:', xiaoYun[0].getYear(), xiaoYun[0].getAge(), xiaoYun[0].getGanZhi());
  }
}

// Any YongShen or lucky direction?
console.log('Available eightChar methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar)).filter(m => m.includes('Yong') || m.includes('Dir') || m.includes('Color')));
