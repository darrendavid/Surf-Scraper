const axios = require('axios');

class BoxJellyfishRiskCalculator {
    constructor() {
        this.riskStates = {
            NONE: 'None',
            LOW: 'Low Probability',
            HIGH: 'High Probability'
        };
    }

    /**
     * Calculate days since last full moon for Hawaii timezone
     * @param {Date} date - The date to check
     * @returns {number} Days since last full moon
     */
    async getDaysSinceFullMoon(date = new Date()) {
        try {
            // Normalize the input date to midnight local time for consistent day counting
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);

            // Get lunar phase data from astronomy API
            // Using a simple calculation based on lunar cycle (29.53 days)
            const lunarCycle = 29.53;

            // Reference full moon date (October 6, 2025 as per example)
            // In production, this should use an astronomy API or library
            const referenceMoons = this.getFullMoonDates(checkDate.getFullYear());

            // Find the most recent full moon before or on the given date
            let lastFullMoon = null;
            for (const moonDate of referenceMoons) {
                if (moonDate <= checkDate) {
                    lastFullMoon = moonDate;
                } else {
                    break;
                }
            }

            if (!lastFullMoon) {
                // If no full moon found this year, check previous year
                const prevYearMoons = this.getFullMoonDates(checkDate.getFullYear() - 1);
                lastFullMoon = prevYearMoons[prevYearMoons.length - 1];
            }

            // Calculate days difference
            // We need to count days AFTER the full moon, not including the full moon day itself
            const diffTime = checkDate - lastFullMoon;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return diffDays;
        } catch (error) {
            console.error('Error calculating days since full moon:', error);
            return 0;
        }
    }

    /**
     * Get full moon dates for a given year
     * Note: This is a simplified calculation. In production, use an astronomy library
     * or API for accurate moon phase data
     * @param {number} year - The year to get full moon dates for
     * @returns {Array<Date>} Array of full moon dates
     */
    getFullMoonDates(year) {
        // Full moon dates for each year (date only, no time)
        // These are the dates when the full moon occurs in Hawaii
        // Using year, month (0-indexed), day to avoid timezone issues
        const fullMoons2025 = [
            new Date(2025, 0, 13),  // Jan 13
            new Date(2025, 1, 12),  // Feb 12
            new Date(2025, 2, 14),  // Mar 14
            new Date(2025, 3, 12),  // Apr 12
            new Date(2025, 4, 12),  // May 12
            new Date(2025, 5, 11),  // Jun 11
            new Date(2025, 6, 10),  // Jul 10
            new Date(2025, 7, 9),   // Aug 9
            new Date(2025, 8, 7),   // Sep 7
            new Date(2025, 9, 6),   // Oct 6 as per user's example
            new Date(2025, 10, 5),  // Nov 5
            new Date(2025, 11, 4)   // Dec 4
        ];

        const fullMoons2024 = [
            new Date(2024, 0, 25),  // Jan 25
            new Date(2024, 1, 24),  // Feb 24
            new Date(2024, 2, 25),  // Mar 25
            new Date(2024, 3, 23),  // Apr 23
            new Date(2024, 4, 23),  // May 23
            new Date(2024, 5, 21),  // Jun 21
            new Date(2024, 6, 21),  // Jul 21
            new Date(2024, 7, 19),  // Aug 19
            new Date(2024, 8, 17),  // Sep 17
            new Date(2024, 9, 17),  // Oct 17
            new Date(2024, 10, 15), // Nov 15
            new Date(2024, 11, 15)  // Dec 15
        ];

        const fullMoons2026 = [
            new Date(2026, 0, 3),   // Jan 3
            new Date(2026, 1, 1),   // Feb 1
            new Date(2026, 2, 3),   // Mar 3
            new Date(2026, 3, 1),   // Apr 1
            new Date(2026, 4, 1),   // May 1
            new Date(2026, 4, 31),  // May 31
            new Date(2026, 5, 29),  // Jun 29
            new Date(2026, 6, 29),  // Jul 29
            new Date(2026, 7, 28),  // Aug 28
            new Date(2026, 8, 26),  // Sep 26
            new Date(2026, 9, 26),  // Oct 26
            new Date(2026, 10, 25), // Nov 25
            new Date(2026, 11, 25)  // Dec 25
        ];

        switch(year) {
            case 2024:
                return fullMoons2024;
            case 2025:
                return fullMoons2025;
            case 2026:
                return fullMoons2026;
            default:
                // For other years, use a simple approximation
                // This should be replaced with proper astronomical calculations
                const moons = [];
                const startDate = new Date(year, 0, 1);
                const lunarCycle = 29.53;

                for (let i = 0; i < 13; i++) {
                    const moonDate = new Date(startDate);
                    moonDate.setDate(moonDate.getDate() + (i * lunarCycle));
                    if (moonDate.getFullYear() === year) {
                        moons.push(moonDate);
                    }
                }
                return moons;
        }
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
}

module.exports = BoxJellyfishRiskCalculator;