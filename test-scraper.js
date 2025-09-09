// Test script to verify the scraper is working
const BeachDataScraper = require('./scraper');

async function test() {
    console.log('Testing Beach Data Scraper...\n');
    const scraper = new BeachDataScraper();
    
    try {
        const results = await scraper.scrapeAllBeaches();
        
        console.log('\n=== SCRAPING RESULTS ===\n');
        results.forEach(beach => {
            console.log(`Beach: ${beach.beach}`);
            console.log(`  ID: ${beach.id}`);
            console.log(`  Wave Height: ${beach.waveHeight || 'Not found'}`);
            console.log(`  Water Temperature: ${beach.waterTemperature || 'Not found'}`);
            console.log(`  Wind: ${beach.wind || 'Not found'}`);
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