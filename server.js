const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getSpotifyToken() {
    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            'grant_type=client_credentials', 
            { 
                headers: { 
                    'Authorization': `Basic ${authHeader}`, 
                    'Content-Type': 'application/x-www-form-urlencoded' 
                } 
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Error en token:", error.message);
        throw error;
    }
}

app.get('/search', async (req, res) => {
    const query = req.query.q || 'Billie Eilish';
    try {
        const token = await getSpotifyToken();
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=20`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const results = [];
        if (response.data.artists) {
            response.data.artists.items.forEach(artist => {
                results.push({
                    id: artist.id,
                    name: artist.name,
                    artist: "Artista / Canal",
                    albumArt: artist.images[0] ? artist.images[0].url : 'https://via.placeholder.com/150'
                });
            });
        }
        if (response.data.tracks) {
            response.data.tracks.items.forEach(track => {
                results.push({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    albumArt: track.album.images[0] ? track.album.images[0].url : 'https://via.placeholder.com/150',
                    previewUrl: track.preview_url
                });
            });
        }
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error', details: error.response ? error.response.data : error.message });
    }
});

module.exports = app;
