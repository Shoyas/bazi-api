export interface IBaziRequest {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  timezone?: string;
  language?: "en" | "zh";
}

export interface ILiuNian {
  year: number;
  age: number;
  pillar: string;
}

export interface ILuckPillar {
  age: number;
  pillar: string;
  annualLuck?: ILiuNian[];
}

export interface IBaziResponseData {
  input: {
    birthDate: string;
    birthTime: string;
    gender: "male" | "female";
    timezone: string;
    language: string;
  };
  solar: {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    solarHour: number;
    solarMinute: number;
    solarDateTime: string;
    weekDay: string;
  } | null;
  lunar: {
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    leapMonth: number;
    chineseDate: string;
  } | null;
  pillars: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
  } | null;
  advancedPillars: {
    taiYuan: string;
    mingGong: string;
    shenGong: string;
  } | null;
  heavenlyStems: {
    yearStem: string;
    monthStem: string;
    dayStem: string;
    hourStem: string;
  } | null;
  earthlyBranches: {
    yearBranch: string;
    monthBranch: string;
    dayBranch: string;
    hourBranch: string;
  } | null;
  fiveElements: {
    yearElement: string;
    monthElement: string;
    dayElement: string;
    hourElement: string;
    statistics: Record<string, string>;
  } | null;
  hiddenStems: {
    yearHiddenStems: string[];
    monthHiddenStems: string[];
    dayHiddenStems: string[];
    hourHiddenStems: string[];
  } | null;
  tenGods: {
    yearTenGod: string;
    monthTenGod: string;
    dayTenGod: string;
    hourTenGod: string;
    distribution?: Record<string, string>;
  } | null;
  naYin: {
    yearNaYin: string;
    monthNaYin: string;
    dayNaYin: string;
    hourNaYin: string;
  } | null;
  zodiac: {
    chineseZodiac: string;
    animal: string;
  } | null;
  constellation: {
    westernConstellation: string;
  } | null;
  solarTerms: {
    currentSolarTerm: string | null;
    previousSolarTerm: string | null;
    nextSolarTerm: string | null;
  } | null;
  luckPillars: {
    direction: string | null;
    forward: boolean;
    startingAge: number;
    startingDate: string | null;
    pillars: ILuckPillar[];
    minorLuck: ILiuNian[];
  } | null;
  analysis: {
    dayMasterStrength: string | null;
    strongestElement: string | null;
    weakestElement: string | null;
    missingElements: string[];
    balanced: boolean | null;
    favorableElements: string[];
    unfavorableElements: string[];
    yongShen: string | null;
    voidBranch: string | null;
    twelveGrowthPhases: string[] | null;
    godsAndStars: {
      nobleman: string[] | null;
      peachBlossom: string[] | null;
      academicStar: string[] | null;
      travelHorse: string[] | null;
      generalStar: string[] | null;
    } | null;
    interactions: {
      clashes: string[];
      combinations: string[];
      punishments: string[];
      harms: string[];
    } | null;
  } | null;
  lifePredictions: {
    careerDirection: string | null;
    wealthPotential: string | null;
    healthFocus: string[];
  } | null;
  currentAnnualLuck: {
    currentYear: number;
    annualPillar: string;
    overallFortune: string;
    keyEvents: string[];
  } | null;
}
