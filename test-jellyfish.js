const BoxJellyfishRiskCalculator = require('./boxJellyfishRisk');

async function testBoxJellyfishRisk() {
    const calculator = new BoxJellyfishRiskCalculator();

    console.log('Testing Box Jellyfish Risk Calculator\n');
    console.log('=' . repeat(50));

    // Test October 2025 example provided by user
    console.log('\n📅 October 2025 Test (Full Moon on October 7, 2025):');
    console.log('-' . repeat(50));

    const testDates = [
        { date: new Date('2025-10-01'), expected: 'No Risk' },
        { date: new Date('2025-10-12'), expected: 'No Risk' },
        { date: new Date('2025-10-13'), expected: 'No Risk' },
        { date: new Date('2025-10-14'), expected: 'Low Probability' },  // Day 7 after full moon
        { date: new Date('2025-10-15'), expected: 'High Probability' }, // Day 8 after full moon
        { date: new Date('2025-10-16'), expected: 'High Probability' }, // Day 9 after full moon
        { date: new Date('2025-10-17'), expected: 'High Probability' }, // Day 10 after full moon
        { date: new Date('2025-10-18'), expected: 'Low Probability' },  // Day 11 after full moon
        { date: new Date('2025-10-19'), expected: 'No Risk' },
        { date: new Date('2025-10-31'), expected: 'No Risk' }
    ];

    for (const test of testDates) {
        const risk = await calculator.calculateRisk(test.date);
        const daysSince = await calculator.getDaysSinceFullMoon(test.date);
        const status = risk === test.expected ? '✅' : '❌';
        console.log(`${test.date.toISOString().split('T')[0]}: ${risk} (Day ${daysSince}) ${status} Expected: ${test.expected}`);
    }

    // Test current date
    console.log('\n📅 Current Date Test:');
    console.log('-' . repeat(50));
    const currentRisk = await calculator.calculateRisk();
    const currentDays = await calculator.getDaysSinceFullMoon();
    console.log(`Today: ${new Date().toISOString().split('T')[0]}`);
    console.log(`Days since last full moon: ${currentDays}`);
    console.log(`Current risk: ${currentRisk}`);

    // Test next/current risk window
    console.log('\n📅 Next/Current Risk Window:');
    console.log('-' . repeat(50));
    const riskWindow = await calculator.getNextRiskWindow();
    const windowString = calculator.formatRiskWindow(riskWindow);
    console.log(`Window: ${windowString}`);
    if (riskWindow) {
        console.log(`Start Date: ${riskWindow.startDate.toISOString().split('T')[0]}`);
        console.log(`End Date: ${riskWindow.endDate.toISOString().split('T')[0]}`);
    }

    // Show 30-day forecast
    console.log('\n📅 30-Day Forecast:');
    console.log('-' . repeat(50));
    const forecast = await calculator.getForecast(30);

    // Group by risk level
    let currentRiskLevel = null;
    forecast.forEach(day => {
        if (day.risk !== currentRiskLevel) {
            currentRiskLevel = day.risk;
            console.log(`\n${currentRiskLevel}:`);
        }
        if (day.risk !== 'No Risk') {
            console.log(`  ${day.date} (Day ${day.daysSinceFullMoon})`);
        }
    });

    // Show summary
    const highRiskDays = forecast.filter(d => d.risk === 'High Probability').length;
    const lowRiskDays = forecast.filter(d => d.risk === 'Low Probability').length;
    const noRiskDays = forecast.filter(d => d.risk === 'No Risk').length;

    console.log('\n📊 30-Day Summary:');
    console.log('-' . repeat(50));
    console.log(`High Probability: ${highRiskDays} days`);
    console.log(`Low Probability: ${lowRiskDays} days`);
    console.log(`None: ${noRiskDays} days`);

    // Backtest: Show all risk windows for 2025
    console.log('\n📅 2025 Risk Windows Backtest:');
    console.log('=' . repeat(50));

    const fullMoons2025 = calculator.getFullMoonDates(2025);
    console.log('\n🌕 Full Moons in 2025:');
    fullMoons2025.forEach(fm => {
        console.log(`  ${fm.toISOString().split('T')[0]}`);
    });

    console.log('\n📊 Risk Windows for Each Month of 2025:');
    console.log('-' . repeat(50));

    for (let month = 0; month < 12; month++) {
        const monthName = new Date(2025, month, 1).toLocaleString('en-US', { month: 'long' });
        console.log(`\n${monthName} 2025:`);

        // Get the last day of the month
        const lastDay = new Date(2025, month + 1, 0); // Last day of month
        const daysInMonth = lastDay.getDate();

        // Check each day of the month
        let inWindow = false;
        let windowDates = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const checkDate = new Date(2025, month, day);
            const risk = await calculator.calculateRisk(checkDate);
            const daysSince = await calculator.getDaysSinceFullMoon(checkDate);

            if (risk !== 'No Risk') {
                if (!inWindow) {
                    inWindow = true;
                    windowDates = [];
                }
                windowDates.push({
                    date: checkDate,
                    risk: risk,
                    daysSince: daysSince
                });
            } else if (inWindow) {
                // End of window, print it
                if (windowDates.length > 0) {
                    const startDate = windowDates[0].date;
                    const endDate = windowDates[windowDates.length - 1].date;
                    const options = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Pacific/Honolulu' };
                    const startStr = startDate.toLocaleDateString('en-US', options);
                    const endStr = endDate.toLocaleDateString('en-US', options);

                    console.log(`  ${startStr} - ${endStr}`);
                    windowDates.forEach(d => {
                        const dateStr = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Pacific/Honolulu' });
                        console.log(`    ${dateStr}: ${d.risk} (Day ${d.daysSince})`);
                    });
                }
                inWindow = false;
                windowDates = [];
            }
        }

        // Handle case where window extends to end of month
        if (inWindow && windowDates.length > 0) {
            const startDate = windowDates[0].date;
            const endDate = windowDates[windowDates.length - 1].date;
            const options = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Pacific/Honolulu' };
            const startStr = startDate.toLocaleDateString('en-US', options);
            const endStr = endDate.toLocaleDateString('en-US', options);

            console.log(`  ${startStr} - ${endStr}`);
            windowDates.forEach(d => {
                const dateStr = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Pacific/Honolulu' });
                console.log(`    ${dateStr}: ${d.risk} (Day ${d.daysSince})`);
            });
        }
    }

    console.log('\n' . repeat(2));
    console.log('Compare these dates with published box jellyfish calendars.');
}

// Run the test
testBoxJellyfishRisk().catch(console.error);