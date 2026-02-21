const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images

// Helper to read DB
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading DB:", err);
        return { complaints: [], userStrikes: {} };
    }
};

// Helper to write DB
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing DB:", err);
    }
};

// GET all complaints
app.get('/api/complaints', (req, res) => {
    const db = readDB();
    res.json(db.complaints);
});

// POST new complaint
app.post('/api/complaints', (req, res) => {
    const db = readDB();
    const newComplaint = req.body;
    db.complaints.push(newComplaint);
    writeDB(db);
    res.status(201).json(newComplaint);
});

// PUT update complaint
app.put('/api/complaints/:id', (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    const index = db.complaints.findIndex(c => c.id === id);

    if (index !== -1) {
        db.complaints[index] = { ...db.complaints[index], ...req.body };
        writeDB(db);
        res.json(db.complaints[index]);
    } else {
        res.status(404).json({ message: "Complaint not found" });
    }
});

// GET user strikes
app.get('/api/users/:phone/strikes', (req, res) => {
    const db = readDB();
    const phone = req.params.phone;
    res.json({ strikes: db.userStrikes[phone] || 0 });
});

// POST increment strikes
app.post('/api/users/:phone/strikes', (req, res) => {
    const db = readDB();
    const phone = req.params.phone;
    db.userStrikes[phone] = (db.userStrikes[phone] || 0) + 1;
    writeDB(db);
    res.json({ strikes: db.userStrikes[phone] });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
