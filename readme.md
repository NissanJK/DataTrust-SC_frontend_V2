# DataTrust-SC Frontend

React frontend for DataTrust-SC, a trusted and privacy-preserving smart city data distribution framework. The app gives data owners, data requesters, and system observers a single interface for uploading records, requesting policy-based access, monitoring disaster alerts, viewing audit logs, and analyzing blockchain-style system metrics.

## Features

- Data owner upload form with sector, provider, category, policy, and metric fields.
- Data requester workflow for category, role, and attribute-based access requests.
- Blockchain audit log view for data registration and access request events.
- Live smart city data generator for simulated sensor records.
- Disaster warning center with sector status, severity filtering, and auto-refreshing alerts.
- Analytics dashboard built with Recharts for gas cost, latency, sector distribution, and trend analysis.
- CSV import and export support through the backend API.
- Dataset table with auto-refresh and scrollable record display.
- System reset action for clearing datasets and audit logs during demos or testing.

## Tech Stack

- React 19
- Create React App / react-scripts
- Axios
- Recharts
- CSS

## Repository

```bash
git clone https://github.com/NissanJK/DataTrust-SC_frontend_V2.git
cd DataTrust-SC_frontend_V2
```

## Prerequisites

- Node.js 16 or newer
- npm
- Running DataTrust-SC backend API

## Environment Variables

Create a `.env` file in the frontend project root and define the backend API base URL:

```env
REACT_APP_API_URL=your-backend-api-base-url
```

Use environment-specific values for local development, staging, and production. Do not commit real deployment URLs, API keys, tokens, or private service details.

## Installation

```bash
npm install
```

## Available Scripts

Start the development server:

```bash
npm start
```

The app runs at `http://localhost:3000` by default.

Create a production build:

```bash
npm run build
```

Run tests in watch mode:

```bash
npm test
```

## Project Structure

```text
frontend/
├── public/
│   ├── index.html
│   └── logo.PNG
├── src/
│   ├── api/
│   │   └── api.js
│   ├── components/
│   │   ├── Analytics.js
│   │   ├── BlockchainLog.js
│   │   ├── DataOwnerUpload.js
│   │   ├── DataRequester.js
│   │   ├── DatasetTable.js
│   │   ├── DisasterCenter.js
│   │   ├── Header.js
│   │   ├── ImportDataset.js
│   │   └── LiveDataGenerator.js
│   ├── App.js
│   ├── index.js
│   └── style.css
├── package.json
└── readme.md
```

## Backend Integration

The frontend communicates with the backend through the configured `REACT_APP_API_URL` value. Keep endpoint-level documentation, deployment URLs, and credentials outside this public README.

## Usage Flow

1. Start the backend API and confirm it is healthy.
2. Start the frontend with `npm start`.
3. Upload data manually or import a CSV dataset.
4. Use the data requester panel to test role and attribute policies.
5. Review the blockchain log and verify generated audit events.
6. Start the live data generator to populate monitoring and analytics views.
7. Use the disaster center and analytics dashboard to inspect real-time behavior.

## Troubleshooting

### Cannot connect to backend

- Confirm the backend is running.
- Confirm `REACT_APP_API_URL` points to the backend API base URL.
- Confirm the backend `FRONTEND_URL` setting allows the frontend origin.

### Charts do not render

- Confirm data exists in the backend.
- Confirm the browser console has no API or JavaScript errors.
- Reinstall dependencies with `npm install` if `recharts` is missing.

### Production API calls fail

- Rebuild after changing `REACT_APP_API_URL`; Create React App embeds environment variables at build time.
- Confirm the deployed backend CORS allowlist includes the deployed frontend URL.
- Confirm sensitive URLs and credentials are configured in the deployment provider, not committed to the repository.

## Author

- GitHub: [@NissanJK](https://github.com/NissanJK)
- Email: jawadul.karim78@gmail.com
