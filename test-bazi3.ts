import { Solar } from 'lunar-typescript';

let maxYear = 0;
let maxDate = '';
let maxSolar: any = null;

for (let month = 1; month <= 12; month++) {
  for (let day = 1; day <= 28; day++) {
    const solar = Solar.fromYmdHms(2004, month, day, 12, 0, 0); 
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();
    
    // Test for female to see if it causes issues
    eightChar.setSect(2);
    const yun = eightChar.getYun(0, 2);
    
    const startYear = yun.getStartYear();
    if (startYear > maxYear) {
      maxYear = startYear;
      maxDate = solar.toYmd();
      maxSolar = yun.getStartSolar().toYmd();
    }

    // Test for male
    eightChar.setSect(1);
    const yunMale = eightChar.getYun(1, 2);
    const startYearM = yunMale.getStartYear();
    if (startYearM > maxYear) {
      maxYear = startYearM;
      maxDate = solar.toYmd();
      maxSolar = yunMale.getStartSolar().toYmd();
    }
  }
}

console.log('Max startYear:', maxYear, 'for birth date:', maxDate, 'starts at:', maxSolar);
