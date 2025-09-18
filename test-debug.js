// Debug script to understand date handling
const BoxJellyfishRiskCalculator = require('./boxJellyfishRisk');

async function debugDates() {
    const calculator = new BoxJellyfishRiskCalculator();

    console.log('Debug Date Calculations\n');
    console.log('=' . repeat(50));

    // Test with December 2025
    const fullMoonDec = new Date('2025-12-04');
    console.log('Full moon date object:', fullMoonDec);
    console.log('Full moon ISO:', fullMoonDec.toISOString());
    console.log('Full moon local string:', fullMoonDec.toString());

    // Test specific December dates
    const testDates = [
        new Date('2025-12-04'),  // Full moon day
        new Date('2025-12-05'),  // Day 1
        new Date('2025-12-10'),  // Day 6
        new Date('2025-12-11'),  // Day 7 (should be Low)
        new Date('2025-12-12'),  // Day 8 (should be High)
        new Date('2025-12-13'),  // Day 9 (should be High)
        new Date('2025-12-14'),  // Day 10 (should be High)
        new Date('2025-12-15'),  // Day 11 (should be Low)
        new Date('2025-12-16'),  // Day 12
    ];

    console.log('\nDay calculations:');
    for (const date of testDates) {
        const daysSince = await calculator.getDaysSinceFullMoon(date);
        const risk = await calculator.calculateRisk(date);
        console.log(`${date.toISOString().split('T')[0]}: Day ${daysSince} = ${risk}`);
    }

    // Show what the calculator thinks the full moon dates are
    console.log('\nFull moon dates for 2025:');
    const moons2025 = calculator.getFullMoonDates(2025);
    moons2025.forEach(moon => {
        console.log(`  ${moon.toISOString().split('T')[0]}`);
    });
}

debugDates().catch(console.error);