"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const data_1 = require("./data"); // Import data from data.ts
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const PORT = process.env.PORT || 3000;
// Map data keyed by patient ID for efficient access
const patientsVitals = {};
data_1.high_risk_data.forEach((vitals) => {
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
wss.on('connection', (ws) => {
    console.log('Dashboard client connected');
    // Send the entire static snapshot once on connection
    ws.send(JSON.stringify({ type: 'vitalsUpdate', patientsVitals }));
    ws.on('message', (message) => {
        // Ignore if message is empty or not a string
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return; // Ignore empty messages
        }
        try {
            const data = JSON.parse(message);
            // Your server currently does not expect messages, so could just log or ignore
            console.log('Received message from client:', data);
        }
        catch (e) {
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
