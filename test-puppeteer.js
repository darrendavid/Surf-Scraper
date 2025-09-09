// Test script to verify the Puppeteer scraper is working
const BeachDataScraperPuppeteer = require('./scraper-puppeteer');

async function test() {
    console.log('Testing Beach Data Scraper with Puppeteer...\n');
    const scraper = new BeachDataScraperPuppeteer();
    
    try {
        const results = await scraper.scrapeAllBeaches();
        
        console.log('\n=== SCRAPING RESULTS ===\n');
        results.forEach(beach => {
            console.log(`Beach: ${beach.beach}`);
            console.log(`  ID: ${beach.id}`);
            console.log(`  Wave Height Summary: ${beach.waveHeightSummary || 'Not found'}`);
            console.log(`  Wave Height Low: ${beach.waveHeightLow || 'Not found'} ft`);
            console.log(`  Wave Height High: ${beach.waveHeightHigh || 'Not found'} ft`);
            console.log(`  Water Temperature: ${beach.waterTemperature || 'Not found'}°F`);
            console.log(`  Wind: ${beach.wind || 'Not found'} mph`);
            console.log(`  Timestamp: ${beach.timestamp}`);
            if (beach.error) {
                console.log(`  Error: ${beach.error}`);
            }
            console.log('---');
        });
        
        console.log('\nTest completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();