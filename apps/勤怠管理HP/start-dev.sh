#!/bin/bash
cd "$(dirname "$0")/hp-project"
exec ./node_modules/.bin/vite --port 5174
