# Mailtrix Frontend

Neo-brutalist cyberpunk dashboard for managing recruiter email matches.

## Features

- **Real-time job display**: Receives job matches from n8n workflow via webhook
- **Candidate scoring**: Visual display of AI-scored candidates with match reasons
- **Approval workflow**: Approve/reject candidates with one click
- **Send to recruiter**: Sends approved candidates back to n8n for email delivery

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `VITE_N8N_WEBHOOK_URL` - Your n8n approval webhook URL
   - `VITE_APPROVAL_API_KEY` - Optional API key for webhook auth

3. Run development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Webhook Endpoints

### Receive Matches (from n8n Workflow 1)

**POST** `/api/matches`

```json
{
  "job_id": "JOB001",
  "job_title": "Senior Java Developer",
  "job_location": "San Francisco, CA",
  "recruiter_email": "recruiter@vendor.com",
  "recruiter_name": "Jane Doe",
  "received_at": "2025-01-28T09:00:00Z",
  "required_skills": ["Java", "Spring Boot", "Microservices"],
  "min_experience": 5,
  "candidates": [
    {
      "match_id": "MATCH001",
      "candidate_id": "CAND001",
      "candidate_name": "John Smith",
      "candidate_email": "john@example.com",
      "candidate_skills": ["Java", "Spring", "AWS"],
      "candidate_experience": 7,
      "match_score": 87,
      "match_reason": "Strong Java/Spring, local, H1B match"
    }
  ]
}
```

### Send Approvals (to n8n Workflow 2)

**POST** `{N8N_WEBHOOK_URL}/approval`

```json
{
  "job_id": "JOB001",
  "approved_candidates": [
    {
      "match_id": "MATCH001",
      "candidate_id": "CAND001"
    }
  ],
  "manager_notes": "Prioritize John for this role"
}
```

## Deployment

This project is configured for Netlify:

```bash
npx netlify-cli deploy --prod
```

The `netlify.toml` file handles:
- Build configuration
- Serverless function routing (`/api/matches` → `/.netlify/functions/matches`)
- SPA fallback routing
- CORS headers

## n8n Configuration

After deploying, update these n8n environment variables:

- `FRONTEND_WEBHOOK_URL` - Your Netlify site URL (e.g., `https://mailtrix.netlify.app`)

## Tech Stack

- React 18 + Vite
- Framer Motion (animations)
- Lucide React (icons)
- date-fns (date formatting)
- CSS Modules
- Netlify Functions (serverless)
