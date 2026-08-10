import { Solar } from 'lunar-typescript';

for (let month = 1; month <= 12; month++) {
  // Check days 29, 30, 31
  for (let day = 29; day <= 31; day++) {
    for (let hour = 0; hour < 24; hour += 2) {
      try {
        const solar = Solar.fromYmdHms(2004, month, day, hour, 0, 0); 
        // if invalid date, solar might be invalid but lunar-typescript handles it or throws
        if (!solar || solar.getYear() !== 2004) continue;
        
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();
        
        eightChar.setSect(1); // male
        let yun1 = eightChar.getYun(1, 1);
        let yun2 = eightChar.getYun(1, 2);
        if (yun1.getStartYear() > 10 || yun2.getStartYear() > 10) {
           console.log('BUG MALE:', solar.toYmdHms(), yun2.getStartYear());
        }

        eightChar.setSect(2); // female
        yun1 = eightChar.getYun(0, 1);
        yun2 = eightChar.getYun(0, 2);
        if (yun1.getStartYear() > 10 || yun2.getStartYear() > 10) {
           console.log('BUG FEMALE:', solar.toYmdHms(), yun2.getStartYear());
        }
      } catch (e) {}
    }
  }
}
console.log('Test completed for days 29-31.');
