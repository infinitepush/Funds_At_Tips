#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install pipenv

# Frontend build
echo "Building frontend..."
rm -rf frontend/dist
cd frontend
npm install
npm run build
cd ..

# Backend build
echo "Building backend..."
cd backend
pipenv lock -r > requirements.txt
pip install -r requirements.txt
cd ..


# Install Google Chrome
STORAGE_DIR=/opt/render/project/.render
if [[ ! -d $STORAGE_DIR/chrome ]]; then
  echo "...Downloading Chrome"
  mkdir -p $STORAGE_DIR/chrome
  cd $STORAGE_DIR/chrome
  wget -P ./ https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  dpkg -x ./google-chrome-stable_current_amd64.deb $STORAGE_DIR/chrome
  rm ./google-chrome-stable_current_amd64.deb
  cd $HOME/project/src # Come back to the project's root directory
else
  echo "...Using Chrome from cache"
fi

echo "Build successful!"