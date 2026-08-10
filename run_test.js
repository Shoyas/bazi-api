const { Solar } = require('lunar-typescript');
const fs = require('fs');

try {
  const solar = Solar.fromYmdHms(2004, 10, 30, 10, 30, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(1); // male
  const yun = eightChar.getYun(1); // male
  const daYunArr = yun.getDaYun();
  
  const result = {
    startYear: yun.getStartYear(),
    startAge: yun.getStartAge ? yun.getStartAge() : 'not exist',
    startSolarYear: yun.getStartSolar().getYear(),
    firstDaYunStartAge: daYunArr[0] ? daYunArr[0].getStartAge() : null,
    firstDaYunStartYear: daYunArr[0] ? daYunArr[0].getStartYear() : null,
    secondDaYunStartAge: daYunArr[1] ? daYunArr[1].getStartAge() : null,
    secondDaYunStartYear: daYunArr[1] ? daYunArr[1].getStartYear() : null,
  };
  fs.writeFileSync('bazi_test_out.json', JSON.stringify(result, null, 2));
} catch (e) {
  fs.writeFileSync('bazi_test_out.json', JSON.stringify({error: e.message}));
}
