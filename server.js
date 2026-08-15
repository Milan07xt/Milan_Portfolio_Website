require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();

function startAIAgentBackend() {
    const backendDir = path.join(__dirname, 'ai-agent', 'backend');
    const pythonExecutable = process.platform === 'win32'
        ? path.join(backendDir, 'venv', 'Scripts', 'python.exe')
        : path.join(backendDir, 'venv', 'bin', 'python');

    const command = fs.existsSync(pythonExecutable) ? pythonExecutable : (process.platform === 'win32' ? 'python' : 'python3');
    const args = fs.existsSync(pythonExecutable)
        ? ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000']
        : ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'];

    const child = spawn(command, args, {
        cwd: backendDir,
        stdio: 'inherit',
        env: process.env
    });

    child.on('error', (err) => {
        console.error('Failed to start AI backend:', err.message);
    });

    return child;
}

startAIAgentBackend();
// Serve static site files so visiting http://localhost:3000 shows your portfolio
app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

const CSV_PATH = path.join(__dirname, 'contact.csv');

// Ensure CSV exists and has header
function ensureHeader(){
    if(!fs.existsSync(CSV_PATH)){
        const header = 'Name,Mail,Number,Subject,Message,Timestamp,IPAddress,UserAgent,Referrer,Browser,Device\n';
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

        // Capture metadata
        const timestamp = new Date().toISOString();
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
        
        // Parse user agent to extract browser and device info
        let browser = 'Unknown';
        let device = 'Unknown';
        
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('Opera')) browser = 'Opera';
        
        if (userAgent.includes('Mobile')) device = 'Mobile';
        else if (userAgent.includes('Tablet')) device = 'Tablet';
        else if (userAgent.includes('iPad')) device = 'Tablet';
        else device = 'Desktop';
        
        const row = [name, email, number || '', subject || '', message || '', timestamp, ipAddress, userAgent, referrer, browser, device]
            .map(escapeCsv).join(',') + '\n';

        fs.appendFile(CSV_PATH, row, 'utf8', (err)=>{
            if(err){
                console.error('Failed to append to CSV', err);
                return res.status(500).send('Failed to save');
            }
            
            // Prepare detailed notification content
            const detailedContent = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                    NEW PORTFOLIO CONTACT SUBMISSION                        ║
╚═══════════════════════════════════════════════════════════════════════════╝

📋 VISITOR INFORMATION:
  • Name: ${name}
  • Email: ${email}
  • Phone: ${number || 'Not provided'}

📝 MESSAGE DETAILS:
  • Subject: ${subject || 'No subject'}
  • Message: ${message || 'No message'}

🔍 TECHNICAL INFORMATION:
  • IP Address: ${ipAddress}
  • Browser: ${browser}
  • Device: ${device}
  • User Agent: ${userAgent}
  • Referrer: ${referrer}

⏰ TIMESTAMP:
  • ${timestamp}

═══════════════════════════════════════════════════════════════════════════
`;

            // Send email notification via Formsubmit
            const contactEmail = process.env.CONTACT_EMAIL || 'rathodmilan216@gmail.com';
            const contactPhone = process.env.CONTACT_PHONE || '9327599254';
            
            fetch(`https://formsubmit.co/ajax/${contactEmail}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: number || 'N/A',
                    subject: `🔔 NEW CONTACT: ${subject || 'Portfolio Inquiry'} from ${name}`,
                    message: detailedContent,
                    _subject: `📧 New Portfolio Contact: ${name}`,
                    _captcha: false
                })
            }).then(response => {
                if (response.ok) {
                    console.log(`✅ Email notification sent to ${contactEmail}`);
                } else {
                    console.error('❌ Error sending email via Formsubmit:', response.status);
                }
            }).catch(error => {
                console.error('❌ Error in email notification:', error);
            });
            
            // Send SMS notification via SMS API (using free SMS service)
            const smsMessage = `📱 New Portfolio Contact!\nName: ${name}\nEmail: ${email}\nPhone: ${number || 'N/A'}\nSubject: ${subject || 'No subject'}\nMessage: ${message?.substring(0, 50) || 'N/A'}...`;
            
            fetch('https://api.sandbox.africastalking.com/version1/messaging', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'username': process.env.SMS_USERNAME || 'sandbox',
                    'APIkey': process.env.SMS_API_KEY || '',
                    'recipients': '9327599254',
                    'message': smsMessage
                })
            }).then(async (response) => {
                if (response.ok) {
                    console.log('📱 SMS notification sent to 9327599254');
                }
            }).catch(error => {
                // Silently fail if SMS is not configured
            });
            
            res.status(200).send('Saved');
        });
    }catch(err){
        console.error('Unexpected error in /submit-contact', err);
        res.status(500).send('Server error');
    }
});

// Submit SMS route for local testing
app.post('/submit-sms', async (req, res) => {
    try {
        const { name, email, number, subject, message } = req.body || {};
        const smsText = `Portfolio Contact!\nName: ${name}\nEmail: ${email}\nPhone: ${number}\nMsg: ${message}`;

        const response = await fetch('https://textbelt.com/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '+919327599254',
                message: smsText,
                key: 'textbelt'
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch(err) {
        console.error('Local SMS Error:', err);
        return res.status(500).send('Server error');
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
