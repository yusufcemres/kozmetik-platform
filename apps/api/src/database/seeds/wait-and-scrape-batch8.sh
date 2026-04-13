#!/bin/bash
# Wait for main Bing scraper (PID 1620) to finish, then run batch8 scraper
echo "Waiting for main scraper (PID 1620) to finish..."

while kill -0 1620 2>/dev/null; do
  sleep 30
done

echo "Main scraper finished! Starting batch8 scraper..."
cd "c:/Users/Yusuf Cemre/OneDrive/Desktop/kozmetik-platform/apps/api"
node src/database/seeds/scrape-images-batch8.js 2>&1 | tee src/database/seeds/bing-batch8-log.txt
echo "Batch8 scraper complete!"
