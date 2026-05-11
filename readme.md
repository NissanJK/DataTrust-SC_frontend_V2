# DataTrust-SC Frontend - A Trusted and Privacy-Preserving Data Distribution Framework for Smart Cities

## 📋 Overview

React-based frontend application for DataTrust-SC - a privacy-preserving smart city data sharing system with real-time disaster monitoring, live analytics, and interactive data visualization.

## 🚀 Features

- ✅ **Data Owner Upload** - Secure data submission with policy configuration
- ✅ **Data Requester Interface** - Policy-based data access requests
- ✅ **Live Data Generator** - Real-time sensor simulation with realistic patterns
- ✅ **Disaster Warning Center** - Real-time monitoring across 5 city sectors
- ✅ **Analytics Dashboard** - 7 interactive charts for blockchain metrics
- ✅ **Blockchain Audit Log** - Immutable transaction history viewer
- ✅ **Dataset Management** - View, import, export data with scrollable tables
- ✅ **System Reset** - Clean database with confirmation dialog
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Real-Time Updates** - Auto-refresh every 3-5 seconds

## 🛠️ Tech Stack

- **Framework:** React 18
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Styling:** CSS3 with Gradients
- **Build Tool:** Create React App
- **State Management:** React Hooks (useState, useEffect, useCallback)

## 📁 Project Structure

```
DataTrust-SC_frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/           # React components
│   │   ├── Header.js                # App header with reset button
│   │   ├── DataOwnerUpload.js       # Data submission form
│   │   ├── DataRequester.js         # Access request interface
│   │   ├── ImportDataset.js         # CSV import component
│   │   ├── LiveDataGenerator.js     # Real-time data simulation
│   │   ├── DatasetTable.js          # Dataset viewer with scrolling
│   │   ├── BlockchainLog.js         # Audit log viewer
│   │   ├── DisasterCenter.js        # Disaster monitoring dashboard
│   │   ├── Analytics.js             # Analytics & charts dashboard
│   │   ├── SectorDetails.js         # Detailed sector monitoring
│   │   ├── DisasterCenter.css       # Disaster center styles
│   │   ├── Analytics.css            # Analytics styles
│   │   └── SectorDetails.css        # Sector details styles
│   ├── api/
│   │   └── api.js            # Axios configuration
│   ├── App.js                # Main app component
│   ├── index.js              # React entry point
│   └── style.css             # Global styles
├── .env.production           # Production environment variables
├── package.json              # Dependencies
└── README.md                 # This file
```

## 📦 Installation

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Backend server running (see backend README)

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/NissanJK/DataTrust-SC_frontend.git
```

2. **Install dependencies**
```bash
npm install
```

4. **Start development server**
```bash
npm start
```
Application runs at: `http://localhost:3000`

## 🎨 Components Guide

### Header
- App title and description
- **Reset System** button with confirmation dialog
- Deletes all database data and refreshes page

### Data Owner Upload
- Form for manual data submission
- **Sector dropdown** (sector1-5)
- **Policy dropdown** with 3 predefined options + custom
- Validates required fields
- Shows loading state
- Auto-resets after successful upload

### Data Requester
- Access request interface
- Select data category, role, and attribute
- Policy evaluation
- Displays granted records with decrypted data
- Shows access denied message if policy not met

### Import Dataset
- CSV file upload (max 10MB)
- File type validation
- Progress indicator
- Shows import statistics (imported/errors/total)

### Live Data Generator
- **Real-time simulation** following Python generator rules
- Provider → Category mapping
- Category → Field filtering
- Normal distribution (Temperature: μ=27, AQI: μ=170, etc.)
- Configurable interval (2s, 5s, 10s, 30s)
- Sector rotation option
- Start/Stop controls

### Dataset Table
- Displays all records with pagination
- **Scrollable** after 50 records (max-height: 600px)
- Shows: Data Owner, Sector,	Provider,	Category	Temp (°C),	AQI,	Traffic,	Energy (kWh),	TX Cost (Gas),	Auth Latency (s),	Hash
- Sticky header
- Export to CSV button
- Auto-refresh every 3 seconds

### Blockchain Log
- **Unlimited scrollable** audit trail
- Filter by type (All, Data Register, Access Request)
- Shows: Timestamp, Type, Hash, Owner, Role, Policy, Granted status
- Auto-refresh every 3 seconds

### Disaster Warning Center
- **Real-time monitoring** of 5 sectors
- Status cards (Critical, Warning, Caution, Total alerts)
- **Sector status grid** with color indicators
- Filters by severity and sector
- **Scrollable alerts** list (max-height: 600px)
- Alert deduplication (shows only latest per type)
- Auto-refresh every 5 seconds

### Analytics Dashboard
- **6 interactive charts:**
  1. Gas Cost Over Time (Line)
  2. Latency Over Time (Area)
  3. Gas by Sector (Bar)
  4. Latency by Provider (Bar)
  5. Sector Distribution (Pie)
  6. Gas Cost Distribution (Histogram)
  7. Gas Cost vs Latency (Scatter Diagram)
- **4 statistics cards**
- Time range filter (All, 24h, 1h)
- Summary table
- Auto-refresh every 5 seconds

### Sector Details (Optional)
- Detailed monitoring for individual sector
- Current and average metrics
- Temperature, AQI, Traffic, Energy
- Sector-specific alerts
- Auto-refresh every 5 seconds

## 🎯 Key Features Explained

### Real-Time Updates
All components auto-refresh:
- Dataset Table: 3 seconds
- Blockchain Log: 3 seconds
- Disaster Center: 5 seconds
- Analytics: 5 seconds

### Scrollable Tables
- Dataset Table: max-height 600px
- Blockchain Log: max-height 400px
- Disaster Alerts: max-height 600px
- Custom gradient scrollbars

### Policy Management
Three predefined policies:
1. **Public Access:** All roles + public attribute
2. **Authority & Researcher (Private):** Restricted access
3. **Authority & Citizen (Public):** Mixed access

Plus custom policy input for flexibility.

### Live Data Generation
Follows exact Python generator rules:
- Provider determines category
- Category determines fields
- Normal distributions for all values
- Realistic blockchain metrics

### Disaster Detection
- Temperature thresholds (NORMAL/CAUTION/WARNING/CRITICAL)
- AQI levels (Good/Moderate/Unhealthy/Hazardous)
- Traffic density monitoring
- Energy consumption tracking
- Multi-factor disaster detection

## 🎨 Styling

### Color Scheme
- **Primary:** #667eea (Purple)
- **Secondary:** #764ba2 (Dark Purple)
- **Success:** #28a745 (Green)
- **Warning:** #ffc107 (Yellow)
- **Danger:** #dc3545 (Red)

### Gradients
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Success gradient */
background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);

/* Danger gradient */
background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
```

### Responsive Breakpoints
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

### Mobile Optimizations
- Stacked layouts on small screens
- Touch-friendly buttons
- Scrollable tables
- Collapsible sections
- Readable font sizes

### Tested On
- ✅ Chrome (Desktop & Mobile)

## 🧪 Testing

### Manual Testing
1. **Data Upload:**
   - Fill form
   - Submit
   - Verify in Dataset Table

2. **Live Generator:**
   - Click "Start Live"
   - Watch data appear
   - Check disaster alerts trigger
   - Click "Stop"

3. **Disaster Monitoring:**
   - Generate high-value data
   - Watch sector status change
   - See alerts appear
   - Generate normal data
   - Watch status return to normal

4. **Analytics:**
   - Check all 7 charts render
   - Test time range filter
   - Verify auto-refresh

5. **Reset System:**
   - Click reset button
   - Confirm
   - Verify all data deleted

### Browser Testing
```bash
# Open in different browsers
open http://localhost:3000

# Test responsive
# Try different screen sizes
```

## 🐛 Troubleshooting

### Cannot connect to backend
```
Error: Network Error
```
**Solution:**
- Check backend is running on port 5000
- Verify REACT_APP_API_URL is correct
- Check CORS settings in backend

### Charts not rendering
```
Error: Cannot read property 'map' of undefined
```
**Solution:**
```bash
# Install recharts
npm install recharts

# Check console for errors
# Verify data structure
```

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.0",
  "recharts": "^2.10.0"
}
```

### Dev Dependencies
```json
{
  "react-scripts": "5.0.1"
}
```

## 🎓 For Thesis

### Key Points to Highlight

1. **Privacy-Preserving:**
   - Client-side display only
   - Encrypted storage
   - Policy-based access

2. **Real-Time Monitoring:**
   - Auto-refresh components
   - Live data simulation
   - Dynamic disaster detection

3. **User Experience:**
   - Intuitive interface
   - Responsive design
   - Visual feedback

4. **Data Visualization:**
   - 7 interactive charts
   - Real-time statistics
   - Trend analysis

<!-- ### Screenshots to Include
1. Full dashboard view
2. Data upload form
3. Disaster monitoring (with alerts)
4. Analytics dashboard
5. Mobile responsive view -->

## 🔐 Security

### Best Practices Implemented
- ✅ Environment variables for API URLs
- ✅ No sensitive data in client code
- ✅ Input validation
- ✅ XSS prevention
- ✅ CORS handling

<!-- ### Additional Recommendations
- Add authentication (JWT)
- Implement rate limiting
- Add CAPTCHA for forms
- Enable Content Security Policy (CSP) -->

## 👨‍💻 Author

**Your Name**
- GitHub: [@NissanJK](https://github.com/NissanJK)
- Email: jawadul.karim78@gmail.com

