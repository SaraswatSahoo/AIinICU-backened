const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Store latest vitals for patients here
const patientsVitals = {};

// Serve the dashboard HTML file (you can customize this)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Broadcast updated vitals to all connected dashboard clients
function broadcastVitals() {
  const data = JSON.stringify({ type: 'vitalsUpdate', patientsVitals });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', ws => {
  console.log('Client connected');

  // On connection, send the current vitals state
  ws.send(JSON.stringify({ type: 'vitalsUpdate', patientsVitals }));

  // Listen for incoming ICU monitor data update (simulate by you)
  ws.on('message', message => {
    try {
      const data = JSON.parse(message);
      // Expect data to contain patientId and vitals fields
      const { patientId, heartRate, spo2, bp } = data;

      if (!patientId) {
        console.warn('Received data without patientId, ignoring');
        return;
      }

      // Update patient's vitals
      patientsVitals[patientId] = { heartRate, spo2, bp };

      // Broadcast updated vitals to everyone
      broadcastVitals();
    } catch (e) {
      console.error('Invalid message received', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
