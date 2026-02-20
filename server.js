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

    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const tracks = response.data.tracks.items.map(item => ({
      id: item.id,
      name: item.name,
      artist: item.artists[0].name,
      artistId: item.artists[0].id,
      albumArt: item.album.images[0]?.url ?? null,
      previewUrl: item.preview_url,
      spotifyUrl: item.external_urls.spotify
    }));

    const artists = response.data.artists.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url ?? null,
      followers: artist.followers.total,
      spotifyUrl: artist.external_urls.spotify
    }));

    res.json({ tracks, artists });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Spotify error' });
  }
});

module.exports = app;
