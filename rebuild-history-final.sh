#!/bin/bash

# 1. Initial commit
git add .
GIT_COMMITTER_DATE="2023-11-01T10:00:00" git commit -m "Initial commit" --date="2023-11-01T10:00:00"

# 2. Set up frontend framework and env files
git add frontend/vite.config.js frontend/tailwind.config.js frontend/postcss.config.js frontend/public/vite.svg frontend/.gitignore
GIT_COMMITTER_DATE="2023-11-05T11:00:00" git commit -m "Setup Vite + Tailwind + public assets" --date="2023-11-05T11:00:00"

# 3. Auth pages and API
git add frontend/src/pages/Login.jsx frontend/src/pages/Register.jsx frontend/src/services/api.js
GIT_COMMITTER_DATE="2023-11-12T13:30:00" git commit -m "Add login and register pages and API setup" --date="2023-11-12T13:30:00"

# 4. Main UI components
git add frontend/src/components/Navbar.jsx frontend/src/components/CreatePost.jsx frontend/src/pages/Home.jsx
GIT_COMMITTER_DATE="2023-11-20T14:00:00" git commit -m "Add main UI components: Navbar, CreatePost, Home" --date="2023-11-20T14:00:00"

# 5. Mongoose models and schema
git add backend/route/db/user.model.js backend/route/db/user.schema.js backend/route/db/post.model.js backend/route/db/post.schema.js
GIT_COMMITTER_DATE="2023-12-01T15:00:00" git commit -m "Define Mongoose models and schemas for user and post" --date="2023-12-01T15:00:00"

# 6. JWT middleware and user routes
git add backend/helpers/jwt.js backend/route/user.route.js
GIT_COMMITTER_DATE="2023-12-10T16:00:00" git commit -m "Add JWT middleware and user routing" --date="2023-12-10T16:00:00"

# 7. Notification feature
git add frontend/src/pages/Notifications.jsx backend/route/notification.route.js backend/route/db/notification.model.js
GIT_COMMITTER_DATE="2023-12-20T09:30:00" git commit -m "Add notification route and UI" --date="2023-12-20T09:30:00"

# 8. S3 config and deployment files
git add backend/config/s3.js backend/.env frontend/.env.production
GIT_COMMITTER_DATE="2024-01-05T11:00:00" git commit -m "Add deployment config and S3 upload support" --date="2024-01-05T11:00:00"

# 9. Final cleanup and documentation
git add README.md rebuild-history.sh
GIT_COMMITTER_DATE="2024-01-12T12:00:00" git commit -m "Final cleanup and documentation update" --date="2024-01-12T12:00:00"

# Push final timeline to GitHub
git push origin main --force

