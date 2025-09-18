const mqtt = require('mqtt');

class MQTTPublisher {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.connected = false;
        this.baseTopic = 'homeassistant/sensor/beach_scraper';
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const options = {
                clientId: this.config.clientId || 'beach-scraper',
                clean: true,
                reconnectPeriod: 5000,
                connectTimeout: 30000
            };

            if (this.config.username && this.config.password) {
                options.username = this.config.username;
                options.password = this.config.password;
            }

            const brokerUrl = `mqtt://${this.config.broker}:${this.config.port}`;
            console.log(`Connecting to MQTT broker at ${brokerUrl}...`);

            this.client = mqtt.connect(brokerUrl, options);

            this.client.on('connect', () => {
                console.log('Connected to MQTT broker');
                this.connected = true;
                resolve();
            });

            this.client.on('error', (error) => {
                console.error('MQTT connection error:', error);
                reject(error);
            });

            this.client.on('close', () => {
                console.log('MQTT connection closed');
                this.connected = false;
            });

            this.client.on('reconnect', () => {
                console.log('Reconnecting to MQTT broker...');
            });
        });
    }

    async publishBeachData(beachData) {
        if (!this.connected) {
            console.log('Not connected to MQTT broker, attempting to connect...');
            await this.connect();
        }

        for (const beach of beachData) {
            // Publish individual sensor data for Home Assistant auto-discovery
            await this.publishSensor(beach, 'wave_height_summary', beach.waveHeightSummary, 'mdi:waves', null);
            await this.publishSensor(beach, 'wave_height_low', beach.waveHeightLow, 'mdi:waves-arrow-down', 'measurement', 'ft');
            await this.publishSensor(beach, 'wave_height_high', beach.waveHeightHigh, 'mdi:waves-arrow-up', 'measurement', 'ft');
            await this.publishSensor(beach, 'water_temperature', beach.waterTemperature, 'mdi:thermometer', 'temperature', '°F');
            await this.publishSensor(beach, 'wind', beach.wind, 'mdi:weather-windy', 'wind_speed', 'mph');

            // Publish combined state for each beach
            const stateTopic = `${this.baseTopic}/${beach.id}/state`;
            const statePayload = JSON.stringify({
                wave_height_summary: beach.waveHeightSummary || 'unavailable',
                wave_height_low: beach.waveHeightLow || 'unavailable',
                wave_height_high: beach.waveHeightHigh || 'unavailable',
                water_temperature: beach.waterTemperature || 'unavailable',
                wind: beach.wind || 'unavailable',
                last_updated: beach.timestamp,
                beach_name: beach.beach
            });

            this.client.publish(stateTopic, statePayload, { retain: true }, (error) => {
                if (error) {
                    console.error(`Error publishing state for ${beach.beach}:`, error);
                } else {
                    console.log(`Published state for ${beach.beach}`);
                }
            });
        }
    }

    async publishSensor(beach, sensorType, value, icon, deviceClass, unitOfMeasurement) {
        const sensorId = `${beach.id}_${sensorType}`;
        const configTopic = `${this.baseTopic}/${sensorId}/config`;
        const stateTopic = `${this.baseTopic}/${sensorId}/state`;

        // Home Assistant auto-discovery configuration
        const config = {
            name: `${beach.beach} ${sensorType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            state_topic: stateTopic,
            unique_id: sensorId,
            device: {
                identifiers: [beach.id],
                name: beach.beach,
                model: 'Beach Conditions Monitor',
                manufacturer: 'SafeBeachDay Scraper'
            },
            icon: icon,
            device_class: deviceClass
        };

        if (unitOfMeasurement) {
            config.unit_of_measurement = unitOfMeasurement;
        }

        // Publish configuration for auto-discovery
        this.client.publish(configTopic, JSON.stringify(config), { retain: true }, (error) => {
            if (error) {
                console.error(`Error publishing config for ${sensorId}:`, error);
            }
        });

        // Publish the actual sensor value
        const stateValue = value || 'unavailable';
        this.client.publish(stateTopic, stateValue.toString(), { retain: true }, (error) => {
            if (error) {
                console.error(`Error publishing state for ${sensorId}:`, error);
            }
        });
    }

    async publishBoxJellyfishRisk(risk) {
        if (!this.connected) {
            console.log('Not connected to MQTT broker, attempting to connect...');
            await this.connect();
        }

        const sensorId = 'box_jellyfish_risk';
        const configTopic = `${this.baseTopic}/${sensorId}/config`;
        const stateTopic = `${this.baseTopic}/${sensorId}/state`;

        // Home Assistant auto-discovery configuration
        const config = {
            name: 'Box Jellyfish Risk',
            state_topic: stateTopic,
            unique_id: sensorId,
            device: {
                identifiers: ['hawaii_marine_conditions'],
                name: 'Hawaii Marine Conditions',
                model: 'Marine Safety Monitor',
                manufacturer: 'SafeBeachDay Scraper'
            },
            icon: 'mdi:jellyfish',
            options: ['None', 'Low Probability', 'High Probability'],
            device_class: 'enum'
        };

        // Publish configuration for auto-discovery
        this.client.publish(configTopic, JSON.stringify(config), { retain: true }, (error) => {
            if (error) {
                console.error(`Error publishing config for Box Jellyfish Risk:`, error);
            } else {
                console.log(`Published Box Jellyfish Risk config`);
            }
        });

        // Publish the actual sensor value
        this.client.publish(stateTopic, risk, { retain: true }, (error) => {
            if (error) {
                console.error(`Error publishing Box Jellyfish Risk state:`, error);
            } else {
                console.log(`Published Box Jellyfish Risk: ${risk}`);
            }
        });
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.connected = false;
            console.log('Disconnected from MQTT broker');
        }
    }
}

module.exports = MQTTPublisher;