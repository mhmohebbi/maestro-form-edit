# Form Data Schema

This document describes the JSON schema used to configure the survey form.

## Schema Structure

```json
{
  "title": "string",           // Survey title displayed at the top
  "description": "string",     // Survey description/instructions
  "pages": [                   // Array of survey pages
    {
      "id": number,            // Unique page identifier
      "prompt": "string",      // Question/prompt for this page
      "referenceImage": {      // Reference image displayed above the prompt (optional)
        "url": "string",       // Image URL (can be local path or external URL)
        "alt": "string"        // Alt text for accessibility
      },
      "imageA": {              // First image option
        "url": "string",       // Image URL (can be local path or external URL)
        "alt": "string"        // Alt text for accessibility
      },
      "imageB": {              // Second image option
        "url": "string",       // Image URL (can be local path or external URL)
        "alt": "string"        // Alt text for accessibility
      }
    }
  ]
}
```

## Example

```json
{
  "title": "Image Preference Survey",
  "description": "Please select the image with the best technical fidelity, aesthetic and aligment to the prompt",
  "pages": [
    {
      "id": 1,
      "prompt": "Which landscape looks more peaceful to you?",
      "referenceImage": {
        "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=center",
        "alt": "Reference landscape for peaceful comparison"
      },
      "imageA": {
        "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        "alt": "Mountain landscape A"
      },
      "imageB": {
        "url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
        "alt": "Forest landscape B"
      }
    }
  ]
}
```

## Image Sources

- **External URLs**: Use services like Unsplash, Pexels, or your own CDN
- **Local Images**: Place images in the `public/images/` directory and reference them as `/images/filename.jpg`

## CSV Output Format

The responses are saved to `responses.csv` with the following columns:

- `timestamp`: ISO timestamp of submission
- `session_id`: Unique session identifier
- `page_id`: Page ID from the JSON
- `prompt`: The question text
- `selected_image`: Either "A" or "B"
- `image_a_url`: URL of image A
- `image_b_url`: URL of image B

## Customization Tips

1. **Adding Pages**: Simply add more objects to the `pages` array
2. **Changing Images**: Update the `url` fields in `imageA` and `imageB`
3. **Local Images**: Create a `public/images/` directory and reference images as `/images/your-image.jpg`
4. **Styling**: Modify `public/style.css` to change the appearance
5. **Behavior**: Modify `public/app.js` to change functionality
