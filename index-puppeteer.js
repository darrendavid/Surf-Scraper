require('dotenv').config();
const cron = require('node-cron');
const BeachDataScraperPuppeteer = require('./scraper-puppeteer');
const MQTTPublisher = require('./mqttPublisher');
const BoxJellyfishRiskCalculator = require('./boxJellyfishRisk');

class BeachMonitor {
    constructor() {
        this.scraper = new BeachDataScraperPuppeteer();
        this.boxJellyfishCalculator = new BoxJellyfishRiskCalculator();
        this.mqttPublisher = new MQTTPublisher({
            broker: process.env.MQTT_BROKER || 'localhost',
            port: process.env.MQTT_PORT || 1883,
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
            clientId: process.env.MQTT_CLIENT_ID || 'beach-scraper'
        });
        
        this.scrapeInterval = process.env.SCRAPE_INTERVAL_MINUTES || 30;
    }

    async initialize() {
        try {
            console.log('Initializing Beach Monitor (Puppeteer version)...');
            await this.mqttPublisher.connect();
            console.log('Beach Monitor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Beach Monitor:', error);
            throw error;
        }
    }

    async updateBoxJellyfishRisk() {
        try {
            console.log(`\n[${new Date().toISOString()}] Updating Box Jellyfish Risk...`);

            // Calculate current risk
            const risk = await this.boxJellyfishCalculator.calculateRisk();

            // Get the next/current risk window
            const window = await this.boxJellyfishCalculator.getNextRiskWindow();
            const windowString = this.boxJellyfishCalculator.formatRiskWindow(window);

            // Publish to MQTT
            await this.mqttPublisher.publishBoxJellyfishRisk(risk);
            await this.mqttPublisher.publishBoxJellyfishWindow(windowString);

            console.log(`Box Jellyfish Risk updated: ${risk}`);
            console.log(`Box Jellyfish Window: ${windowString}`);
        } catch (error) {
            console.error('Error updating Box Jellyfish Risk:', error);
        }
    }

    async runScrapeAndPublish() {
        try {
            console.log(`\n[${new Date().toISOString()}] Starting beach data scrape...`);

            // Scrape data from all beaches
            const beachData = await this.scraper.scrapeAllBeaches();

            // Publish to MQTT
            await this.mqttPublisher.publishBeachData(beachData);
            
            console.log('Beach data scrape and publish completed successfully');
            
            // Log summary
            console.log('\n--- Summary ---');
            beachData.forEach(beach => {
                console.log(`${beach.beach}:`);
                console.log(`  Wave Height: ${beach.waveHeightSummary || 'N/A'}`);
                console.log(`  Wave Low/High: ${beach.waveHeightLow || 'N/A'}/${beach.waveHeightHigh || 'N/A'} ft`);
                console.log(`  Water Temp: ${beach.waterTemperature || 'N/A'}°F`);
                console.log(`  Wind: ${beach.wind || 'N/A'} mph`);
            });
            console.log('---------------\n');
            
        } catch (error) {
            console.error('Error during scrape and publish:', error);
        }
    }

    start() {
        console.log(`Starting Beach Monitor with ${this.scrapeInterval} minute intervals`);

        // Run immediately on start
        this.runScrapeAndPublish();
        this.updateBoxJellyfishRisk();

        // Schedule periodic beach data and box jellyfish risk updates
        const cronExpression = `*/${this.scrapeInterval} * * * *`;
        cron.schedule(cronExpression, () => {
            this.runScrapeAndPublish();
            this.updateBoxJellyfishRisk();
        });

        console.log(`Scheduled beach data and box jellyfish updates to run every ${this.scrapeInterval} minutes`);
    }

    async shutdown() {
        console.log('Shutting down Beach Monitor...');
        this.mqttPublisher.disconnect();
        process.exit(0);
    }
}

// Main execution
async function main() {
    const monitor = new BeachMonitor();
    
    try {
        await monitor.initialize();
        monitor.start();
        
        // Handle graceful shutdown
        process.on('SIGINT', () => monitor.shutdown());
        process.on('SIGTERM', () => monitor.shutdown());
        
    } catch (error) {
        console.error('Failed to start Beach Monitor:', error);
        process.exit(1);
    }
}

// Run the application
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});