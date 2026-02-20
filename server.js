const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

app.get('/token', async (req, res) => {
    try {
        const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            'grant_type=client_credentials', 
            {
                headers: {
                    'Authorization': `Basic ${authHeader}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error de Spotify', details: error.response ? error.response.data : error.message });
    }
});

// Esto es para que Vercel no se queje del puerto
module.exports = app;
