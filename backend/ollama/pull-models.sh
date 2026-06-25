#!/bin/bash
# Start the Ollama server and pull the curated set of small (2-4B) models.
set -e

./bin/ollama serve &
pid=$!

# Wait for the server to accept connections.
until ollama list >/dev/null 2>&1; do
  echo "Waiting for Ollama to start..."
  sleep 1
done

MODELS=(
  "gemma2:2b"
  "llama3.2:3b"
  "qwen2.5:3b"
  "dolphin-phi"
)

for model in "${MODELS[@]}"; do
  echo "Pulling ${model}..."
  ollama pull "${model}"
done

echo "All models pulled."
wait $pid
