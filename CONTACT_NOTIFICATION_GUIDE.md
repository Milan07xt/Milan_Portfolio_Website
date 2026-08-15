# Contact Notification System Documentation

## Overview
All contact form submissions are automatically captured and notifications are sent to:
- **Email**: rathodmilan216@gmail.com
- **Phone**: 9327599254

---

## What Information Is Captured

### From Contact Form (User Input)
- ✅ Name
- ✅ Email Address
- ✅ Phone Number
- ✅ Subject
- ✅ Message

### Technical Metadata (Automatic)
- 🔍 **IP Address** - Visitor's location
- 🌐 **Browser** - Chrome, Firefox, Safari, Edge, etc.
- 📱 **Device Type** - Mobile, Tablet, or Desktop
- 🔗 **Referrer** - Where visitor came from
- 📋 **User Agent** - Full browser information
- ⏰ **Timestamp** - ISO 8601 format

---

## Storage

### CSV File
All contact submissions are stored in **contact.csv** with the following structure:

```csv
Name,Mail,Number,Subject,Message,Timestamp,IPAddress,UserAgent,Referrer,Browser,Device
```

**Location**: `e:\Milan_Portfolio_Website\contact.csv`

**Example Entry**:
```csv
"Milan Rathod","rathodmilan216@gmail.com","09327599254","Application for Python Developer","Great opportunity!","2026-08-15T11:55:12.037Z","192.168.1.100","Mozilla/5.0...","Direct","Chrome","Desktop"
```

---

## Notifications

### Email Notification 📧
**To**: rathodmilan216@gmail.com
**Via**: Formsubmit.co (no setup required)

**Includes**:
```
Visitor Information:
  • Name
  • Email
  • Phone

Message Details:
  • Subject
  • Message Content

Technical Information:
  • IP Address
  • Browser
  • Device
  • User Agent
  • Referrer

Timestamp
```

### SMS Notification 📱
**To**: 9327599254
**Requires**: SMS API Configuration (optional)

**Current Status**: Ready with default sandbox configuration
**Upgrade**: Add credentials to `.env` file:
```
SMS_USERNAME=your_api_username
SMS_API_KEY=your_api_key
```

**SMS Providers**:
- Africa's Talking: https://africastalking.com
- Twilio: https://www.twilio.com
- AWS SNS: https://aws.amazon.com/sns/

---

## Configuration

### Environment Variables (.env)
```env
# Contact Information
CONTACT_EMAIL=rathodmilan216@gmail.com
CONTACT_PHONE=9327599254

# SMS Configuration (Optional)
SMS_USERNAME=sandbox
SMS_API_KEY=

# Email Configuration (Optional)
EMAIL_USER=
EMAIL_PASS=

# Server Configuration
NODE_ENV=development
PORT=3000
```

---

## Admin Dashboard

### Access Contact Submissions
**Endpoint**: `/api/admin/contacts`
**Method**: GET
**Authorization**: Bearer Token Required

**Header**:
```
Authorization: Bearer milan_session_token_xyz
```

**Response**: JSON array of all contacts from CSV

---

## System Flow

```
1. User Submits Contact Form
        ↓
2. Data Saved to contact.csv with metadata
        ↓
3. Email Sent to rathodmilan216@gmail.com
        ↓
4. SMS Sent to 9327599254 (if configured)
        ↓
5. Response: "Saved" (200 OK)
```

---

## Testing

### Test Email Notification
Submit contact form with:
- Name: Test
- Email: your-email@example.com
- Phone: 1234567890
- Subject: Test Subject
- Message: This is a test message

**Expected**: Email received within 5 minutes

### View All Submissions
```bash
# Using curl
curl -H "Authorization: Bearer milan_session_token_xyz" \
  http://localhost:3000/api/admin/contacts
```

---

## Data Retention

- ✅ All submissions stored indefinitely in contact.csv
- ✅ Can be exported as backup
- ✅ Searchable by date, email, phone, etc.
- ✅ CSV is human-readable and portable

---

## Security Notes

- 🔐 Email notifications use Formsubmit.co (no credentials stored)
- 🔐 Admin token is simple (change in production)
- 🔐 CSV file stored locally
- 🔐 IP addresses captured for reference only

---

## Quick Links

- **Contact CSV**: contact.csv
- **Server Code**: server.js
- **Configuration**: .env
- **Contact Email**: rathodmilan216@gmail.com
- **Contact Phone**: 9327599254

---

## Support

For issues or to update contact information, edit `.env` file and restart the server.
