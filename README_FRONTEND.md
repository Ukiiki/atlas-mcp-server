# Carl's Bad Chamber Frontend

A web-based dashboard interface for Carl's Bad MCP Server, providing the Chamber staff with an intuitive way to manage members, committees, events, and business listings.

## Features

### 🏠 Dashboard
- **Member Overview**: Total members, new members this week, members with businesses
- **Event Analytics**: Total events, attendees, and revenue statistics
- **Committee Activity**: Active committees, member counts, and committee events
- **Business Categories**: Top business categories with member distribution

### 👥 Member Management
- **Member Directory**: Searchable table of all members with contact information
- **Add New Members**: Form to add new members with validation
- **Member Actions**: Edit member profiles and suspend member accounts
- **Status Tracking**: Visual status badges for member status

### 🏢 Committee Management
- **Committee Overview**: Grid view of all committees with member counts
- **Committee Details**: Detailed view of committee information and members
- **Activity Tracking**: Committee events and engagement metrics

### 📅 Event Management
- **Event Calendar**: Grid view of all events with attendance data
- **Event Filtering**: Filter by all events, upcoming events, or committee events
- **Attendance Analytics**: Track event attendance and revenue

### 🏪 Business Directory
- **Business Listings**: Grid view of all chamber business listings
- **Category Filtering**: Filter businesses by category
- **Search Functionality**: Search businesses by name or description
- **Contact Information**: Complete business contact details

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Web Server**
   ```bash
   npm run web
   ```

3. **Access the Dashboard**
   - Open your browser to: `http://localhost:3000`
   - The dashboard will automatically load chamber data

## Architecture

### Frontend Stack
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Responsive design with modern styling
- **JavaScript**: Vanilla ES6+ with async/await
- **Font Awesome**: Icons for enhanced UI

### Backend Integration
- **Express.js**: Web server hosting the frontend
- **MCP Interface**: Direct communication with Atlas MCP Server
- **REST API**: JSON endpoints for all data operations

### File Structure
```
web/
├── index.html          # Main dashboard page
├── styles.css          # Complete styling system
└── app.js             # Frontend application logic

web-server.js          # Express server with MCP integration
README_FRONTEND.md     # This documentation
```

## API Endpoints

### Data Retrieval
- `GET /api/members` - Get all members
- `GET /api/committees` - Get all committees
- `GET /api/events` - Get all events with attendance
- `GET /api/business-listings` - Get business directory
- `GET /api/listing-categories` - Get business categories
- `GET /api/comprehensive-intelligence` - Get dashboard analytics

### Member Management
- `POST /api/members` - Add new member
- `POST /api/members/:id/suspend` - Suspend member

### Committee Management
- `GET /api/committees/:id/details` - Get committee details

### System
- `GET /api/health` - Health check endpoint

## Usage

### Starting the Server
```bash
# Option 1: Using npm script
npm run web

# Option 2: Direct node execution
node web-server.js
```

### Accessing the Dashboard
1. Open `http://localhost:3000` in your browser
2. The dashboard will automatically load with current chamber data
3. Use the navigation tabs to access different features

### Adding New Members
1. Click "Members" tab
2. Click "Add Member" button
3. Fill out the form with member information
4. Submit to add the member to Atlas MemberClicks

### Managing Committees
1. Click "Committees" tab
2. View all active committees with member counts
3. Click "View Details" for detailed committee information

### Viewing Events
1. Click "Events" tab
2. View all events with attendance data
3. Use filters to show specific event types

### Business Directory
1. Click "Business Directory" tab
2. Search businesses by name or filter by category
3. View complete business contact information

## Configuration

### Environment Variables
- `PORT`: Web server port (default: 3000)
- `HOST`: Server host (default: localhost)

### Carl's Bad MCP Server
The web server automatically communicates with Carl's Bad MCP Server. Ensure:
1. Carl's Bad MCP Server is properly configured
2. Environment variables are set (CLIENT_SECRET, etc.)
3. Atlas MemberClicks API credentials are valid

## Development

### Local Development
```bash
# Start in development mode
npm run web

# The server will restart automatically on file changes
```

### Code Structure
- **AtlasApp Class**: Main application controller
- **MCPInterface Class**: MCP server communication
- **Express Routes**: API endpoint handlers
- **Responsive Design**: Mobile-friendly interface

### Adding New Features
1. Add new API endpoints in `web-server.js`
2. Extend the `AtlasApp` class in `app.js`
3. Add new UI components in `index.html`
4. Style with CSS in `styles.css`

## Deployment

### Production Deployment
1. **Build the MCP Server**
   ```bash
   npm run build
   ```

2. **Start the Web Server**
   ```bash
   npm run web
   ```

3. **Access via URL**
   - Configure your domain to point to the server
   - Use a reverse proxy (nginx) for SSL/HTTPS
   - Set up environment variables for production

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "web"]
```

## Security

### Authentication
- Currently uses basic access (no authentication)
- Recommended: Add authentication middleware for production
- Consider IP whitelisting for chamber staff access

### Data Protection
- All API calls are server-side to Atlas MemberClicks
- No sensitive data stored in browser
- Environment variables protect API credentials

## Troubleshooting

### Common Issues
1. **"Cannot connect to MCP Server"**
   - Ensure Carl's Bad MCP Server is running
   - Check environment variables are set
   - Verify API credentials

2. **"No data loading"**
   - Check Atlas MemberClicks API connectivity
   - Verify API rate limits not exceeded
   - Check browser console for JavaScript errors

3. **"Page not loading"**
   - Ensure Express server is running on correct port
   - Check for port conflicts
   - Verify all dependencies are installed

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=atlas:* npm run web
```

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify Carl's Bad MCP Server is functioning properly
3. Ensure all environment variables are correctly set
4. Review the Atlas MemberClicks API documentation

## License

This frontend interface is part of Carl's Bad MCP Server project and follows the same licensing terms.