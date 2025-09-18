const BoxJellyfishRiskCalculator = require('./boxJellyfishRisk');

async function testBoxJellyfishRisk() {
    const calculator = new BoxJellyfishRiskCalculator();

    console.log('Testing Box Jellyfish Risk Calculator\n');
    console.log('=' . repeat(50));

    // Test October 2025 example provided by user
    console.log('\n📅 October 2025 Test (Full Moon on October 7, 2025):');
    console.log('-' . repeat(50));

    const testDates = [
        { date: new Date('2025-10-01'), expected: 'None' },
        { date: new Date('2025-10-12'), expected: 'None' },
        { date: new Date('2025-10-13'), expected: 'None' },
        { date: new Date('2025-10-14'), expected: 'Low Probability' },  // Day 7 after full moon
        { date: new Date('2025-10-15'), expected: 'High Probability' }, // Day 8 after full moon
        { date: new Date('2025-10-16'), expected: 'High Probability' }, // Day 9 after full moon
        { date: new Date('2025-10-17'), expected: 'High Probability' }, // Day 10 after full moon
        { date: new Date('2025-10-18'), expected: 'Low Probability' },  // Day 11 after full moon
        { date: new Date('2025-10-19'), expected: 'None' },
        { date: new Date('2025-10-31'), expected: 'None' }
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
        if (day.risk !== 'None') {
            console.log(`  ${day.date} (Day ${day.daysSinceFullMoon})`);
        }
    });

    // Show summary
    const highRiskDays = forecast.filter(d => d.risk === 'High Probability').length;
    const lowRiskDays = forecast.filter(d => d.risk === 'Low Probability').length;
    const noRiskDays = forecast.filter(d => d.risk === 'None').length;

    console.log('\n📊 30-Day Summary:');
    console.log('-' . repeat(50));
    console.log(`High Probability: ${highRiskDays} days`);
    console.log(`Low Probability: ${lowRiskDays} days`);
    console.log(`None: ${noRiskDays} days`);
}

// Run the test
testBoxJellyfishRisk().catch(console.error);