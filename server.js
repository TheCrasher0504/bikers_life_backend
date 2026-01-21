// server.js
const express = require('express');
const cors = require('cors');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
require('dotenv').config(); // Zum Laden der Keys

const app = express();
app.use(cors()); // Erlaubt Zugriff von der App
app.use(express.json());

async function roomExists(roomService, roomName) {
  const rooms = await roomService.listRooms();
  return rooms.some(r => r.name === roomName);
}

// Token Endpoint
app.post('/getJoinToken', async (req, res) => {
  const { roomName, identity, name } = req.body;

  if (!roomName || !identity) {
    return res.status(400).json({ error: 'roomName and identity required' });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitHost = process.env.LIVEKIT_HOST;

  console.log("KEY set?", !!process.env.LIVEKIT_API_KEY);
  console.log("SECRET set?", !!process.env.LIVEKIT_API_SECRET);
  console.log("HOST:", process.env.LIVEKIT_HOST);

  if (!apiKey || !apiSecret || !livekitHost) {
      console.error("FEHLER: LIVEKIT_HOST / KEY / SECRET fehlen!");
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

  const exists = await roomExists(roomService, roomName);

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
  res.json({ token });
});

app.get('/roomExists', async (req, res) => {
  const { roomName } = req.query;
  

  if (!roomName) {
    return res.status(400).json({ error: 'roomName required' });
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
    const exists = await roomExists(roomService, roomName);
    res.json({ exists });
  } catch (err) {
    console.error("roomExists:", String(err));
    res.status(500).json({ error: 'ROOM_LOOKUP_FAILED' });
  }
});

app.post('/createRoom', async (req, res) => {
  const { roomName } = req.body;

  if (!roomName) {
    return res.status(400).json({ error: 'roomName required' });
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
    console.log("createRoom:", String(err));
  }
});

app.get('/status', (req, res) => {
  res.send({ status: 'Token Server läuft' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Token Server läuft auf Port ${PORT}`);

});















