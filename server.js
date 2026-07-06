const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// Serve static site files so visiting http://localhost:3000 shows your portfolio
app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

const CSV_PATH = path.join(__dirname, 'contact.csv');

// Ensure CSV exists and has header
function ensureHeader(){
    if(!fs.existsSync(CSV_PATH)){
        const header = 'Name,Mail,Number,Subject,Message,Timestamp\n';
        fs.writeFileSync(CSV_PATH, header, 'utf8');
    }
}
ensureHeader();

function escapeCsv(value){
    if(value === undefined || value === null) return '';
    return '"' + String(value).replace(/"/g, '""') + '"';
}

app.post('/submit-contact', (req, res)=>{
    try{
        const { name, email, number, subject, message } = req.body || {};
        if(!name || !email){
            return res.status(400).send('Name and email are required');
        }

        console.log('Received contact submission:', { name, email, number, subject });

        const timestamp = new Date().toISOString();
        const row = [name, email, number || '', subject || '', message || '', timestamp]
            .map(escapeCsv).join(',') + '\n';

        fs.appendFile(CSV_PATH, row, 'utf8', (err)=>{
            if(err){
                console.error('Failed to append to CSV', err);
                return res.status(500).send('Failed to save');
            }
            res.status(200).send('Saved');
        });
    }catch(err){
        console.error('Unexpected error in /submit-contact', err);
        res.status(500).send('Server error');
    }
});

// Health check
app.get('/health', (req, res)=> res.send('OK'));

// Default route: send index.html
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Contact server listening on http://localhost:${port}`);
});
