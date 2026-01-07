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
  const { roomName, identity, name } = req.body;

  if (!roomName || !identity) {
    return res.status(400).json({ error: 'roomName and identity required' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error("FEHLER: LIVEKIT_API_KEY oder SECRET sind nicht gesetzt!");
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const room = await db.rooms.findOne({ code: roomName });

  if (!room || room.ended) {
    return res.status(404).json({
      error: "ROOM_NOT_FOUND",
    });
  }

  const at = new AccessToken(
    apiKey,
    apiSecret,
    {
      identity: identity,
      name: name || identity,
    }
  );

  at.addGrant({
    roomJoin: true,
    roomAdmin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canUpdateOwnMetadata: true, // WICHTIG: Kleines 'c' am Anfang!
  });

  const token = await at.toJwt();
  
  // KORRIGIERTE LOG-ZEILE:
  console.log(`Token erstellt für User ${name || identity}, UUID: ${identity} in Raum ${roomName}`);
  
  res.json({ token });
});

app.get('/status', (req, res) => {
  res.send({ status: 'Token Server läuft' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Token Server läuft auf Port ${PORT}`);

});
