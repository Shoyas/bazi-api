import { BaziService } from './src/app/modules/bazi/bazi.service';

const test = async () => {
  const result = await BaziService.calculateBazi({
    birthDate: '2004-08-12',
    birthTime: '12:00',
    gender: 'male',
    timezone: 'Asia/Dhaka',
    language: 'en'
  });
  console.log(JSON.stringify(result.advancedPillars, null, 2));
  console.log('Minor Luck Length:', result.luckPillars?.minorLuck.length);
  console.log('Annual Luck Length (first major):', result.luckPillars?.pillars[0].annualLuck?.length);
};

test();
