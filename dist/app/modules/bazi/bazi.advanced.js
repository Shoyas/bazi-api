"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedBaziLogic = void 0;
const lunar_typescript_1 = require("lunar-typescript");
const advancedBaziLogic = (eightChar, rawWuXingStats, language) => {
    // Translate element to English mapping
    const wxMap = { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' };
    // Day Master Element
    const dayGan = eightChar.getDayGan();
    const dayMasterWx = lunar_typescript_1.LunarUtil.WU_XING_GAN[dayGan]; // in Chinese
    const dmElement = wxMap[dayMasterWx] || 'Wood';
    // Five Elements relations
    const supportMap = { 'Wood': 'Water', 'Fire': 'Wood', 'Earth': 'Fire', 'Metal': 'Earth', 'Water': 'Metal' };
    const produceMap = { 'Wood': 'Fire', 'Fire': 'Earth', 'Earth': 'Metal', 'Metal': 'Water', 'Water': 'Wood' };
    const controlMap = { 'Wood': 'Earth', 'Fire': 'Metal', 'Earth': 'Water', 'Metal': 'Wood', 'Water': 'Fire' };
    const controlledByMap = { 'Wood': 'Metal', 'Fire': 'Water', 'Earth': 'Wood', 'Metal': 'Fire', 'Water': 'Earth' };
    // Determine Strength
    const selfCount = rawWuXingStats[dmElement] || 0;
    const motherElement = supportMap[dmElement];
    const motherCount = rawWuXingStats[motherElement] || 0;
    const isStrong = (selfCount + motherCount) >= 4;
    const dayMasterStrength = isStrong ? 'Strong' : 'Weak';
    let favorableElements = [];
    let unfavorableElements = [];
    const outputElement = produceMap[dmElement];
    const wealthElement = controlMap[dmElement];
    const powerElement = controlledByMap[dmElement];
    if (isStrong) {
        favorableElements = [outputElement, wealthElement, powerElement];
        unfavorableElements = [dmElement, motherElement];
    }
    else {
        favorableElements = [motherElement, dmElement];
        unfavorableElements = [outputElement, wealthElement, powerElement];
    }
    // Yong Shen
    const yongShen = favorableElements[0];
    // Directions
    const dirMap = { 'Wood': 'East', 'Fire': 'South', 'Earth': 'Center', 'Metal': 'West', 'Water': 'North' };
    const careerDirection = favorableElements.map(e => dirMap[e]).join(' or ');
    // Health
    const organMap = { 'Wood': 'Liver/Gallbladder', 'Fire': 'Heart/Blood', 'Earth': 'Stomach/Spleen', 'Metal': 'Lungs/Respiratory', 'Water': 'Kidneys/Urinary' };
    const weakestElements = Object.keys(rawWuXingStats).sort((a, b) => rawWuXingStats[a] - rawWuXingStats[b]).slice(0, 2);
    const healthFocus = weakestElements.map(e => organMap[e]);
    // Wealth
    const wealthCount = rawWuXingStats[wealthElement] || 0;
    const wealthPotential = wealthCount > 0 ? (isStrong ? 'High' : 'Moderate') : 'Low (Requires Effort)';
    // Interactions (adjacent branches)
    const zhiList = [eightChar.getYearZhi(), eightChar.getMonthZhi(), eightChar.getDayZhi(), eightChar.getTimeZhi()];
    const labels = ['Year', 'Month', 'Day', 'Hour'];
    const clashes = [];
    const combinations = [];
    const punishments = [];
    const harms = [];
    const harmMap = { '子': '未', '丑': '午', '寅': '巳', '卯': '辰', '申': '亥', '酉': '戌', '未': '子', '午': '丑', '巳': '寅', '辰': '卯', '亥': '申', '戌': '酉' };
    for (let i = 0; i < zhiList.length - 1; i++) {
        const z1 = zhiList[i];
        const z2 = zhiList[i + 1];
        if (lunar_typescript_1.LunarUtil.CHONG[z1] === z2)
            clashes.push(`${z1} & ${z2} (${labels[i]}-${labels[i + 1]})`);
        if (lunar_typescript_1.LunarUtil.HE_ZHI_6[z1] === z2 || lunar_typescript_1.LunarUtil.HE_ZHI_6[z2] === z1)
            combinations.push(`${z1} & ${z2} (${labels[i]}-${labels[i + 1]})`);
        if (lunar_typescript_1.LunarUtil.ZHI_XING[z1] === z2 || lunar_typescript_1.LunarUtil.ZHI_XING[z2] === z1)
            punishments.push(`${z1} & ${z2} (${labels[i]}-${labels[i + 1]})`);
        if (harmMap[z1] === z2)
            harms.push(`${z1} & ${z2} (${labels[i]}-${labels[i + 1]})`);
    }
    // Strongest/Weakest Element (pure count)
    const sortedByCount = Object.keys(rawWuXingStats).sort((a, b) => rawWuXingStats[b] - rawWuXingStats[a]);
    const strongestElement = sortedByCount[0];
    const weakestElement = sortedByCount[sortedByCount.length - 1];
    const balanced = (rawWuXingStats[strongestElement] - rawWuXingStats[weakestElement]) <= 2;
    return {
        dayMasterStrength,
        strongestElement,
        weakestElement,
        balanced,
        favorableElements,
        unfavorableElements,
        yongShen,
        interactions: { clashes, combinations, punishments, harms },
        lifePredictions: { careerDirection, wealthPotential, healthFocus }
    };
};
exports.advancedBaziLogic = advancedBaziLogic;
