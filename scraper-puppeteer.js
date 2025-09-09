const puppeteer = require('puppeteer');

class BeachDataScraperPuppeteer {
    constructor() {
        this.beaches = [
            {
                name: 'Kahalu\'u Beach Park',
                url: 'https://safebeachday.com/kahalu-u-beach-park/',
                id: 'kahaluu_beach'
            },
            {
                name: 'Manini\'owali Beach (Kua Bay)',
                url: 'https://safebeachday.com/maniniowali-beach-kua-bay/',
                id: 'kua_bay'
            },
            {
                name: 'White Sands Beach Park',
                url: 'https://safebeachday.com/white-sands-beach-park/',
                id: 'white_sands'
            }
        ];
    }

    async scrapeBeachData(beach, browser) {
        const page = await browser.newPage();
        
        try {
            console.log(`Scraping data for ${beach.name}...`);
            
            // Set viewport and user agent
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            // Navigate to the page
            await page.goto(beach.url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Extract data from the page
            const data = await page.evaluate(() => {
                const result = {
                    waveHeightSummary: null,
                    waveHeightLow: null,
                    waveHeightHigh: null,
                    waterTemperature: null,
                    wind: null
                };
                
                // Get all text content from the page
                const bodyText = document.body.innerText || document.body.textContent || '';
                
                // Search for wave height
                const wavePatterns = [
                    /wave\s*height[:\s]+(\d+(?:\.\d+)?)\s*(?:to|-)?\s*(\d+(?:\.\d+)?)?\s*(?:ft|feet|')/gi,
                    /waves?[:\s]+(\d+(?:\.\d+)?)\s*(?:to|-)?\s*(\d+(?:\.\d+)?)?\s*(?:ft|feet|')/gi,
                    /surf[:\s]+(\d+(?:\.\d+)?)\s*(?:to|-)?\s*(\d+(?:\.\d+)?)?\s*(?:ft|feet|')/gi,
                    /swell[:\s]+(\d+(?:\.\d+)?)\s*(?:to|-)?\s*(\d+(?:\.\d+)?)?\s*(?:ft|feet|')/gi
                ];
                
                for (const pattern of wavePatterns) {
                    const match = bodyText.match(pattern);
                    if (match) {
                        const fullMatch = match[0];
                        const numbers = fullMatch.match(/\d+(?:\.\d+)?/g);
                        if (numbers) {
                            if (numbers.length > 1) {
                                result.waveHeightSummary = `${numbers[0]}-${numbers[1]} ft`;
                                result.waveHeightLow = numbers[0];
                                result.waveHeightHigh = numbers[1];
                            } else {
                                result.waveHeightSummary = `${numbers[0]} ft`;
                                result.waveHeightLow = numbers[0];
                                result.waveHeightHigh = numbers[0];
                            }
                            break;
                        }
                    }
                }
                
                // Search for water temperature
                const tempPatterns = [
                    /water\s*temp(?:erature)?[:\s]+(\d+(?:\.\d+)?)\s*°?(?:F|fahrenheit)?/gi,
                    /ocean\s*temp(?:erature)?[:\s]+(\d+(?:\.\d+)?)\s*°?(?:F|fahrenheit)?/gi,
                    /temp(?:erature)?[:\s]+(\d+(?:\.\d+)?)\s*°?(?:F|fahrenheit)?/gi
                ];
                
                for (const pattern of tempPatterns) {
                    const match = bodyText.match(pattern);
                    if (match) {
                        const numbers = match[0].match(/\d+(?:\.\d+)?/g);
                        if (numbers) {
                            result.waterTemperature = numbers[0];
                            break;
                        }
                    }
                }
                
                // Search for wind (assuming mph by default, convert knots if needed)
                const windPatterns = [
                    /wind[:\s]+(\d+(?:\.\d+)?)\s*(?:to|-)?\s*(\d+(?:\.\d+)?)?\s*(?:mph|knots|kts)/gi,
                    /winds[:\s]+(\d+(?:\.\d+)?)\s*(?:to|-)?\s*(\d+(?:\.\d+)?)?\s*(?:mph|knots|kts)/gi
                ];
                
                for (const pattern of windPatterns) {
                    const match = bodyText.match(pattern);
                    if (match) {
                        const fullMatch = match[0];
                        const numbers = fullMatch.match(/\d+(?:\.\d+)?/g);
                        if (numbers) {
                            // Just take the first number for simplicity, or average if range
                            if (numbers.length > 1) {
                                const avg = (parseFloat(numbers[0]) + parseFloat(numbers[1])) / 2;
                                result.wind = avg.toString();
                            } else {
                                result.wind = numbers[0];
                            }
                            break;
                        }
                    }
                }
                
                // Also check for specific elements that might contain the data
                const elements = document.querySelectorAll('*');
                elements.forEach(el => {
                    const text = el.innerText || el.textContent || '';
                    
                    // Check for labeled data
                    if (text.toLowerCase().includes('wave') && text.toLowerCase().includes('height')) {
                        const numbers = text.match(/\d+(?:\.\d+)?/g);
                        if (numbers && !result.waveHeightLow) {
                            if (numbers.length > 1) {
                                result.waveHeightSummary = `${numbers[0]}-${numbers[1]} ft`;
                                result.waveHeightLow = numbers[0];
                                result.waveHeightHigh = numbers[1];
                            } else {
                                result.waveHeightSummary = `${numbers[0]} ft`;
                                result.waveHeightLow = numbers[0];
                                result.waveHeightHigh = numbers[0];
                            }
                        }
                    }
                    
                    if (text.toLowerCase().includes('water') && text.toLowerCase().includes('temp')) {
                        const numbers = text.match(/\d{2,3}/g);
                        if (numbers && !result.waterTemperature) {
                            result.waterTemperature = numbers[0];
                        }
                    }
                    
                    if (text.toLowerCase().includes('wind') && !text.toLowerCase().includes('window')) {
                        const numbers = text.match(/\d+(?:\.\d+)?/g);
                        if (numbers && !result.wind) {
                            if (numbers.length > 1) {
                                const avg = (parseFloat(numbers[0]) + parseFloat(numbers[1])) / 2;
                                result.wind = avg.toString();
                            } else {
                                result.wind = numbers[0];
                            }
                        }
                    }
                });
                
                return result;
            });
            
            const finalData = {
                beach: beach.name,
                id: beach.id,
                timestamp: new Date().toISOString(),
                ...data
            };
            
            console.log(`Data scraped for ${beach.name}:`, {
                waveHeightSummary: finalData.waveHeightSummary || 'Not found',
                waveHeightLow: finalData.waveHeightLow || 'Not found',
                waveHeightHigh: finalData.waveHeightHigh || 'Not found',
                waterTemperature: finalData.waterTemperature || 'Not found',
                wind: finalData.wind || 'Not found'
            });
            
            await page.close();
            return finalData;
            
        } catch (error) {
            console.error(`Error scraping ${beach.name}:`, error.message);
            await page.close();
            return {
                beach: beach.name,
                id: beach.id,
                timestamp: new Date().toISOString(),
                error: error.message,
                waveHeightSummary: null,
                waveHeightLow: null,
                waveHeightHigh: null,
                waterTemperature: null,
                wind: null
            };
        }
    }

    async scrapeAllBeaches() {
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        try {
            const results = [];
            for (const beach of this.beaches) {
                const data = await this.scrapeBeachData(beach, browser);
                results.push(data);
                // Add a small delay between requests
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            await browser.close();
            return results;
            
        } catch (error) {
            await browser.close();
            throw error;
        }
    }
}

module.exports = BeachDataScraperPuppeteer;