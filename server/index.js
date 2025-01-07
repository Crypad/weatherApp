const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');

const server = "localhost:";
const port = "8080";

app.use(cors());

// ajouter un itineraire
app.get('/', (req, res) => {
    res.send('Hello from our server!')
})

app.listen(8080, () => {
      console.log('server listening on port 8080')
})