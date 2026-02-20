const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Pon aquí tus credenciales del Dashboard de Spotify
// Usa variables de entorno (Environment Variables)
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

        console.log("¡Token obtenido con éxito para el arquitecto!");
        res.json(response.data);
    } catch (error) {
        console.error("Error pidiendo el token:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'No se pudo obtener el token' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log(`Usa tus lentes nuevos para leer esto bien, pibe.`);
});