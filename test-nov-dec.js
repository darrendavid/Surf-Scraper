const BoxJellyfishRiskCalculator = require('./boxJellyfishRisk');

async function testNovemberDecember2025() {
    const calculator = new BoxJellyfishRiskCalculator();

    console.log('Box Jellyfish Risk - November & December 2025\n');
    console.log('=' .repeat(60));

    // November 2025 - Full moon on November 5
    console.log('\n📅 NOVEMBER 2025 (Full Moon: November 5)');
    console.log('-' .repeat(60));

    const novemberDates = [];
    for (let day = 1; day <= 30; day++) {
        const date = new Date(2025, 10, day);  // November is month 10 (0-indexed)
        const risk = await calculator.calculateRisk(date);
        const daysSince = await calculator.getDaysSinceFullMoon(date);
        novemberDates.push({ date: `2025-11-${day.toString().padStart(2, '0')}`, risk, daysSince });
    }

    // Group November by risk level
    console.log('\nHigh Probability days:');
    novemberDates.filter(d => d.risk === 'High Probability').forEach(d => {
        console.log(`  Nov ${d.date.split('-')[2]} (Day ${d.daysSince} after full moon)`);
    });

    console.log('\nLow Probability days:');
    novemberDates.filter(d => d.risk === 'Low Probability').forEach(d => {
        console.log(`  Nov ${d.date.split('-')[2]} (Day ${d.daysSince} after full moon)`);
    });

    console.log('\nNone (safe) days:');
    const novSafeDays = novemberDates.filter(d => d.risk === 'None').map(d => parseInt(d.date.split('-')[2]));
    console.log(`  Nov ${novSafeDays.join(', ')}`);

    // December 2025 - Full moon on December 4
    console.log('\n📅 DECEMBER 2025 (Full Moon: December 4)');
    console.log('-' .repeat(60));

    const decemberDates = [];
    for (let day = 1; day <= 31; day++) {
        const date = new Date(2025, 11, day);  // December is month 11 (0-indexed)
        const risk = await calculator.calculateRisk(date);
        const daysSince = await calculator.getDaysSinceFullMoon(date);
        decemberDates.push({ date: `2025-12-${day.toString().padStart(2, '0')}`, risk, daysSince });
    }

    // Group December by risk level
    console.log('\nHigh Probability days:');
    decemberDates.filter(d => d.risk === 'High Probability').forEach(d => {
        console.log(`  Dec ${d.date.split('-')[2]} (Day ${d.daysSince} after full moon)`);
    });

    console.log('\nLow Probability days:');
    decemberDates.filter(d => d.risk === 'Low Probability').forEach(d => {
        console.log(`  Dec ${d.date.split('-')[2]} (Day ${d.daysSince} after full moon)`);
    });

    console.log('\nNone (safe) days:');
    const decSafeDays = decemberDates.filter(d => d.risk === 'None').map(d => parseInt(d.date.split('-')[2]));
    console.log(`  Dec ${decSafeDays.join(', ')}`);

    // Summary table
    console.log('\n📊 SUMMARY TABLE');
    console.log('-' .repeat(60));
    console.log('November 2025:');
    console.log(`  Full Moon: Nov 5`);
    console.log(`  Low Risk: Nov 12, 16 (days 7 & 11 after full moon)`);
    console.log(`  High Risk: Nov 13-15 (days 8-10 after full moon)`);
    console.log(`  Total High Risk Days: ${novemberDates.filter(d => d.risk === 'High Probability').length}`);
    console.log(`  Total Low Risk Days: ${novemberDates.filter(d => d.risk === 'Low Probability').length}`);
    console.log(`  Total Safe Days: ${novemberDates.filter(d => d.risk === 'None').length}`);

    console.log('\nDecember 2025:');
    console.log(`  Full Moon: Dec 4`);
    console.log(`  Low Risk: Dec 11, 15 (days 7 & 11 after full moon)`);
    console.log(`  High Risk: Dec 12-14 (days 8-10 after full moon)`);
    console.log(`  Total High Risk Days: ${decemberDates.filter(d => d.risk === 'High Probability').length}`);
    console.log(`  Total Low Risk Days: ${decemberDates.filter(d => d.risk === 'Low Probability').length}`);
    console.log(`  Total Safe Days: ${decemberDates.filter(d => d.risk === 'None').length}`);
}

testNovemberDecember2025().catch(console.error);