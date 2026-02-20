const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getSpotifyToken() {
    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials', 
        { headers: { 'Authorization': `Basic ${authHeader}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
}

app.get('/search', async (req, res) => {
    const query = req.query.q || 'lofi hip hop'; // Ideal para tu Pomodoro
    try {
        const token = await getSpotifyToken();
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // MIRA BIEN: Aquí incluimos el previewUrl para que SUENE
        const tracks = response.data.tracks.items.map(item => ({
            id: item.id,
            name: item.name,
            artist: item.artists[0].name,
            albumArt: item.album.images[0].url,
            audioUrl: item.preview_url // ESTO ES LO QUE PONE LA MÚSICA
        }));

        res.json(tracks);
    } catch (error) {
        res.status(500).json({ error: 'Error en la búsqueda', details: error.message });
    }
});

module.exports = app;
