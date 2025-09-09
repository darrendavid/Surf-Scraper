// Debug script to analyze the website structure
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function debugScrape(url, name) {
    try {
        console.log(`\n=== Debugging ${name} ===`);
        console.log(`URL: ${url}\n`);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        
        // Save HTML for inspection
        fs.writeFileSync(`debug-${name.replace(/\s+/g, '-').toLowerCase()}.html`, response.data);
        console.log(`HTML saved to debug-${name.replace(/\s+/g, '-').toLowerCase()}.html`);
        
        // Look for various patterns
        console.log('\nSearching for weather/ocean conditions...\n');
        
        // Search for any text containing our keywords
        const keywords = ['wave', 'height', 'temperature', 'temp', 'wind', 'surf', 'swell', 'ft', 'feet', 'mph', 'knots'];
        const foundElements = [];
        
        $('*').each((i, elem) => {
            const text = $(elem).text().toLowerCase().trim();
            if (text && text.length < 200) { // Only short text blocks
                for (const keyword of keywords) {
                    if (text.includes(keyword)) {
                        const parent = $(elem).parent();
                        const context = {
                            tag: elem.name,
                            class: $(elem).attr('class'),
                            id: $(elem).attr('id'),
                            text: $(elem).text().trim().substring(0, 100),
                            parentTag: parent[0] ? parent[0].name : null,
                            parentClass: parent.attr('class')
                        };
                        
                        // Avoid duplicates
                        const contextStr = JSON.stringify(context);
                        if (!foundElements.some(e => JSON.stringify(e) === contextStr)) {
                            foundElements.push(context);
                        }
                        break;
                    }
                }
            }
        });
        
        // Display findings
        console.log(`Found ${foundElements.length} potential elements:\n`);
        foundElements.slice(0, 20).forEach((elem, i) => {
            console.log(`${i + 1}. [${elem.tag}] ${elem.class ? `class="${elem.class}"` : ''} ${elem.id ? `id="${elem.id}"` : ''}`);
            console.log(`   Text: "${elem.text}"`);
            if (elem.parentTag) {
                console.log(`   Parent: [${elem.parentTag}] ${elem.parentClass ? `class="${elem.parentClass}"` : ''}`);
            }
            console.log('');
        });
        
        // Look for specific data patterns
        console.log('\nLooking for specific data patterns...\n');
        
        // Find all text that looks like measurements
        const measurementPatterns = [
            /\d+(?:\.\d+)?\s*(?:to\s*)?\d*(?:\.\d+)?\s*(?:ft|feet|f)/gi,
            /\d+(?:\.\d+)?\s*(?:to\s*)?\d*(?:\.\d+)?\s*(?:mph|knots)/gi,
            /\d+(?:\.\d+)?\s*°?\s*(?:F|fahrenheit|C|celsius)/gi
        ];
        
        const measurements = [];
        $('*').each((i, elem) => {
            const text = $(elem).text();
            measurementPatterns.forEach(pattern => {
                const matches = text.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        if (!measurements.includes(match)) {
                            measurements.push(match);
                        }
                    });
                }
            });
        });
        
        if (measurements.length > 0) {
            console.log('Found measurements:');
            measurements.forEach(m => console.log(`  - ${m}`));
        } else {
            console.log('No measurements found');
        }
        
    } catch (error) {
        console.error(`Error debugging ${name}:`, error.message);
    }
}

async function main() {
    const beaches = [
        {
            name: 'Kahalu\'u Beach Park',
            url: 'https://safebeachday.com/kahalu-u-beach-park/'
        },
        {
            name: 'Kua Bay',
            url: 'https://safebeachday.com/maniniowali-beach-kua-bay/'
        },
        {
            name: 'White Sands',
            url: 'https://safebeachday.com/white-sands-beach-park/'
        }
    ];
    
    for (const beach of beaches) {
        await debugScrape(beach.url, beach.name);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n=== Debug Complete ===');
    console.log('Check the generated HTML files to inspect the page structure manually.');
}

main();