FROM node:20-slim

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source
COPY . .

# Bot reads its Discord token, Mongo URI, etc. from .env / process env
# Pass these at runtime instead of baking them into the image:
# TOKEN, MONGO_DB_CONNECTION_STRING, PORT, PREFIX, ACTIVITY_NAME, ACTIVITY_STATUS,
# CLIENT_ID, DEV_ID, DEV_GUILD_ID, JOIN_LOG_CHANNEL_ID, LEAVE_LOG_CHANNEL_ID,
# COMMAND_EXECUTION_LOG_CHANNEL_ID, CRASH_LOG_CHANNEL_ID, ERROR_LOG_CHANNEL_ID,
# PRIMARY_EMBED_COLOR, INVISIBLE_EMBED_COLOR, ALERT_EMBED_COLOR

EXPOSE 3000

CMD ["npx", "tsx", "./src/index.ts"]