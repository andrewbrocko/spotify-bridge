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
    const query = req.query.q || 'Lofi'; 
    try {
        const token = await getSpotifyToken();
        // Usamos la URL limpia sin números raros que filtren datos
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const tracks = response.data.tracks.items.map(item => ({
            id: item.id,
            name: item.name,
            artist: item.artists[0].name,
            albumArt: item.album.images[0] ? item.album.images[0].url : '',
            // ESTO ES LO QUE TIENE QUE APARECER:
            previewUrl: item.preview_url || "No disponible para esta canción"
        }));

        res.json(tracks);
    } catch (error) {
        res.status(500).json({ error: 'Error en la búsqueda', details: error.message });
    }
});

module.exports = app;
