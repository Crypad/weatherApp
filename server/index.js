const express = require('express');
const app = express();
const cors = require('cors');

const server = "localhost:";
const port = "8080";

app.use(cors());

app.post('/api/weather', (req, res) => {
    console.dir(req);
    const { latitude, longitude } = req.body;
    console.log("Coords");
    res.send('Données recus')
})

app.listen("localhost:8080", () => {
    console.log('server listening on port 8080')
    
})