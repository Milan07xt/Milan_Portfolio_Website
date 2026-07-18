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

// Admin Login (simple password verification)
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body || {};
    if (password === 'milan123') { // Simple secure password for local dashboard
        return res.status(200).json({ token: 'milan_session_token_xyz' });
    }
    return res.status(401).send('Incorrect password');
});

// Middleware helper to check token
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (authHeader === 'Bearer milan_session_token_xyz') {
        return next();
    }
    return res.status(401).send('Unauthorized');
}

// Get all contacts from CSV
app.get('/api/admin/contacts', requireAuth, (req, res) => {
    try {
        ensureHeader();
        const content = fs.readFileSync(CSV_PATH, 'utf8');
        const lines = content.trim().split('\n');
        if (lines.length <= 1) {
            return res.json([]);
        }
        
        const contacts = [];
        // Regex to match CSV columns including those with quotes and commas inside
        // e.g. "Milan Rathod","email@email.com","number","subject","message","timestamp"
        const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;
            
            let matches = [];
            let match;
            while ((match = regex.exec(line)) !== null) {
                matches.push(match[0]);
            }
            // Fallback if regex split fails
            if (matches.length === 0) {
                matches = line.split(',');
            }
            
            const cleaned = matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"'));
            
            contacts.push({
                index: i - 1, // Store CSV array row index for deletion
                name: cleaned[0] || '',
                email: cleaned[1] || '',
                number: cleaned[2] || '',
                subject: cleaned[3] || '',
                message: cleaned[4] || '',
                timestamp: cleaned[5] || ''
            });
        }
        res.json(contacts);
    } catch (err) {
        console.error('Failed to read contacts CSV', err);
        res.status(500).send('Failed to read contacts');
    }
});

// Delete specific contact by index
app.post('/api/admin/contacts/delete', requireAuth, (req, res) => {
    try {
        const { index } = req.body;
        if (index === undefined) return res.status(400).send('Index is required');
        
        ensureHeader();
        const content = fs.readFileSync(CSV_PATH, 'utf8');
        const lines = content.trim().split('\n');
        
        const targetIndex = parseInt(index, 10);
        if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= lines.length - 1) {
            return res.status(400).send('Invalid contact index');
        }
        
        // Remove the row (index + 1 because index 0 is header)
        lines.splice(targetIndex + 1, 1);
        
        fs.writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf8');
        res.status(200).send('Deleted successfully');
    } catch (err) {
        console.error('Failed to delete contact', err);
        res.status(500).send('Failed to delete');
    }
});

// Clear all contacts
app.post('/api/admin/contacts/clear', requireAuth, (req, res) => {
    try {
        const header = 'Name,Mail,Number,Subject,Message,Timestamp\n';
        fs.writeFileSync(CSV_PATH, header, 'utf8');
        res.status(200).send('Cleared all contacts');
    } catch (err) {
        console.error('Failed to clear contacts', err);
        res.status(500).send('Failed to clear');
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
