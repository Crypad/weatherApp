const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');

const server = "localhost:";
const port = "8080";

app.use(cors());
app.use(express.json());
// Middleware pour analyser les données JSON du corps de la requête
app.use(bodyParser.json());

// clé API et Url pour récupérer les données météo
const apiKey = '0228cb5db66849af97395611250601';
const url = `http://api.weatherapi.com/v1/current.json`;


// Fonction pour vérifier si un fichier existe
const checkAndCreateFile = (filename, defaultValue) => {
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, JSON.stringify(defaultValue, null, 2));
    }
};
  
// Initialiser les fichiers de données utilisateurs et préférences
checkAndCreateFile('users.json', []);
checkAndCreateFile('userLogs.json', []);
  


// Middleware pour enregistrer les connexions utilisateur
app.use((req, res, next) => {
    // Récupérer l'IP du client
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const timestamp = new Date().toISOString();
    const logData = { userIp, timestamp };
  
    // Enregistrement des données dans le fichier userLogs.json
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

// Enregistrement d'un nouvel utilisateur
app.post('/register', (req, res) => {
    const { username, email, preferences } = req.body;
  
    const newUser = {
      username,
      email,
      preferences: preferences || { units: 'metric', forecastDays: 5 }, // Valeurs par défaut
      dateJoined: new Date().toISOString(),
    };
  
    fs.readFile('users.json', (err, data) => {
      if (err) {
        return res.status(500).send('Erreur interne');
      }
  
      const users = JSON.parse(data);
      users.push(newUser);
      fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  
      res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
    });
});
  
// Récupérer un utilisateur par email
app.get('/user', (req, res) => {
    const { email } = req.query;
  
    fs.readFile('users.json', (err, data) => {
      if (err) {
        return res.status(500).send('Erreur interne');
      }
  
      const users = JSON.parse(data);
      const user = users.find((user) => user.email === email);
  
      if (!user) {
        return res.status(404).send('Utilisateur non trouvé');
      }
  
      res.json(user);
    });
});

// Mise à jour des préférences de l'utilisateur
app.put('/update-preferences', (req, res) => {
    const { email, preferences } = req.body;
  
    fs.readFile('users.json', (err, data) => {
      if (err) {
        return res.status(500).send('Erreur interne');
      }
  
      const users = JSON.parse(data);
      const userIndex = users.findIndex((user) => user.email === email);
  
      if (userIndex === -1) {
        return res.status(404).send('Utilisateur non trouvé');
      }
  
      users[userIndex].preferences = preferences;
      fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  
      res.json({ message: 'Préférences mises à jour avec succès' });
    });
});



// ajouter une route pour obtenir les données météorologiques
// Route pour obtenir les données météo actuelles
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
    const { lat, lon, days = 5 } = req.query; // Le nombre de jours par défaut est 5
  
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
  
      const forecastData = response.data.list.slice(0, days * 8).map(forecast => ({
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