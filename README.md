# Maestro Form - Image Preference Survey

A simple web application for collecting image preference data through a survey interface. Built with Node.js, Express, and vanilla JavaScript, designed to be easily deployable on Heroku.

## Features

- 📱 Responsive design that works on desktop and mobile
- 🎨 Modern, clean UI with smooth animations
- ⌨️ Keyboard navigation support (A/B keys or arrow keys)
- 📊 Progress tracking with visual progress bar
- 💾 Automatic CSV data collection
- 🔄 Session management with unique session IDs
- 🚀 Ready for Heroku deployment

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Customizing Your Survey

1. **Edit the survey data:**
   - Open `data/form-data.json`
   - Modify the title, description, and pages
   - Update image URLs and prompts

2. **Add local images (optional):**
   - Create `public/images/` directory
   - Place your images there
   - Reference them as `/images/your-image.jpg`

## Heroku Deployment

### Method 1: Heroku CLI

1. **Install Heroku CLI** (if not already installed)

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create a new Heroku app:**
   ```bash
   heroku create your-app-name
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

### Method 2: GitHub Integration

1. **Push your code to GitHub**

2. **Connect to Heroku:**
   - Go to [Heroku Dashboard](https://dashboard.heroku.com)
   - Create new app
   - Connect to your GitHub repository
   - Enable automatic deploys

## CSV Data Collection

### Accessing Response Data

The app saves responses to `responses.csv` on the server. Here are your options for accessing this data:

#### Option 1: Download Endpoint (Testing)
- Visit: `https://your-app.herokuapp.com/api/download-csv`
- Downloads the current CSV file
- **Note**: This is mainly for testing purposes

#### Option 2: Heroku Logs (Recommended)
You can add logging to track submissions:

```bash
heroku logs --tail
```

#### Option 3: Database Integration (Advanced)
For production use, consider integrating with:
- PostgreSQL (Heroku Postgres)
- MongoDB Atlas
- Google Sheets API
- Airtable API

#### Option 4: Email Integration
Add email functionality to send CSV data:
- Use SendGrid (Heroku add-on)
- Send daily/weekly summary emails

### CSV Format

```csv
timestamp,session_id,page_id,prompt,selected_image,image_a_url,image_b_url
2023-12-07T10:30:00.000Z,session_1701944200000_abc123,1,"Which landscape looks more peaceful?",A,https://...,https://...
```

## File Structure

```
maestro-form/
├── data/
│   └── form-data.json          # Survey configuration
├── public/
│   ├── index.html              # Main HTML file
│   ├── style.css               # Styles
│   ├── app.js                  # Frontend JavaScript
│   └── images/                 # Local images (optional)
├── server.js                   # Express server
├── package.json                # Dependencies
├── Procfile                    # Heroku configuration
├── schema.md                   # JSON schema documentation
└── README.md                   # This file
```

## Customization

### Changing the Survey Data

Edit `data/form-data.json`:

```json
{
  "title": "Your Survey Title",
  "description": "Your instructions",
  "pages": [
    {
      "id": 1,
      "prompt": "Your question here?",
      "imageA": {
        "url": "path/to/image-a.jpg",
        "alt": "Description of image A"
      },
      "imageB": {
        "url": "path/to/image-b.jpg", 
        "alt": "Description of image B"
      }
    }
  ]
}
```

### Styling Changes

Modify `public/style.css` to change:
- Colors and fonts
- Layout and spacing
- Animations and transitions
- Mobile responsiveness

### Functionality Changes

Modify `public/app.js` to add:
- Additional form fields
- Different navigation patterns
- Custom validation
- Analytics tracking

## Environment Variables

For production, you may want to set:

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
```

## Security Considerations

- The app currently stores CSV data locally on the server
- For production use, consider:
  - Rate limiting
  - Input validation
  - HTTPS enforcement
  - Database storage instead of CSV files

## Support

If you encounter issues:

1. Check the Heroku logs: `heroku logs --tail`
2. Verify your `form-data.json` is valid JSON
3. Ensure all image URLs are accessible
4. Check that your Heroku app has the correct Node.js version

## License

MIT License - feel free to modify and use for your projects!
