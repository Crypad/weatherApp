const express = require('express');
const app = express();
const cors = require('cors');

const server = "localhost:";
const port = "8080";

app.use(cors());
app.use(express.json());

app.post('/api/weather', (req, res) => {
    console.log('Requête POST reçue à l\'URL /api/weather');
    console.log(req.body);
    // Traitement de la requête...
    try {
      const { latitude, longitude } = req.body;
      // Code qui traite la requête avec les coordonnées latitude et longitude
      // Par exemple, vous pouvez appeler une fonction pour récupérer les données météorologiques
      // et renvoyer une réponse au client
      res.send('Données reçues');
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur interne');
    }
  });

app.listen(port, () => {
    console.log('server listening on port 8080')
    
})