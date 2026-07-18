#!/bin/sh
set -e

echo "Running migrations..."
node server/migrations/run.js

echo "Starting server..."
exec node server/index.js
