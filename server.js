const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

// Email configuration (hardcoded for testing; works locally and on Heroku)
const EMAIL_USER = 'hossein@mimeticdata.ai';
const EMAIL_PASS = 'yeeakzynclybmnkc';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    requireTLS: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    tls: {
        minVersion: 'TLSv1.2'
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
});

// Function to send email with CSV attachment
async function sendCSVEmail(csvPath, sessionId, surveyCode) {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: 'mhmohebb@uwaterloo.ca',
            subject: `Survey Responses - Session ${sessionId}`,
            text: `New survey responses have been submitted.\n\nSession ID: ${sessionId}\nSurvey Code: ${surveyCode}\nTimestamp: ${new Date().toISOString()}\n\nThe CSV file with all responses is attached.`,
            html: `
                <h2>New Survey Responses Submitted</h2>
                <p><strong>Session ID:</strong> ${sessionId}</p>
                <p><strong>Survey Code:</strong> ${surveyCode}</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p>The CSV file with all responses is attached to this email.</p>
            `,
            attachments: [
                {
                    filename: 'survey-responses.csv',
                    path: csvPath
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully for session ${sessionId}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Middleware
app.use(express.static('public'));
app.use('/generation_test', express.static('generation_test'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to validate survey code
app.post('/api/validate-code', (req, res) => {
    try {
        const { code } = req.body;
        const codeToForm = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'code-to-form.json'), 'utf8'));
        
        if (codeToForm[code]) {
            res.json({ 
                valid: true, 
                formFile: codeToForm[code],
                code: code
            });
        } else {
            res.json({ valid: false });
        }
    } catch (error) {
        console.error('Error validating code:', error);
        res.status(500).json({ error: 'Failed to validate code' });
    }
});

// API endpoint to get form data by code
app.post('/api/form-data', (req, res) => {
    try {
        const { code } = req.body;
        const codeToForm = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'code-to-form.json'), 'utf8'));
        
        if (!codeToForm[code]) {
            return res.status(400).json({ error: 'Invalid code' });
        }
        
        const formFile = codeToForm[code];
        const formData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', formFile), 'utf8'));
        
        // Add the code to the form data for reference
        formData.surveyCode = code;
        
        res.json(formData);
    } catch (error) {
        console.error('Error reading form data:', error);
        res.status(500).json({ error: 'Failed to load form data' });
    }
});

// API endpoint to submit responses
app.post('/api/submit', async (req, res) => {
    try {
        const responses = req.body;
        const timestamp = new Date().toISOString();
        
        // Generate CSV content
        let csvContent = '';
        
        // Check if file exists to determine if we need headers
        const csvPath = path.join(__dirname, 'responses.csv');
        const fileExists = fs.existsSync(csvPath);
        
        if (!fileExists) {
            // Add headers
            csvContent = 'timestamp,session_id,survey_code,page_id,selected_method,selected_image,prompt,image_a_url,image_b_url\n';
        }
        
        // Add response data
        responses.responses.forEach(response => {
            const row = [
                timestamp,
                responses.sessionId,
                responses.surveyCode || 'unknown',
                response.pageId,
                response.selectedMethod,
                response.selectedImage,
                `"${response.prompt.replace(/"/g, '""')}"`, // Escape quotes in prompt
                response.imageA,
                response.imageB
            ].join(',');
            csvContent += row + '\n';
        });
        
        // Append to CSV file
        fs.appendFileSync(csvPath, csvContent);

        // Send email with CSV attachment
        const emailSent = await sendCSVEmail(csvPath, responses.sessionId, responses.surveyCode || 'unknown');
        
        res.json({ 
            success: true, 
            message: 'Responses saved successfully' + (emailSent ? ' and email sent' : ' but email failed'),
            sessionId: responses.sessionId,
            emailSent: emailSent
        });
    } catch (error) {
        console.error('Error saving responses:', error);
        res.status(500).json({ error: 'Failed to save responses' });
    }
});

// API endpoint to download CSV (for testing purposes)
app.get('/api/download-csv', (req, res) => {
    const csvPath = path.join(__dirname, 'responses.csv');
    if (fs.existsSync(csvPath)) {
        res.download(csvPath, 'survey-responses.csv');
    } else {
        res.status(404).json({ error: 'No responses file found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the app`);
});
