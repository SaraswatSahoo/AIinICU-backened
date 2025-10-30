require('dotenv').config();

import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import path from 'path';
import { high_risk_data } from './data'; // Import data from data.ts

// Define patient vitals type
interface PatientVitals {
  heartRate: number;
  respiratoryRate: number;
  bodyTemperature: number;
  oxygenSaturation: number;
  systolicBP: number;
  diastolicBP: number;
  age: number;
  gender: string;
  riskCategory: string;
  bmi: number;
  pulsePressure: number;
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Map data keyed by patient ID for efficient access
const patientsVitals: Record<number, PatientVitals> = {};

high_risk_data.forEach((vitals) => {
  patientsVitals[vitals['patient ID']] = {
    heartRate: vitals['Heart Rate'],
    respiratoryRate: vitals['Respiratory Rate'],
    bodyTemperature: vitals['Body Temperature'],
    oxygenSaturation: vitals['Oxygen Saturation'],
    systolicBP: vitals['Systolic Blood Pressure'],
    diastolicBP: vitals['Diastolic Blood Pressure'],
    age: vitals['Age'],
    gender: vitals['Gender'],
    riskCategory: vitals['Risk Category'],
    bmi: vitals['BMI'],
    pulsePressure: vitals['Pulse_Pressure'],
  };
});

wss.on('connection', (ws: WebSocket) => {
    console.log('Dashboard client connected');
  
    // Send the entire static snapshot once on connection
    ws.send(JSON.stringify({ type: 'vitalsUpdate', patientsVitals }));
  
    ws.on('message', (message: WebSocket.Data) => {
      // Ignore if message is empty or not a string
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return;  // Ignore empty messages
      }
  
      try {
        const data = JSON.parse(message);
        // Your server currently does not expect messages, so could just log or ignore
        console.log('Received message from client:', data);
      } catch (e) {
        console.warn('Invalid message received', e);
      }
    });
  
    ws.on('close', () => {
      console.log('Dashboard client disconnected');
    });
  });  

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
