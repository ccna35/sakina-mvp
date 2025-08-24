# Sakina — Islamic Marriage App (MVP)
Node.js + TypeScript + MySQL + Socket.IO

## Quick start
1) Copy `.env.example` → `.env` and fill values.
2) Create database and run SQL migrations in `migrations/`:
   ```bash
   mysql -u root -p < migrations/001_init_users.sql
   mysql -u root -p < migrations/002_profiles.sql
   mysql -u root -p < migrations/003_likes_matches.sql
   mysql -u root -p < migrations/004_chat_messages.sql
   mysql -u root -p < migrations/005_wali_requests.sql
   mysql -u root -p < migrations/006_moderation_audit.sql
   ```
3) Install & run:
   ```bash
   npm i
   npm run dev
   ```

Default chat rules: 72h window, 20 msgs/day/user, moderators can view chats.
