# Carlsbad Chamber of Commerce - Management Platform

> The most beautiful chamber management platform in California. Built for the Carlsbad Chamber of Commerce.

## Features

- **Modern Glassmorphism UI** - Stunning coastal-themed design with ocean blues and sunset golds
- **AI-Powered Assistance** - CopilotKit integration for intelligent member management
- **Real-time Dashboard** - Live stats, member tracking, and event management
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Lightning Fast** - Built with Next.js 15 and optimized for performance

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS with custom coastal theme
- **UI Components**: Custom components with Lucide React icons
- **AI**: CopilotKit for conversational interface
- **API**: Atlas MemberClicks integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Atlas MemberClicks API credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/Ukiiki/atlas-mcp-server.git
cd atlas-mcp-server/atlas-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Atlas API credentials to .env.local
```

### Development

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Ukiiki/atlas-mcp-server)

1. Click the "Deploy" button above
2. Connect your GitHub repository
3. Add environment variables in Vercel dashboard:
   - `ATLAS_CLIENT_SECRET`
   - `ATLAS_CLIENT_ID`
   - `ATLAS_TENANT`
4. Deploy!

Your app will be live at `https://your-app.vercel.app`

## Design Philosophy

This platform embodies Carlsbad's coastal identity with:

- **Ocean Teal** (#06b6d4) - Main brand color representing the Pacific
- **Ocean Blue** (#0ea5e9) - Secondary color for depth and trust
- **Sunset Gold** (#eab308) - Accent color for warmth and energy
- **Glassmorphism** - Modern frosted glass effects throughout
- **Smooth Animations** - Micro-interactions that delight users

## Project Structure

```
atlas-frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── members/      # Member management
│   │   ├── events/       # Event management
│   │   ├── listings/     # Business directory
│   │   └── page.tsx      # Dashboard homepage
│   ├── components/       # React components
│   │   ├── Navigation.tsx
│   │   └── CopilotChat.tsx
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and API client
├── public/               # Static assets
└── package.json
```

## Contributing

This is a private project for the Carlsbad Chamber of Commerce. For feature requests or bug reports, please contact the development team.

## License

Proprietary - Carlsbad Chamber of Commerce

---

**Built with ❤️ for Carlsbad businesses**
