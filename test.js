const { Solar } = require('lunar-typescript');
const fs = require('fs');

try {
  const solar = Solar.fromYmdHms(2004, 10, 30, 10, 30, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(1); // male
  const yun = eightChar.getYun(1); // male
  const result = {
    startYear: yun.getStartYear(),
    startSolar: yun.getStartSolar().toYmd(),
    forward: yun.isForward()
  };
  fs.writeFileSync('test_output.json', JSON.stringify(result));
} catch (e) {
  fs.writeFileSync('test_output.json', JSON.stringify({error: e.message}));
}
