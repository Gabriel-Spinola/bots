
echo "Starting ngrok..."
node src/app.mjs & ngrok http 3000 &

sleep 2

 # Replace 3000 with the port your Node.js server is running on



# Start ngrok in the background


# Wait for both processes to finish
wait