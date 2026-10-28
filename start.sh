#!/bin/bash
set -euo pipefail

mkdir -p /tmp/mongodb-data

if command -v mongod >/dev/null 2>&1; then
  if ! pgrep -x mongod > /dev/null; then
    echo "Starting MongoDB..."
    mongod --dbpath /tmp/mongodb-data --fork --logpath /tmp/mongodb.log --bind_ip 127.0.0.1
    sleep 2
    echo "MongoDB started."
  else
    echo "MongoDB already running."
  fi
else
  echo "mongod not found. Falling back to an in-memory MongoDB instance for local development."
fi

(cd backend && npm install --silent && npm run dev) &
BACKEND_PID=$!

(cd frontend && npm install --silent && npm run dev) &
FRONTEND_PID=$!

wait $FRONTEND_PID $BACKEND_PID
