const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'EE1', descriptor: 'Exceeding Expectations', points: 8 };
    if (score >= 75) return { level: 'EE2', descriptor: 'Exceeding Expectations', points: 7 };
    if (score >= 58) return { level: 'ME1', descriptor: 'Meeting Expectations', points: 6 };
    if (score >= 41) return { level: 'ME2', descriptor: 'Meeting Expectations', points: 5 };
    if (score >= 31) return { level: 'AE1', descriptor: 'Approaching Expectations', points: 4 };
    if (score >= 21) return { level: 'AE2', descriptor: 'Approaching Expectations', points: 3 };
    if (score >= 11) return { level: 'BE1', descriptor: 'Below Expectations', points: 2 };
    return { level: 'BE2', descriptor: 'Below Expectations', points: 1 };
};

module.exports = { getPerformanceLevel };