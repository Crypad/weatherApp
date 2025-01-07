const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');

const server = "localhost:";
const port = "8080";

app.use(cors());
app.use(express.json());


// ajouter une route pour obtenir les données météorologiques
// Route pour obtenir les données météo
app.post('/api/weather', async (req, res) => {
    console.dir(req.body);
    const { latitude, longitude } = req.body;

    // Remplacez par votre propre clé API
    const apiKey = '0228cb5db66849af97395611250601';
    const url = `http://api.weatherapi.com/v1/current.json`;

    try {
        const response = await axios.get(url, {
            params: {
                lat: latitude,
                lon: longitude,
                units: 'metric',  // Unités de température en celsius
                appid: apiKey,
            },
        });
        console.dir(response.data);
        const data = response.data;
        
        // Filtrer les informations nécessaires
        const weather = {
            cloudiness: data.clouds.all,  // Couverture nuageuse en %
            temperature: data.main.temp,  // Température en °C
            humidity: data.main.humidity,  // Humidité relative en %
            windSpeed: data.wind.speed,  // Vitesse du vent en m/s
            windDirection: data.wind.deg,  // Direction du vent en degrés
        };
        
            

        res.json(weather);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.listen(8080, () => {
      console.log(`Server running on http://localhost:${8080}`)
})