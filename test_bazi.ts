import { BaziService } from './src/app/modules/bazi/bazi.service';

async function run() {
  try {
    const res = await BaziService.calculateBazi({
      birthDate: '1998-08-12',
      birthTime: '',
      gender: 'male',
      timezone: 'Asia/Dhaka',
      language: 'en'
    });
    console.log(res.solarTerms);
    console.log(res.input);
  } catch (e) {
    console.error(e.message);
  }
}
run();
