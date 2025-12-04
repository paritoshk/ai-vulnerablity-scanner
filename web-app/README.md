# AI Vulnerability Scanner - Web Application

A stunning orange/black themed web interface for enterprise AI security scanning, featuring a Waitly-inspired landing page with secret code access.

## 🎨 Features

- **🔒 Private Beta Access**: Exclusive waitlist with secret code entry
- **🎯 Company Intake**: Collect tech stack and AI service information
- **🔍 Automated Scanning**: Real-time vulnerability detection via Gemini 2.5 Pro
- **📊 Interactive Dashboard**: Beautiful metrics, charts, and vulnerability tables
- **⚡ Fast & Modern**: Built with Next.js 14, TypeScript, and shadcn/ui

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- API keys for Gemini and Perplexity (set in parent directory `.env`)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` and use access code: **DEMO** or **SHIELD2025**

## 🔐 Access Codes

Default codes:
- `DEMO` - For demonstration purposes
- `SHIELD2025` - Full access

Customize in `/app/page.tsx` or via environment variables.

## 📁 Project Structure

```
web-app/
├── app/
│   ├── page.tsx              # Waitlist landing page
│   ├── dashboard/
│   │   └── page.tsx          # Protected dashboard
│   ├── api/
│   │   └── scan/
│   │       └── route.ts      # Python scanner API
│   └── globals.css           # Orange/black theme
├── components/ui/            # shadcn/ui components
└── lib/utils.ts              # Utility functions
```

## 🎨 Design System

**Colors:**
- Primary: Orange (#ff6b00)
- Background: Black (#000000)
- Accents: Zinc grays

**Features:**
- Glowing animations on key elements
- Gradient text effects
- Smooth transitions
- Foundry-inspired data presentation

## 🔧 API Integration

The `/api/scan` endpoint:
1. Receives company intake data
2. Spawns Python scanner subprocess
3. Returns vulnerability analysis results

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI globally (already done)
vercel

# Follow prompts to deploy
```

Configure environment variables in Vercel dashboard:
- `GEMINI_API_KEY`
- `PERPLEXITY_API_KEY`

### Manual Build

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix primitives)
- **Icons**: Lucide React
- **Backend**: Next.js API Routes → Python subprocess

## 📝 Usage Flow

1. **Landing Page**: Enter secret access code
2. **Dashboard**: Fill in company information
3. **Scan**: Click "Start Security Scan"
4. **Results**: View vulnerabilities, patches, and AI-RQ score

## 🎯 Future Enhancements

- [ ] Email-based waitlist collection
- [ ] PDF report generation
- [ ] Vulnerability trend charts
- [ ] Team collaboration features
- [ ] SSO integration

## 📄 License

MIT
