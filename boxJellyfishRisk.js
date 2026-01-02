const Astronomy = require('astronomy-engine');

class BoxJellyfishRiskCalculator {
    constructor() {
        this.riskStates = {
            NONE: 'None',
            LOW: 'Low Probability',
            HIGH: 'High Probability'
        };

        // Kailua-Kona, Hawaii coordinates
        this.location = {
            latitude: 19.6400,   // North is positive
            longitude: -155.9969, // West is negative
            name: 'Kailua-Kona, Hawaii'
        };
    }

    /**
     * Find the most recent full moon before or on the given date
     * @param {Date} date - The date to check
     * @returns {Date} The date of the most recent full moon
     */
    findLastFullMoon(date) {
        // Search for the full moon that occurred most recently
        // We'll search backward from the given date
        const searchDate = new Date(date);

        // Search up to 35 days back (more than one lunar cycle)
        for (let daysBack = 0; daysBack <= 35; daysBack++) {
            const checkDate = new Date(searchDate);
            checkDate.setDate(searchDate.getDate() - daysBack);

            // Use astronomy-engine to find moon phase
            const moonPhase = Astronomy.MoonPhase(checkDate);

            // Full moon occurs at phase ~180 degrees
            // Check if this day contains a full moon (phase crosses 180)
            const nextDay = new Date(checkDate);
            nextDay.setDate(checkDate.getDate() + 1);
            const nextPhase = Astronomy.MoonPhase(nextDay);

            // If phase goes from < 180 to > 180, or is very close to 180, we found a full moon
            if ((moonPhase < 180 && nextPhase > 180) || Math.abs(moonPhase - 180) < 1) {
                // Find the exact moment of full moon on this day
                const fullMoonSearch = Astronomy.SearchMoonPhase(180, checkDate, 2);
                if (fullMoonSearch) {
                    // Convert to local date for Hawaii
                    const fullMoonDate = new Date(fullMoonSearch.date);
                    // Set to midnight local time for consistent day counting
                    fullMoonDate.setHours(0, 0, 0, 0);
                    return fullMoonDate;
                }
            }
        }

        // Fallback: use astronomy-engine's SearchMoonPhase to find the last full moon
        const searchStart = new Date(date);
        searchStart.setDate(date.getDate() - 35);
        const fullMoonSearch = Astronomy.SearchMoonPhase(180, searchStart, 40);

        if (fullMoonSearch) {
            const fullMoonDate = new Date(fullMoonSearch.date);
            fullMoonDate.setHours(0, 0, 0, 0);
            return fullMoonDate;
        }

        // This shouldn't happen, but provide a fallback
        throw new Error('Could not find last full moon');
    }

    /**
     * Calculate days since last full moon for a given date
     * @param {Date} date - The date to check
     * @returns {number} Days since last full moon
     */
    async getDaysSinceFullMoon(date = new Date()) {
        try {
            // Normalize the input date to midnight local time for consistent day counting
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);

            // Find the last full moon
            const lastFullMoon = this.findLastFullMoon(checkDate);

            // Calculate days difference
            const diffTime = checkDate - lastFullMoon;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return diffDays;
        } catch (error) {
            console.error('Error calculating days since full moon:', error);
            return 0;
        }
    }

    /**
     * Get all full moon dates for a given year using astronomy-engine
     * @param {number} year - The year to get full moon dates for
     * @returns {Array<Date>} Array of full moon dates
     */
    getFullMoonDates(year) {
        const fullMoons = [];

        // Start from January 1st of the given year
        let searchDate = new Date(year, 0, 1, 0, 0, 0);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59);

        while (searchDate < yearEnd) {
            // Search for the next full moon (phase 180 degrees)
            const moonEvent = Astronomy.SearchMoonPhase(180, searchDate, 40);

            if (moonEvent) {
                const fullMoonDate = moonEvent.date;
                if (fullMoonDate < yearEnd) {
                    // Adjust for Hawaii timezone if needed
                    // Note: astronomy-engine returns UTC times
                    const hawaiiDate = new Date(fullMoonDate.getTime() - 10 * 60 * 60 * 1000);

                    // Store just the date part (at midnight local time)
                    const localDate = new Date(
                        hawaiiDate.getFullYear(),
                        hawaiiDate.getMonth(),
                        hawaiiDate.getDate(),
                        0, 0, 0
                    );

                    fullMoons.push(localDate);

                    // Move search date forward by 25 days (less than lunar cycle) to find next full moon
                    searchDate = new Date(fullMoonDate);
                    searchDate.setDate(searchDate.getDate() + 25);
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return fullMoons;
    }

    /**
     * Calculate Box Jellyfish Risk based on days since full moon
     * @param {Date} date - The date to check (optional, defaults to today)
     * @returns {string} Risk level: 'None', 'Low Probability', or 'High Probability'
     */
    async calculateRisk(date = new Date()) {
        const daysSinceFullMoon = await this.getDaysSinceFullMoon(date);

        // Risk levels based on days after full moon:
        // Day 7, 11: Low Probability
        // Days 8, 9, 10: High Probability
        // All other days: None

        if (daysSinceFullMoon === 7 || daysSinceFullMoon === 11) {
            return this.riskStates.LOW;
        } else if (daysSinceFullMoon >= 8 && daysSinceFullMoon <= 10) {
            return this.riskStates.HIGH;
        } else {
            return this.riskStates.NONE;
        }
    }

    /**
     * Get risk forecast for the next N days
     * @param {number} days - Number of days to forecast
     * @returns {Array} Array of {date, risk} objects
     */
    async getForecast(days = 30) {
        const forecast = [];
        const startDate = new Date();

        for (let i = 0; i < days; i++) {
            const checkDate = new Date(startDate);
            checkDate.setDate(startDate.getDate() + i);
            const risk = await this.calculateRisk(checkDate);

            forecast.push({
                date: checkDate.toISOString().split('T')[0],
                risk: risk,
                daysSinceFullMoon: await this.getDaysSinceFullMoon(checkDate)
            });
        }

        return forecast;
    }

    /**
     * Get detailed moon information for a given date
     * @param {Date} date - The date to check
     * @returns {Object} Moon phase information
     */
    getMoonInfo(date = new Date()) {
        const phase = Astronomy.MoonPhase(date);
        const illumination = Astronomy.Illumination('Moon', date);

        // Determine phase name
        let phaseName;
        if (phase < 22.5 || phase >= 337.5) phaseName = 'New Moon';
        else if (phase < 67.5) phaseName = 'Waxing Crescent';
        else if (phase < 112.5) phaseName = 'First Quarter';
        else if (phase < 157.5) phaseName = 'Waxing Gibbous';
        else if (phase < 202.5) phaseName = 'Full Moon';
        else if (phase < 247.5) phaseName = 'Waning Gibbous';
        else if (phase < 292.5) phaseName = 'Last Quarter';
        else phaseName = 'Waning Crescent';

        return {
            phase: phase,
            phaseName: phaseName,
            illumination: illumination.phase_fraction * 100,
            date: date.toISOString().split('T')[0]
        };
    }

    /**
     * Get the current or next box jellyfish risk window
     * @returns {Object|null} Object with startDate and endDate, or null if no window in next 60 days
     */
    async getNextRiskWindow() {
        // Check the next 60 days (covers ~2 lunar cycles)
        const forecast = await this.getForecast(60);

        // Find the first occurrence of a risk period (Low or High Probability)
        let windowStart = null;
        let windowEnd = null;

        for (let i = 0; i < forecast.length; i++) {
            const day = forecast[i];

            // Check if this day has risk
            if (day.risk !== this.riskStates.NONE) {
                if (!windowStart) {
                    // This is the start of a risk window
                    // Parse the date string as a local date (not UTC) to avoid timezone shifts
                    const [year, month, dayNum] = day.date.split('-').map(Number);
                    windowStart = new Date(year, month - 1, dayNum);
                }
                // Track the end as we go
                const [year, month, dayNum] = day.date.split('-').map(Number);
                windowEnd = new Date(year, month - 1, dayNum);
            } else if (windowStart && windowEnd) {
                // We've found a complete window (risk days followed by no risk)
                break;
            }
        }

        if (windowStart && windowEnd) {
            return {
                startDate: windowStart,
                endDate: windowEnd
            };
        }

        return null;
    }

    /**
     * Format a risk window as a string for display
     * @param {Object} window - Object with startDate and endDate
     * @returns {string} Formatted date range (e.g., "Sat Jan 10 - Wed Jan 14")
     */
    formatRiskWindow(window) {
        if (!window) {
            return 'No upcoming risk window';
        }

        // Use Pacific/Honolulu timezone for Hawaii
        const options = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Pacific/Honolulu' };
        const startStr = window.startDate.toLocaleDateString('en-US', options);
        const endStr = window.endDate.toLocaleDateString('en-US', options);

        return `${startStr} - ${endStr}`;
    }
}

module.exports = BoxJellyfishRiskCalculator;