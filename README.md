# SplitSmart - AI-Powered Bill Splitter

A modern web application that uses AI to parse receipts and split bills among friends with Venmo integration.

## Features

- 📸 **AI Receipt Parsing**: Upload a photo of your receipt and let AI extract items and prices
- 👥 **Smart Bill Splitting**: Assign items to specific people for proportional splitting
- 💳 **Venmo Integration**: Generate QR codes and deep links for easy payments
- 📱 **Mobile-Friendly**: Responsive design that works great on phones
- ⚡ **Real-time Calculation**: Instant split calculations as you assign items

## Tech Stack

### Backend

- **FastAPI**: Modern Python web framework
- **SQLite**: Lightweight database for storing bill data
- **Cerebras AI**: Primary API for receipt parsing
- **Google Gemini**: Vision API for receipt parsing
- **Pillow**: Image processing
- **QRCode**: Generate payment QR codes

### Frontend

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Vite**: Fast build tool and dev server

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+ (see installation instructions below)
- npm (comes with Node.js)

### Installing Node.js

**Option 1: Download from official website (Recommended)**

1. Go to https://nodejs.org/
2. Download the LTS version (Long Term Support)
3. Run the installer and follow the instructions
4. Verify installation: `node --version` and `npm --version`

**Option 2: Using a package manager**

- **Windows (with Chocolatey)**: `choco install nodejs`
- **Windows (with Winget)**: `winget install OpenJS.NodeJS`
- **macOS (with Homebrew)**: `brew install node`
- **Linux (Ubuntu/Debian)**: `sudo apt install nodejs npm`
- **Linux (CentOS/RHEL)**: `sudo yum install nodejs npm`

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

```bash
cp env_example.txt .env
# Edit .env and add your API keys
```

**API Keys Setup:**

- **Cerebras API Key (Required)**: Get from https://cerebras.ai
- **Gemini API Key (Required)**: Get from https://aistudio.google.com/app/apikey
  - Used as fallback when Cerebras fails
  - Gemini has excellent vision capabilities for receipt parsing

5. Run the backend server:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

- `POST /api/upload-receipt` - Upload and parse a receipt image
- `GET /api/bills/{bill_id}` - Get bill data by ID
- `POST /api/bills/{bill_id}/assign` - Assign items to people and calculate splits
- `GET /api/bills/{bill_id}/payment-links` - Generate Venmo payment links
- `GET /api/health` - Health check endpoint

## Usage

1. **Upload Receipt**: Take a photo of your receipt and upload it
2. **Review Items**: Check that the AI correctly parsed all items and prices
3. **Assign Items**: Add people and assign specific items to them
4. **Generate Payments**: Create Venmo links and QR codes for each person

## Development

### Project Structure

```
bill-splitter-app/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic data models
│   ├── database.py          # SQLite database operations
│   ├── vision_service.py    # AI vision API integration
│   ├── utils.py             # Helper functions
│   ├── uploads/             # Temporary image storage
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.jsx          # Main application component
│   └── package.json
└── README.md
```

### Key Components Explained

#### React Components (for Java developers)

**Components** are like Java classes that represent UI elements. They can have:

- **State**: Internal data that can change (like instance variables)
- **Props**: Data passed from parent components (like constructor parameters)
- **Lifecycle methods**: Functions that run at specific times (like constructors/destructors)

**Hooks** are special functions that let you use state and lifecycle features in functional components:

- `useState`: Manages component state
- `useEffect`: Runs code when component mounts or updates
- `useNavigate`: Programmatic navigation (like redirects)

**JSX** is like a template language that looks like HTML but is actually JavaScript:

```jsx
// This JSX:
<div className="container">
  <h1>Hello {name}</h1>
</div>

// Compiles to JavaScript that creates DOM elements
```

**Event Handling** is similar to Java event listeners:

```jsx
// Button click handler
<button onClick={() => handleClick()}>Click me</button>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details
