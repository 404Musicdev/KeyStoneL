To run the Homeschool Hub application locally, you'll need to install the following dependencies and follow these setup steps:

System Requirements
Python 3.11+
Node.js 18+ and Yarn
MongoDB (local installation or MongoDB Atlas)
Backend Setup
Install Python dependencies:
cd backend
pip install -r requirements.txt
Key Python packages that will be installed:
fastapi==0.110.1
uvicorn==0.25.0
pymongo==4.5.0
motor==3.3.1
pydantic>=2.6.4
python-dotenv>=1.0.1
bcrypt
python-jose[cryptography]
axios (for API calls if needed)
Install the special Emergent Integrations library:
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
Set up environment variables in /backend/.env:
MONGO_URL="mongodb://localhost:27017"
DB_NAME="homeschool_hub"
CORS_ORIGINS="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key-here"
Frontend Setup
Install Node.js dependencies:
cd frontend
yarn install
Key packages that will be installed:
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.5.1",
    "axios": "^1.8.4",
    "lucide-react": "^0.507.0",
    "tailwindcss": "^3.4.17",
    "@radix-ui/react-*": "various UI components",
    "sonner": "^2.0.3",
    "class-variance-authority": "^0.7.1",
    "tailwind-merge": "^3.2.0"
  }
}
Set up environment variables in /frontend/.env:
REACT_APP_BACKEND_URL=http://localhost:8001
MongoDB Setup
Option A: Local MongoDB

# Install MongoDB Community Edition
# On macOS:
brew install mongodb/brew/mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
Option B: MongoDB Atlas (Cloud)

Create free account at mongodb.com
Create cluster and get connection string
Update MONGO_URL in backend/.env
API Key Setup
You'll need a Gemini API key from Google AI Studio:

Go to https://ai.google.dev/
Get API key
Add to backend/.env as GEMINI_API_KEY
Running the Application
Start Backend:
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
Start Frontend:
cd frontend
yarn start
Access the application:
Frontend: http://localhost:3000
Backend API: http://localhost:8001
Quick Install Script
Here's a complete setup script:

#!/bin/bash

# Install backend dependencies
cd backend
pip install -r requirements.txt
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Install frontend dependencies  
cd ../frontend
yarn install

# Create environment files
echo "MONGO_URL=\"mongodb://localhost:27017\"
DB_NAME=\"homeschool_hub\"
CORS_ORIGINS=\"http://localhost:3000\"
GEMINI_API_KEY=\"your-api-key-here\"" > ../backend/.env

echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

echo "Setup complete! Update your API keys in backend/.env then run:"
echo "Backend: cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo "Frontend: cd frontend && yarn start"
Important Notes
Make sure to update the GEMINI_API_KEY in the backend .env file
MongoDB must be running before starting the backend
The frontend runs on port 3000, backend on port 8001
CORS is configured to allow requests from localhost:3000
The application will be fully functional locally with all features including AI assignment generation, student management, grading system, and messaging!
