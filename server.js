const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

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
app.post('/api/submit', (req, res) => {
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
        
        res.json({ 
            success: true, 
            message: 'Responses saved successfully',
            sessionId: responses.sessionId 
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
