#!/bin/bash

echo "🚀 Starting PrepGenius Backend Setup..."

# Step 1: Detect OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  PYTHON_BIN="src/features/env/Scripts/python.exe"
  echo "🪟 Detected Windows"
else
  PYTHON_BIN="src/features/env/bin/python"
  echo "🐧 Detected Linux/macOS"
fi

# Step 2: Create Python virtual environment if it doesn't exist
if [ ! -d "src/features/env" ]; then
  echo "📦 Creating Python virtual environment..."
  python3.11 -m venv src/features/env
else
  echo "✅ Python virtual environment already exists."
fi

# Step 3: Upgrade pip and install Python dependencies
echo "📚 Installing Python dependencies..."
$PYTHON_BIN --version
$PYTHON_BIN -m pip install --upgrade pip
$PYTHON_BIN -m pip install -r src/features/requirements.txt

# Step 4: Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Step 5: Start the backend (Node + FastAPI)
echo "🚀 Starting the backend (Node + FastAPI)..."
npm run start
