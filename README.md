# Beach Data Scraper for Home Assistant

This Node.js application scrapes beach condition data from SafeBeachDay.com for Big Island beaches and publishes it via MQTT for Home Assistant integration.

## Features

- Scrapes wave height, water temperature, and wind data for three Big Island beaches:
  - Kahalu'u Beach Park
  - Manini'owali Beach (Kua Bay)
  - White Sands Beach Park
- Publishes data via MQTT with Home Assistant auto-discovery
- Configurable scraping intervals
- Automatic retries and error handling

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your MQTT settings in the `.env` file:
   ```
   MQTT_BROKER=your-mqtt-broker-ip
   MQTT_PORT=1883
   MQTT_USERNAME=your-username
   MQTT_PASSWORD=your-password
   MQTT_CLIENT_ID=beach-scraper
   SCRAPE_INTERVAL_MINUTES=30
   ```

## Environment Variables

The following environment variables can be configured:

| Variable | Default | Description |
|----------|---------|-------------|
| `MQTT_BROKER` | `localhost` | MQTT broker hostname or IP |
| `MQTT_PORT` | `1883` | MQTT broker port |
| `MQTT_USERNAME` | _(empty)_ | MQTT username |
| `MQTT_PASSWORD` | _(empty)_ | MQTT password |
| `MQTT_CLIENT_ID` | `beach-scraper` | MQTT client identifier |
| `SCRAPE_INTERVAL_MINUTES` | `30` | How often to scrape data (minutes) |

## Usage

### Running the Application

The application includes two scraper implementations:

1. **Basic scraper** (uses axios/cheerio for static HTML):
```bash
npm start
# or
node index.js
```

2. **Puppeteer scraper** (handles dynamic JavaScript content):
```bash
npm run start:puppeteer
# or
node index-puppeteer.js
```

**Note:** The Puppeteer version is recommended if the website loads data dynamically with JavaScript.

### Testing

Test the scrapers without MQTT:
```bash
# Test basic scraper
npm test

# Test Puppeteer scraper
npm run test:puppeteer
```

### Running with Docker

The application includes Docker support for easy deployment:

1. **Using Pre-built Image from GitHub (Recommended)**:
   ```bash
   # Copy environment template
   cp .env.docker .env
   
   # Edit .env with your MQTT broker settings
   nano .env
   
   # Use the GitHub Container Registry image
   docker-compose -f docker-compose.github.yml up -d
   ```

2. **Building Locally**:
   ```bash
   # Copy environment template
   cp .env.docker .env
   
   # Edit .env with your MQTT broker settings
   nano .env
   
   # Build and start the container
   docker-compose up -d
   ```

3. **Using Docker directly**:
   ```bash
   # Using pre-built image
   docker run -d \
     --name beach-scraper \
     -e MQTT_BROKER=192.168.1.100 \
     -e MQTT_USERNAME=homeassistant \
     -e MQTT_PASSWORD=your-password \
     ghcr.io/darrendavid/surf-scraper:latest
     
   # Or build locally first
   docker build -t beach-scraper .
   docker run -d \
     --name beach-scraper \
     -e MQTT_BROKER=192.168.1.100 \
     -e MQTT_USERNAME=homeassistant \
     -e MQTT_PASSWORD=your-password \
     beach-scraper
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f beach-scraper
   # or
   docker logs -f beach-scraper
   ```

### Running as a Service (Non-Docker)

For production without Docker, consider using PM2:
```bash
npm install -g pm2
pm2 start index-puppeteer.js --name beach-scraper
pm2 save
pm2 startup
```

## Home Assistant Integration

### Automatic Discovery

The application publishes MQTT discovery messages, so sensors should appear automatically in Home Assistant if MQTT integration is configured.

### Manual Configuration

If auto-discovery is disabled, add the sensors manually to your `configuration.yaml`:

```yaml
mqtt:
  sensor:
    - name: "Kahalu'u Beach Wave Height"
      state_topic: "homeassistant/sensor/beach_scraper/kahaluu_beach_wave_height/state"
      unique_id: "kahaluu_beach_wave_height"
      icon: "mdi:waves"
    # ... (see homeassistant-config.yaml for full configuration)
```

### Dashboard Card Example

Add a card to your Lovelace dashboard:

```yaml
type: vertical-stack
cards:
  - type: markdown
    content: "# 🏖️ Big Island Beach Conditions"
  
  - type: entities
    title: "Kahalu'u Beach Park"
    entities:
      - entity: sensor.kahaluu_beach_wave_height
      - entity: sensor.kahaluu_beach_water_temperature
      - entity: sensor.kahaluu_beach_wind
```

## Data Structure

Each beach publishes the following MQTT topics:
- `homeassistant/sensor/beach_scraper/{beach_id}_wave_height/state`
- `homeassistant/sensor/beach_scraper/{beach_id}_water_temperature/state`
- `homeassistant/sensor/beach_scraper/{beach_id}_wind/state`

Beach IDs:
- `kahaluu_beach` - Kahalu'u Beach Park
- `kua_bay` - Manini'owali Beach (Kua Bay)
- `white_sands` - White Sands Beach Park

## Troubleshooting

### General Issues
1. **MQTT Connection Issues**: Check your MQTT broker is running and accessible
2. **No Data Appearing**: Check console logs for scraping errors
3. **Missing Values**: The website structure may have changed; check the scraper selectors

### Docker Issues
1. **Container won't start**: Check logs with `docker-compose logs beach-scraper`
2. **Can't connect to MQTT broker**: Ensure the broker IP is accessible from within Docker
3. **Puppeteer errors**: The container includes all necessary dependencies for headless Chrome
4. **Network issues**: If using `localhost` for MQTT broker, change to your host machine's IP address
   ```bash
   # Find your host IP (Linux/Mac)
   ip addr show
   # Or use host.docker.internal for Docker Desktop
   MQTT_BROKER=host.docker.internal
   ```

## License

MIT