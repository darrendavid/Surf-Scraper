const BoxJellyfishRiskCalculator = require('./boxJellyfishRisk');
const Astronomy = require('astronomy-engine');

async function testAstronomyImplementation() {
    const calculator = new BoxJellyfishRiskCalculator();

    console.log('Testing Box Jellyfish Risk Calculator with astronomy-engine\n');
    console.log('=' .repeat(60));
    console.log('Location: Kailua-Kona, Hawaii');
    console.log('=' .repeat(60));

    // Show full moon dates for 2025 calculated by astronomy-engine
    console.log('\n📅 Full Moon Dates for 2025 (calculated dynamically):');
    console.log('-' .repeat(60));
    const fullMoons2025 = calculator.getFullMoonDates(2025);
    fullMoons2025.forEach(moon => {
        const moonInfo = calculator.getMoonInfo(moon);
        console.log(`${moon.toISOString().split('T')[0]} - ${moonInfo.phaseName} (${moonInfo.illumination.toFixed(1)}% illuminated)`);
    });

    // Test October 2025 with astronomy-engine
    console.log('\n📅 October 2025 Test (using astronomy-engine):');
    console.log('-' .repeat(60));

    // Find the October full moon dynamically
    const octFullMoon = fullMoons2025.find(moon => moon.getMonth() === 9); // October is month 9
    console.log(`Full moon detected: ${octFullMoon.toISOString().split('T')[0]}`);

    const testDates = [
        { date: new Date(2025, 9, 1), expected: 'None' },  // Oct 1
        { date: new Date(2025, 9, 12), expected: 'None' }, // Oct 12
        { date: new Date(2025, 9, 13), expected: 'Low Probability' },  // Oct 13
        { date: new Date(2025, 9, 14), expected: 'Low Probability' },  // Oct 14
        { date: new Date(2025, 9, 15), expected: 'High Probability' }, // Oct 15
        { date: new Date(2025, 9, 16), expected: 'High Probability' }, // Oct 16
        { date: new Date(2025, 9, 17), expected: 'High Probability' }, // Oct 17
        { date: new Date(2025, 9, 18), expected: 'Low Probability' },  // Oct 18
        { date: new Date(2025, 9, 31), expected: 'None' }  // Oct 31
    ];

    for (const test of testDates) {
        const risk = await calculator.calculateRisk(test.date);
        const daysSince = await calculator.getDaysSinceFullMoon(test.date);
        const moonInfo = calculator.getMoonInfo(test.date);
        const status = risk === test.expected ? '✅' : '❌';
        console.log(`${test.date.toISOString().split('T')[0]}: ${risk} (Day ${daysSince}, ${moonInfo.phaseName}) ${status}`);
    }

    // Test November & December 2025
    console.log('\n📅 November 2025 (using astronomy-engine):');
    console.log('-' .repeat(60));
    const novFullMoon = fullMoons2025.find(moon => moon.getMonth() === 10); // November is month 10
    console.log(`Full moon detected: ${novFullMoon.toISOString().split('T')[0]}`);

    const novDates = [
        new Date(2025, 10, 12), // Nov 12
        new Date(2025, 10, 13), // Nov 13
        new Date(2025, 10, 14), // Nov 14
        new Date(2025, 10, 15), // Nov 15
        new Date(2025, 10, 16), // Nov 16
    ];

    for (const date of novDates) {
        const risk = await calculator.calculateRisk(date);
        const daysSince = await calculator.getDaysSinceFullMoon(date);
        console.log(`Nov ${date.getDate()}: ${risk} (Day ${daysSince})`);
    }

    console.log('\n📅 December 2025 (using astronomy-engine):');
    console.log('-' .repeat(60));
    const decFullMoon = fullMoons2025.find(moon => moon.getMonth() === 11); // December is month 11
    console.log(`Full moon detected: ${decFullMoon.toISOString().split('T')[0]}`);

    const decDates = [
        new Date(2025, 11, 11), // Dec 11
        new Date(2025, 11, 12), // Dec 12
        new Date(2025, 11, 13), // Dec 13
        new Date(2025, 11, 14), // Dec 14
        new Date(2025, 11, 15), // Dec 15
    ];

    for (const date of decDates) {
        const risk = await calculator.calculateRisk(date);
        const daysSince = await calculator.getDaysSinceFullMoon(date);
        console.log(`Dec ${date.getDate()}: ${risk} (Day ${daysSince})`);
    }

    // Show current moon info
    console.log('\n🌙 Current Moon Information:');
    console.log('-' .repeat(60));
    const currentMoonInfo = calculator.getMoonInfo();
    const currentRisk = await calculator.calculateRisk();
    const currentDays = await calculator.getDaysSinceFullMoon();

    console.log(`Today: ${new Date().toISOString().split('T')[0]}`);
    console.log(`Moon Phase: ${currentMoonInfo.phaseName}`);
    console.log(`Phase Angle: ${currentMoonInfo.phase.toFixed(1)}°`);
    console.log(`Illumination: ${currentMoonInfo.illumination.toFixed(1)}%`);
    console.log(`Days since last full moon: ${currentDays}`);
    console.log(`Box Jellyfish Risk: ${currentRisk}`);

    // Verify astronomy-engine accuracy
    console.log('\n🔬 Astronomy Engine Verification:');
    console.log('-' .repeat(60));
    console.log('Checking known full moon dates against astronomy-engine:');

    // Known full moon (from user's example)
    const knownOctFullMoon = new Date(2025, 9, 6); // Oct 6, 2025
    const calculatedPhase = Astronomy.MoonPhase(knownOctFullMoon);
    console.log(`Oct 6, 2025 moon phase: ${calculatedPhase.toFixed(1)}° (180° = full moon)`);

    // Search for exact full moon time in October 2025
    const octSearch = Astronomy.SearchMoonPhase(180, new Date(2025, 9, 1), 31);
    if (octSearch) {
        const exactTime = new Date(octSearch.date);
        console.log(`Exact October 2025 full moon (UTC): ${exactTime.toISOString()}`);
        console.log(`Exact October 2025 full moon (Hawaii): ${new Date(exactTime.getTime() - 10 * 60 * 60 * 1000).toString()}`);
    }
}

testAstronomyImplementation().catch(console.error);