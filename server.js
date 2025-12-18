// server.js
const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
require('dotenv').config(); // Zum Laden der Keys

const app = express();
app.use(cors()); // Erlaubt Zugriff von der App
app.use(express.json());

// Token Endpoint
app.post('/getToken', async (req, res) => {
  const { roomName, uuid, name } = req.body;

  if (!roomName || !uuid) {
    return res.status(400).json({ error: 'roomName, uuid required' });
  }

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("FEHLER: LIVEKIT_API_KEY oder SECRET sind nicht gesetzt!");
  process.exit(1); // Stoppt den Server, falls die Keys fehlen
}

  // Erstelle das Token
  const at = new AccessToken(
    apiKey,
    apiSecret,
    {
      identity: uuid, // Deine UUID oder Name
      name: name,     // Anzeigename
    }
  );

  // Rechte vergeben
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    CanUpdateOwnMetadata: true,
  });

  const token = await at.toJwt();
  
  console.log(`Token erstellt für User ${participantName} in Raum ${roomName}`);
  console.log(`Token: ${token}`);
  res.json({ token });
});

app.get('/status', (req, res) => {
  res.send({ status: 'Token Server läuft' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Token Server läuft auf Port ${PORT}`);
});