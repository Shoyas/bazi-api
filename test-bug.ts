import { Solar } from 'lunar-typescript';

for (let month = 1; month <= 12; month++) {
  for (let day = 1; day <= 28; day++) {
    for (let hour = 0; hour < 24; hour += 2) {
      const solar = Solar.fromYmdHms(2004, month, day, hour, 0, 0); 
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();
      
      const yun1 = eightChar.getYun(1, 1);
      const yun2 = eightChar.getYun(1, 2);
      
      if (yun1.getStartYear() > 10 || yun2.getStartYear() > 10) {
         console.log('BUG FOUND:', solar.toYmdHms(), 'sect1:', yun1.getStartYear(), 'sect2:', yun2.getStartYear());
      }
    }
  }
}
console.log('Test completed.');
