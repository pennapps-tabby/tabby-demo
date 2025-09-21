# Tabby - AI-Powered Bill Splitter

A modern web application that uses AI to parse receipts and split bills among friends with Venmo integration.

## Features

- 📸 **AI Receipt Parsing**: Upload a photo of your receipt and let Google Gemini AI extract items and prices
- 👥 **Smart Bill Splitting**: Assign items to specific people for proportional splitting with tax and tip distribution
- 💳 **Venmo Integration**: Generate QR codes and payment page links for easy payments
- 📱 **Mobile-Friendly**: Responsive design that works great on phones
- ⚡ **Real-time Calculation**: Instant split calculations as you assign items
- 📊 **Payment Tracking**: Track who has paid and who still owes money
- 📱 **SMS Reminders**: Send text message reminders with payment links
- 📚 **Bill History**: View and manage your past bills with payment status
- 🔄 **Payment Status Updates**: Toggle paid status and see outstanding amounts in real-time

## Tech Stack

### Backend

- **FastAPI**: Modern Python web framework
- **MongoDB**: Cloud database for storing bill data
- **Google Gemini**: AI Vision API for receipt parsing
- **Pillow**: Image processing
- **QRCode**: Generate payment QR codes
- **PyMongo**: MongoDB driver for Python

### Frontend

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Vite**: Fast build tool and dev server
- **Headless UI**: Accessible UI components
- **Heroicons**: Beautiful SVG icons
- **QRCode**: Client-side QR code generation

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

- **Gemini API Key (Required)**: Get from https://aistudio.google.com/app/apikey
  - Used for AI-powered receipt parsing
  - Gemini has excellent vision capabilities for receipt parsing
- **MongoDB URI (Required)**: Get from https://www.mongodb.com/atlas
  - Used for storing bill data in the cloud

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

## Deployment

You can deploy this application for free using Vercel (for the frontend) and Render (for the backend).

### Backend Deployment (Render)

1.  **Create a new Web Service** on Render and connect your GitHub repository.
2.  **Settings**:
    - **Name**: `tabby-backend` (or your choice)
    - **Root Directory**: `backend`
    - **Environment**: `Python 3`
    - **Region**: Choose a region close to you.
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    - **Instance Type**: `Free`
3.  **Add Environment Variables**:
    - `GEMINI_API_KEY`: Your Google Gemini API key.
    - `MONGO_URI`: Your MongoDB connection string.
    - `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://your-app.vercel.app`).
    - `PYTHON_VERSION`: `3.9`
4.  Click **Create Web Service**. After the first build, your API will be live.

### Frontend Deployment (Vercel)

1.  **Create a new Project** on Vercel and import your GitHub repository.
2.  Vercel will automatically detect the framework as Vite.
3.  **Configure Project**:
    - Expand the **Environment Variables** section.
    - Add `VITE_API_BASE_URL` and set its value to your Render backend URL (e.g., `https://tabby-backend.onrender.com`).
4.  Click **Deploy**. Your site will be live in a few moments.

The `vercel.json` file included in the frontend directory ensures that client-side routing works correctly on Vercel.

## API Endpoints

- `POST /api/upload-receipt` - Upload and parse a receipt image
- `GET /api/bills/{bill_id}` - Get bill data by ID
- `POST /api/bills/{bill_id}/assign` - Assign items to people and calculate splits
- `POST /api/bills/{bill_id}/toggle-paid` - Toggle paid status for a person
- `GET /api/bills/{bill_id}/payment-links` - Generate Venmo payment links and QR codes
- `GET /api/health` - Health check endpoint

## Usage

1. **Upload Receipt**: Take a photo of your receipt and upload it
2. **Review Items**: Check that the AI correctly parsed all items and prices
3. **Assign Items**: Add people and assign specific items to them
4. **Generate Payments**: Create Venmo links and QR codes for each person
5. **Track Payments**: Monitor who has paid and send SMS reminders
6. **View History**: Access your bill history and payment status

## Development

### Project Structure

```
tabby-demo/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic data models
│   ├── database.py          # MongoDB database operations
│   ├── vision_service.py    # Google Gemini AI integration
│   ├── utils.py             # Helper functions
│   ├── uploads/             # Temporary image storage
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.jsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json
├── vercel.json              # Vercel deployment configuration
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details
