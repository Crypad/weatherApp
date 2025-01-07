const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');

const server = "localhost:";
const port = "8080";

app.use(cors());
app.use(express.json());

// clé API et Url
const apiKey = '0228cb5db66849af97395611250601';
const url = `http://api.weatherapi.com/v1/current.json`;


// Middleware pour enregistrer les connexions utilisateur
app.use((req, res, next) => {
    const userIp = req.ip;
    const timestamp = new Date().toISOString();
    const logData = { userIp, timestamp };
  
    // Enregistrement des données dans un fichier JSON
    fs.readFile('userLogs.json', (err, data) => {
      if (err) {
        fs.writeFileSync('userLogs.json', JSON.stringify([logData], null, 2));
      } else {
        const logs = JSON.parse(data);
        logs.push(logData);
        fs.writeFileSync('userLogs.json', JSON.stringify(logs, null, 2));
      }
    });
  
    next();
});


// ajouter une route pour obtenir les données météorologiques
// Route pour obtenir les données météo
app.post('/api/weather', async (req, res) => {
    console.dir(req.body);  
    // Latitude et Longitude envoyées par le frontend
    const { latitude, longitude } = req.body;

    try {
        const response = await axios.get(url, {
            params: {
                lat: latitude,
                lon: longitude,
                units: 'metric',    // Unités de température en celsius
                lang: 'fr',         // Langue Française
                appid: apiKey,
            },
        });
        console.dir(response.data);
        const data = response.data;
        
        // Filtrer les informations nécessaires
        const weather = {
            cloudiness: data.clouds.all,            // Couverture nuageuse en %
            temperature: data.main.temp,            // Température en °C
            humidity: data.main.humidity,           // Humidité relative en %
            windSpeed: data.wind.speed,             // Vitesse du vent en m/s
            windDirection: data.wind.deg,           // Direction du vent en degrés
            pressure: data.main.pressure,           // Pression atmosphérique en mbar 
            feelslike: data.main.feelslike,         // Ressenti en °C
            connectionTime: connection.timestamp,   // Ajouter la date et l'heure de connexion
        };

        // Recuperer les informations de localisation
        const location = {
            city: data.location.name,
            country: data.location.country,
            region: data.location.region,
            localtime: data.location.localtime,
        };

        // Recuperer les informations de la meteo
        const condition = {
            text: data.current.condition.text,
            icon: data.current.condition.icon,
        };
        
        // Recuperer les informations actuelle
        const current = {
            location,                                   // Localisation
            condition: condition,                       // Condition
            temp_c: data.current.temp_c,                // Temperature
            feelslike_c: data.current.feelslike_c,      // Ressenti
            humidity: data.current.humidity,            // Humidité
            wind_kph: data.current.wind_kph,            // Vitesse vent
            wind_dir: data.current.wind_dir,            // Direction vent 
            pressure_mb: data.current.pressure_mb,      //pression
            last_updated: data.current.last_updated,    // Derniere mise à jour
        };

        // recuperer le jour et l'heure
        const time = {
            day: new Date(current.last_updated).toLocaleDateString('fr-FR', { weekday: 'long' }),
            time: new Date(current.last_updated).toLocaleTimeString('fr-FR', { hour12: false }),
        };
       
            
        // Les données sont envoyes en JSON au client
        res.json(weather, location, condition, current, time);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});


// Endpoint pour obtenir les prévisions sur plusieurs jours
app.get('/forecast', async (req, res) => {
    const { lat, lon } = req.query;
  
    try {
      const response = await axios.get(url, {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: 'metric',
          lang: 'fr',
        },
      });
  
      const forecastData = response.data.list.map(forecast => ({
        date: forecast.dt_txt,
        temperature: forecast.main.temp,
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed,
        windDirection: forecast.wind.deg,
        clouds: forecast.clouds.all,
      }));
  
      res.json(forecastData);
    } catch (error) {
      res.status(500).send('Erreur lors de la récupération des prévisions');
    }
  });

app.listen(8080, () => {
      console.log(`Server running on http://localhost:${8080}`)
})