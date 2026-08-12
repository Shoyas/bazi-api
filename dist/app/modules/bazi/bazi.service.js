"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaziService = void 0;
const lunar_typescript_1 = require("lunar-typescript");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const AppError_1 = require("../../../errors/AppError");
const i18n_1 = require("../../../helpers/i18n");
const bazi_advanced_1 = require("./bazi.advanced");
const calculateBazi = async (payload, user = null) => {
    const { birthDate, birthTime, gender, timezone = 'Asia/Shanghai', language = 'en' } = payload;
    // 1. Validate and convert timezone
    let userTime;
    let adjustedBirthTime = birthTime;
    if (!birthTime || birthTime === '' || birthTime === '00' || birthTime === '00:00') {
        adjustedBirthTime = '12:00';
    }
    try {
        userTime = moment_timezone_1.default.tz(`${birthDate} ${adjustedBirthTime}`, 'YYYY-MM-DD HH:mm', timezone);
        if (!userTime.isValid()) {
            throw new AppError_1.AppError(400, 'Invalid birth date or time');
        }
    }
    catch (error) {
        throw new AppError_1.AppError(400, 'Invalid timezone or time format');
    }
    // 2. Create Solar Object
    const solar = lunar_typescript_1.Solar.fromYmdHms(userTime.year(), userTime.month() + 1, userTime.date(), userTime.hour(), userTime.minute(), userTime.second());
    // 3. Create Lunar Object
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();
    // Set gender (1 for male, 2 for female)
    eightChar.setSect(gender === 'male' ? 1 : 2);
    // ==========================================
    // PHASE 1: INTERNAL CALCULATIONS (FORCE CHINESE)
    // ==========================================
    // We must calculate stats & stars using Chinese characters to ensure the mapping works
    lunar_typescript_1.I18n.setLanguage('chs');
    // Calculate WuXing (Five Elements) Stats in Chinese
    const rawWuXingStats = {
        Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0,
    };
    const mapWuXing = (wx) => {
        if (wx.includes('木'))
            rawWuXingStats.Wood += wx.split('木').length - 1;
        if (wx.includes('火'))
            rawWuXingStats.Fire += wx.split('火').length - 1;
        if (wx.includes('土'))
            rawWuXingStats.Earth += wx.split('土').length - 1;
        if (wx.includes('金'))
            rawWuXingStats.Metal += wx.split('金').length - 1;
        if (wx.includes('水'))
            rawWuXingStats.Water += wx.split('水').length - 1;
    };
    [eightChar.getYearWuXing(), eightChar.getMonthWuXing(), eightChar.getDayWuXing(), eightChar.getTimeWuXing()].forEach(mapWuXing);
    const totalElements = Object.values(rawWuXingStats).reduce((sum, val) => sum + val, 0);
    const wuXingStats = {};
    for (const key in rawWuXingStats) {
        wuXingStats[key] = totalElements > 0 ? Math.round((rawWuXingStats[key] / totalElements) * 100) + '%' : '0%';
    }
    // Ten Gods Distribution Percentage in Chinese
    const allTenGods = [
        eightChar.getYearShiShenGan(), eightChar.getMonthShiShenGan(), eightChar.getDayShiShenGan(), eightChar.getTimeShiShenGan(),
        ...eightChar.getYearShiShenZhi(), ...eightChar.getMonthShiShenZhi(), ...eightChar.getDayShiShenZhi(), ...eightChar.getTimeShiShenZhi()
    ].filter(g => g && g !== '日主' && g !== '同类' && g !== '异类');
    const tenGodsCount = {};
    allTenGods.forEach(god => {
        tenGodsCount[god] = (tenGodsCount[god] || 0) + 1;
    });
    const totalTenGods = allTenGods.length;
    const tenGodsDistribution = {};
    for (const god in tenGodsCount) {
        tenGodsDistribution[god] = totalTenGods > 0 ? Math.round((tenGodsCount[god] / totalTenGods) * 100) + '%' : '0%';
    }
    // Shen Sha (Gods & Stars) Calculations in Chinese
    const dayGan = eightChar.getDayGan();
    const yearGan = eightChar.getYearGan();
    const dayZhi = eightChar.getDayZhi();
    const yearZhi = eightChar.getYearZhi();
    const allZhi = [eightChar.getYearZhi(), eightChar.getMonthZhi(), eightChar.getDayZhi(), eightChar.getTimeZhi()];
    // Gods and Stars targets mapped to English
    const zhiEnMap = {
        '子': 'Zi (Rat)', '丑': 'Chou (Ox)', '寅': 'Yin (Tiger)', '卯': 'Mao (Rabbit)',
        '辰': 'Chen (Dragon)', '巳': 'Si (Snake)', '午': 'Wu (Horse)', '未': 'Wei (Goat)',
        '申': 'Shen (Monkey)', '酉': 'You (Rooster)', '戌': 'Xu (Dog)', '亥': 'Hai (Pig)'
    };
    // Nobleman (天乙贵人)
    const noblemanMap = {
        '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
        '乙': ['子', '申'], '己': ['子', '申'],
        '丙': ['亥', '酉'], '丁': ['亥', '酉'],
        '壬': ['卯', '巳'], '癸': ['卯', '巳'],
        '辛': ['寅', '午']
    };
    const noblemanTargets = [...new Set([...(noblemanMap[dayGan] || []), ...(noblemanMap[yearGan] || [])])];
    const noblemanStar = noblemanTargets.length > 0 ? noblemanTargets.map(z => zhiEnMap[z]) : null;
    // Peach Blossom (桃花)
    const peachMap = {
        '申': '酉', '子': '酉', '辰': '酉',
        '亥': '子', '卯': '子', '未': '子',
        '寅': '卯', '午': '卯', '戌': '卯',
        '巳': '午', '酉': '午', '丑': '午'
    };
    const peachTargets = [...new Set([peachMap[dayZhi], peachMap[yearZhi]].filter(Boolean))];
    const peachBlossomStar = peachTargets.length > 0 ? peachTargets.map(z => zhiEnMap[z]) : null;
    // Travel Horse (驿马)
    const horseMap = {
        '申': '寅', '子': '寅', '辰': '寅',
        '亥': '巳', '卯': '巳', '未': '巳',
        '寅': '申', '午': '申', '戌': '申',
        '巳': '亥', '酉': '亥', '丑': '亥'
    };
    const horseTargets = [...new Set([horseMap[dayZhi], horseMap[yearZhi]].filter(Boolean))];
    const travelHorseStar = horseTargets.length > 0 ? horseTargets.map(z => zhiEnMap[z]) : null;
    // General Star (将星)
    const generalMap = {
        '申': '子', '子': '子', '辰': '子',
        '亥': '卯', '卯': '卯', '未': '卯',
        '寅': '午', '午': '午', '戌': '午',
        '巳': '酉', '酉': '酉', '丑': '酉'
    };
    const generalTargets = [...new Set([generalMap[dayZhi], generalMap[yearZhi]].filter(Boolean))];
    const generalStarResult = generalTargets.length > 0 ? generalTargets.map(z => zhiEnMap[z]) : null;
    // Academic Star (文昌)
    const academicMap = {
        '甲': '巳', '乙': '午', '丙': '申', '戊': '申',
        '丁': '酉', '己': '酉', '庚': '亥', '辛': '子',
        '壬': '寅', '癸': '卯'
    };
    const academicTargets = [...new Set([academicMap[dayGan], academicMap[yearGan]].filter(Boolean))];
    const academicStarResult = academicTargets.length > 0 ? academicTargets.map(z => zhiEnMap[z]) : null;
    // ==========================================
    // PHASE 2: OUTPUT GENERATION (USER LANGUAGE)
    // ==========================================
    // Set language to Chinese. The translateObject will translate it to the user's language based on dictionaries.
    lunar_typescript_1.I18n.setLanguage('chs');
    // Re-fetch Yun and DaYun with output language
    // Using sect = 1 (traditional days calculation) to prevent timezone & interval calculation bugs that occur with sect = 2
    const yun = eightChar.getYun(gender === 'male' ? 1 : 0, 1);
    const daYunArr = yun.getDaYun();
    // Filter out empty pillars (e.g. before major luck starts)
    const luckPillars = daYunArr
        .filter((daYun) => daYun.getGanZhi() !== '')
        .map((daYun) => {
        const liuNianArr = daYun.getLiuNian();
        const annualLuck = liuNianArr.map((ln) => ({
            year: ln.getYear(),
            age: ln.getAge(),
            pillar: ln.getGanZhi(),
        }));
        return {
            age: daYun.getStartAge(),
            pillar: daYun.getGanZhi(),
            annualLuck,
        };
    });
    const minorLuck = [];
    if (daYunArr.length > 0) {
        const xiaoYunArr = daYunArr[0].getXiaoYun();
        xiaoYunArr.forEach((xy) => {
            if (xy.getAge() > 0 && xy.getAge() < (luckPillars.length > 0 ? luckPillars[0].age : 11)) {
                minorLuck.push({
                    year: xy.getYear(),
                    age: xy.getAge(),
                    pillar: xy.getGanZhi(),
                });
            }
        });
    }
    const lunarYearObj = lunar_typescript_1.LunarYear.fromYear(lunar.getYear());
    // Advanced Logic Calculation
    const advData = (0, bazi_advanced_1.advancedBaziLogic)(eightChar, rawWuXingStats, language);
    let response = {
        input: {
            birthDate,
            birthTime: adjustedBirthTime,
            gender,
            timezone,
            language,
        },
        solar: {
            solarYear: solar.getYear(),
            solarMonth: solar.getMonth(),
            solarDay: solar.getDay(),
            solarHour: solar.getHour(),
            solarMinute: solar.getMinute(),
            solarDateTime: solar.toYmdHms(),
            weekDay: (() => {
                const week = solar.getWeek();
                if (language === 'zh')
                    return solar.getWeekInChinese();
                return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][week];
            })(),
        },
        lunar: {
            lunarYear: lunar.getYear(),
            lunarMonth: lunar.getMonth(),
            lunarDay: lunar.getDay(),
            leapMonth: lunarYearObj.getLeapMonth(),
            chineseDate: lunar.toString(),
        },
        pillars: {
            yearPillar: eightChar.getYear(),
            monthPillar: eightChar.getMonth(),
            dayPillar: eightChar.getDay(),
            hourPillar: eightChar.getTime(),
        },
        advancedPillars: {
            taiYuan: eightChar.getTaiYuan(),
            mingGong: eightChar.getMingGong(),
            shenGong: eightChar.getShenGong(),
        },
        heavenlyStems: {
            yearStem: eightChar.getYearGan(),
            monthStem: eightChar.getMonthGan(),
            dayStem: eightChar.getDayGan(),
            hourStem: eightChar.getTimeGan(),
        },
        earthlyBranches: {
            yearBranch: eightChar.getYearZhi(),
            monthBranch: eightChar.getMonthZhi(),
            dayBranch: eightChar.getDayZhi(),
            hourBranch: eightChar.getTimeZhi(),
        },
        fiveElements: {
            yearElement: eightChar.getYearWuXing(),
            monthElement: eightChar.getMonthWuXing(),
            dayElement: eightChar.getDayWuXing(),
            hourElement: eightChar.getTimeWuXing(),
            statistics: wuXingStats,
        },
        hiddenStems: {
            yearHiddenStems: eightChar.getYearHideGan(),
            monthHiddenStems: eightChar.getMonthHideGan(),
            dayHiddenStems: eightChar.getDayHideGan(),
            hourHiddenStems: eightChar.getTimeHideGan(),
        },
        tenGods: {
            yearTenGod: eightChar.getYearShiShenGan(),
            monthTenGod: eightChar.getMonthShiShenGan(),
            dayTenGod: eightChar.getDayShiShenGan(),
            hourTenGod: eightChar.getTimeShiShenGan(),
            distribution: tenGodsDistribution,
        },
        naYin: {
            yearNaYin: eightChar.getYearNaYin(),
            monthNaYin: eightChar.getMonthNaYin(),
            dayNaYin: eightChar.getDayNaYin(),
            hourNaYin: eightChar.getTimeNaYin(),
        },
        zodiac: {
            chineseZodiac: lunar.getYearShengXiao(),
            animal: lunar.getYearShengXiao(),
        },
        constellation: {
            westernConstellation: solar.getXingZuo(),
        },
        solarTerms: {
            currentSolarTerm: lunar.getJieQi() || lunar.getPrevJieQi().getName(),
            previousSolarTerm: lunar.getPrevJieQi().getName(),
            nextSolarTerm: lunar.getNextJieQi().getName(),
        },
        luckPillars: {
            direction: null,
            forward: yun.isForward(),
            startingAge: luckPillars.length > 0 ? luckPillars[0].age : yun.getStartYear(),
            startingDate: yun.getStartSolar().toYmd(),
            pillars: luckPillars,
            minorLuck,
        },
        analysis: {
            dayMasterStrength: advData.dayMasterStrength,
            strongestElement: advData.strongestElement,
            weakestElement: advData.weakestElement,
            missingElements: Object.keys(rawWuXingStats).filter((k) => rawWuXingStats[k] === 0),
            balanced: advData.balanced,
            favorableElements: advData.favorableElements,
            unfavorableElements: advData.unfavorableElements,
            yongShen: advData.yongShen,
            voidBranch: eightChar.getDayXunKong(),
            twelveGrowthPhases: [
                eightChar.getYearDiShi(),
                eightChar.getMonthDiShi(),
                eightChar.getDayDiShi(),
                eightChar.getTimeDiShi(),
            ],
            godsAndStars: {
                nobleman: noblemanStar,
                peachBlossom: peachBlossomStar,
                academicStar: academicStarResult,
                travelHorse: travelHorseStar,
                generalStar: generalStarResult,
            },
            interactions: advData.interactions,
        },
        lifePredictions: advData.lifePredictions,
        currentAnnualLuck: {
            currentYear: new Date().getFullYear(),
            annualPillar: lunarYearObj.getGanZhi(), // Roughly current year pillar
            overallFortune: advData.dayMasterStrength === 'Strong' ? 'Good' : 'Average',
            keyEvents: ['Career Advancements', 'Personal Growth'],
        }
    };
    // Limit response for FREE users older than 14 days
    if (user) {
        const plan = user.subscription?.plan || 'FREE';
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        if (plan === 'FREE' && user.createdAt < fourteenDaysAgo) {
            response = {
                ...response,
                hiddenStems: null,
                tenGods: null,
                naYin: null,
                zodiac: null,
                constellation: null,
                solarTerms: null,
                luckPillars: null,
                analysis: response.analysis ? {
                    ...response.analysis,
                    godsAndStars: null,
                    twelveGrowthPhases: null,
                    interactions: null,
                } : null,
                lifePredictions: null,
                currentAnnualLuck: null,
            };
        }
    }
    return (0, i18n_1.translateObject)(response, language || 'en');
};
exports.BaziService = {
    calculateBazi,
};
