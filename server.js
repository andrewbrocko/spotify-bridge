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
    const query = req.query.q || 'Billie Eilish';
    try {
        const token = await getSpotifyToken();
        // Pedimos track y artist, con un límite total de 20
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=20`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const results = [];

        // 1. Sacamos hasta 5 Artistas (Canales)
        if (response.data.artists) {
            const artists = response.data.artists.items.slice(0, 5).map(item => ({
                id: item.id,
                name: item.name,
                artist: "Canal / Artista",
                albumArt: item.images[0] ? item.images[0].url : 'https://via.placeholder.com/150',
                previewUrl: null
            }));
            results.push(...artists);
        }

        // 2. Sacamos hasta 15 Canciones
        if (response.data.tracks) {
            const tracks = response.data.tracks.items.slice(0, 15).map(item => ({
                id: item.id,
                name: item.name,
                artist: item.artists[0].name,
                albumArt: item.album.images[0].url,
                previewUrl: item.preview_url
            }));
            results.push(...tracks);
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error en la búsqueda', details: error.message });
    }
});

module.exports = app;
