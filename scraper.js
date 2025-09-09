const axios = require('axios');
const cheerio = require('cheerio');

class BeachDataScraper {
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

    async scrapeBeachData(beach) {
        try {
            console.log(`Scraping data for ${beach.name}...`);
            const response = await axios.get(beach.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const data = {
                beach: beach.name,
                id: beach.id,
                timestamp: new Date().toISOString(),
                waveHeight: null,
                waterTemperature: null,
                wind: null
            };

            // Find the conditions section
            $('.condition-item, .beach-condition, .condition-box').each((index, element) => {
                const text = $(element).text().toLowerCase();
                const $element = $(element);
                
                // Look for wave height
                if (text.includes('wave') && text.includes('height')) {
                    const heightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:to\s*)?(\d+(?:\.\d+)?)?\s*(?:ft|feet)/i);
                    if (heightMatch) {
                        if (heightMatch[2]) {
                            data.waveHeight = `${heightMatch[1]}-${heightMatch[2]} ft`;
                        } else {
                            data.waveHeight = `${heightMatch[1]} ft`;
                        }
                    }
                }
                
                // Look for water temperature
                if (text.includes('water') && text.includes('temp')) {
                    const tempMatch = text.match(/(\d+(?:\.\d+)?)\s*°?(?:f|fahrenheit)?/i);
                    if (tempMatch) {
                        data.waterTemperature = tempMatch[1];
                    }
                }
                
                // Look for wind
                if (text.includes('wind')) {
                    const windMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:to\s*)?(\d+(?:\.\d+)?)?\s*(?:mph|knots)/i);
                    if (windMatch) {
                        const unit = text.includes('knots') ? 'knots' : 'mph';
                        if (windMatch[2]) {
                            data.wind = `${windMatch[1]}-${windMatch[2]} ${unit}`;
                        } else {
                            data.wind = `${windMatch[1]} ${unit}`;
                        }
                    }
                }
            });

            // Alternative selectors for different page structures
            if (!data.waveHeight) {
                const waveText = $('*:contains("Wave Height")').parent().text();
                const heightMatch = waveText.match(/(\d+(?:\.\d+)?)\s*(?:to\s*)?(\d+(?:\.\d+)?)?\s*(?:ft|feet)/i);
                if (heightMatch) {
                    if (heightMatch[2]) {
                        data.waveHeight = `${heightMatch[1]}-${heightMatch[2]} ft`;
                    } else {
                        data.waveHeight = `${heightMatch[1]} ft`;
                    }
                }
            }

            if (!data.waterTemperature) {
                const tempText = $('*:contains("Water Temp")').parent().text();
                const tempMatch = tempText.match(/(\d+(?:\.\d+)?)\s*°?(?:f|fahrenheit)?/i);
                if (tempMatch) {
                    data.waterTemperature = tempMatch[1];
                }
            }

            if (!data.wind) {
                const windText = $('*:contains("Wind")').parent().text();
                const windMatch = windText.match(/(\d+(?:\.\d+)?)\s*(?:to\s*)?(\d+(?:\.\d+)?)?\s*(?:mph|knots)/i);
                if (windMatch) {
                    const unit = windText.includes('knots') ? 'knots' : 'mph';
                    if (windMatch[2]) {
                        data.wind = `${windMatch[1]}-${windMatch[2]} ${unit}`;
                    } else {
                        data.wind = `${windMatch[1]} ${unit}`;
                    }
                }
            }

            console.log(`Data scraped for ${beach.name}:`, {
                waveHeight: data.waveHeight || 'Not found',
                waterTemperature: data.waterTemperature || 'Not found',
                wind: data.wind || 'Not found'
            });

            return data;
        } catch (error) {
            console.error(`Error scraping ${beach.name}:`, error.message);
            return {
                beach: beach.name,
                id: beach.id,
                timestamp: new Date().toISOString(),
                error: error.message,
                waveHeight: null,
                waterTemperature: null,
                wind: null
            };
        }
    }

    async scrapeAllBeaches() {
        const results = [];
        for (const beach of this.beaches) {
            const data = await this.scrapeBeachData(beach);
            results.push(data);
            // Add a small delay between requests to be respectful
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return results;
    }
}

module.exports = BeachDataScraper;