// server.js
const express = require('express');
const cors = require('cors');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
require('dotenv').config(); // Zum Laden der Keys

const app = express();
app.use(cors()); // Erlaubt Zugriff von der App
app.use(express.json());

// Token Endpoint
app.post('/getJoinToken', async (req, res) => {
  const { roomName, identity, name } = req.body;

  if (!roomName || !identity) {
    return res.status(400).json({ error: 'roomName and identity required' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitHost = process.env.LIVEKIT_HOST;

  if (!apiKey || !apiSecret || !livekitHost) {
      console.error("FEHLER: LIVEKIT_HOST / KEY / SECRET fehlen!");
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

  const rooms = await roomService.listRooms();
  const exists = rooms.some(r => r.name === roomName);

  if (!exists) {
    return res.status(404).json({ error: "ROOM_NOT_FOUND" });
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
  console.log(Token erstellt für User ${name || identity}), UUID: ${identity} in Raum ${roomName}); 
  res.json({ token });
});

app.post('/getCreateToken', async (req, res) => {
  const { roomName, identity, name } = req.body;

  if (!roomName || !identity) {
    return res.status(400).json({ error: 'roomName and identity required' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitHost = process.env.LIVEKIT_HOST;

    if (!apiKey || !apiSecret || !livekitHost) {
      console.error("FEHLER: LIVEKIT_HOST / KEY / SECRET fehlen!");
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

    
    try {
      await roomService.createRoom({ name: roomName });
    } catch (err) {
      // falls schon existiert o.ä.
      console.log("createRoom:", String(err));
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
  console.log(Token erstellt für User ${name || identity}), UUID: ${identity} in Raum ${roomName}); 
  res.json({ token });
});

app.get('/status', (req, res) => {
  res.send({ status: 'Token Server läuft' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Token Server läuft auf Port ${PORT}`);

});








