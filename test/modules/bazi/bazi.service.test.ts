import { describe, it, expect } from 'vitest';
import { BaziService } from '../../../src/app/modules/bazi/bazi.service';

describe('BaziService', () => {
  describe('calculateBazi', () => {
    it('should successfully calculate basic BaZi parameters', async () => {
      const payload = {
        birthDate: '2004-08-12',
        birthTime: '12:00',
        gender: 'male',
        timezone: 'Asia/Dhaka',
        language: 'en',
      };

      const result = await BaziService.calculateBazi(payload, null);
      
      expect(result.success).toBeUndefined(); // Result is the data object, success is in the controller wrapper
      expect(result.input.birthDate).toBe('2004-08-12');
      expect(result.solar.solarYear).toBe(2004);
      expect(result.lunar.lunarMonth).toBe(6);
      expect(result.heavenlyStems.yearStem).toContain('Jia');
      expect(result.earthlyBranches.yearBranch).toContain('Shen');
    });

    it('should redact advanced fields for old free users', async () => {
      const payload = {
        birthDate: '2004-08-12',
        birthTime: '12:00',
        gender: 'male',
      };

      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 20); // 20 days ago

      const mockUser = {
        id: '123',
        createdAt: oldDate,
        subscription: { plan: 'FREE' },
      };

      const result = await BaziService.calculateBazi(payload, mockUser);
      
      expect(result.luckPillars).toBeNull();
      expect(result.hiddenStems).toBeNull();
      expect(result.lifePredictions).toBeNull();
      // Basic info should still exist
      expect(result.pillars.yearPillar).toBeDefined();
    });

    it('should not redact advanced fields for new free users', async () => {
      const payload = {
        birthDate: '2004-08-12',
        birthTime: '12:00',
        gender: 'male',
      };

      const newDate = new Date();
      newDate.setDate(newDate.getDate() - 5); // 5 days ago

      const mockUser = {
        id: '123',
        createdAt: newDate,
        subscription: { plan: 'FREE' },
      };

      const result = await BaziService.calculateBazi(payload, mockUser);
      
      expect(result.luckPillars).not.toBeNull();
      expect(result.hiddenStems).not.toBeNull();
      expect(result.lifePredictions).not.toBeNull();
    });
  });
});
