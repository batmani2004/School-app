require('dotenv').config();  // Load environment variables from .env file

const config = {
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    sessionToken: process.env.SESSION_TOKEN,
    port: process.env.PORT || 3000, // Default port 3000 if not defined
    weather: {
        apiKey: process.env.WEATHER_API_KEY,
        apiUrl: process.env.WEATHER_API_URL,
        city: process.env.WEATHER_CITY
    }
};

module.exports = config;
