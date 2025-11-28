#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Google Chrome
apt-get update
apt-get install -y procps
wget -O /tmp/google-chrome-stable_current_amd64.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
apt-get install -y /tmp/google-chrome-stable_current_amd64.deb
rm /tmp/google-chrome-stable_current_amd64.deb

# Your other build commands...
