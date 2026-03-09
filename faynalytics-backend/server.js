const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for your frontend
app.use(cors());
app.use(express.json());

// Google Drive API credentials
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5000/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Validate Google credentials at startup
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('CRITICAL ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in environment variables!');
}

// Google credentials validation at startup
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('CRITICAL ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in environment variables!');
}

// --- Authentication Route ---
app.get('/google/auth', (req, res) => {
    if (!CLIENT_ID) {
        console.error('Auth request failed: client_id is undefined');
        return res.status(500).json({
            error: 'Backend configuration error: client_id is missing',
            details: 'Ensure GOOGLE_CLIENT_ID is set in Vercel environment variables.'
        });
    }

    const scopes = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    res.redirect(url);
});

// --- Authentication Callback Route ---
app.get('/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        // Encode tokens to pass them back to the frontend safely
        const encodedTokens = Buffer.from(JSON.stringify(tokens)).toString('base64');
        res.redirect(`${FRONTEND_URL}/settings?status=success&tokens=${encodedTokens}`);
    } catch (error) {
        console.error('Authentication failed:', error);
        res.redirect(`${FRONTEND_URL}/settings?status=error`);
    }
});

// Middleware to check if user is authenticated (Stateless)
const isAuthenticated = (req, res, next) => {
    const tokenHeader = req.headers['x-google-tokens'];
    if (!tokenHeader) {
        return res.status(401).send('Not authenticated. Tokens missing.');
    }
    try {
        const userTokens = JSON.parse(Buffer.from(tokenHeader, 'base64').toString());
        req.userTokens = userTokens;
        next();
    } catch (e) {
        return res.status(401).send('Invalid token format.');
    }
};

// --- Save Journal to Google Drive ---
app.post('/api/save-journal', isAuthenticated, async (req, res) => {
    try {
        oauth2Client.setCredentials(req.userTokens);
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const journalData = JSON.stringify(req.body.journalData, null, 2);

        // Check if the file already exists
        const files = await drive.files.list({ q: "name = 'Faynalytics_Journal.json'" });
        const existingFile = files.data.files[0];

        if (existingFile) {
            // Update existing file
            await drive.files.update({
                fileId: existingFile.id,
                media: {
                    mimeType: 'application/json',
                    body: journalData,
                },
            });
            res.status(200).send({ message: 'Journal updated successfully.' });
        } else {
            // Create a new file
            await drive.files.create({
                requestBody: {
                    name: 'Faynalytics_Journal.json',
                    mimeType: 'application/json',
                },
                media: {
                    mimeType: 'application/json',
                    body: journalData,
                },
            });
            res.status(201).send({ message: 'Journal saved successfully.' });
        }

    } catch (error) {
        console.error('Failed to save journal:', error);
        res.status(500).send('Failed to save journal');
    }
});

// --- Load Journal from Google Drive ---
app.get('/api/load-journal', isAuthenticated, async (req, res) => {
    try {
        oauth2Client.setCredentials(req.userTokens);
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Find the journal file
        const files = await drive.files.list({ q: "name = 'Faynalytics_Journal.json'" });
        const journalFile = files.data.files[0];

        if (!journalFile) {
            return res.status(404).send({ message: 'No journal found on Google Drive.' });
        }

        // Download the file content
        const fileContent = await drive.files.get({
            fileId: journalFile.id,
            alt: 'media',
        });

        res.status(200).json(fileContent.data);

    } catch (error) {
        console.error('Failed to load journal:', error);
        res.status(500).send('Failed to load journal');
    }
});

// --- Get user profile route ---
app.get('/api/user-profile', isAuthenticated, async (req, res) => {
    try {
        oauth2Client.setCredentials(req.userTokens);
        const userInfo = google.oauth2({ version: 'v2', auth: oauth2Client });
        const profile = await userInfo.userinfo.get();
        res.status(200).json(profile.data);
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        res.status(500).send('Failed to fetch user profile');
    }
});

// --- Check Auth Status ---
app.get('/api/auth-status', (req, res) => {
    const tokenHeader = req.headers['x-google-tokens'];
    res.status(200).json({ authenticated: !!tokenHeader });
});

// --- Logout ---
app.post('/api/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

// --- New root route ---
app.get('/', (req, res) => {
    res.send('Faynalytics Backend is running!');
});

// New middleware to handle 404 errors for any unmatched routes
app.use((req, res, next) => {
    res.status(404).send("Sorry, that page can't be found!");
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
