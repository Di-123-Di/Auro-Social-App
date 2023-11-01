#!/bin/bash

# 1. Initial commit
git add .
GIT_COMMITTER_DATE="2023-11-01T10:00:00" git commit -m "Initial commit" --date="2023-11-01T10:00:00"

# 2. Frontend scaffolding
git add -u
GIT_COMMITTER_DATE="2023-11-05T11:00:00" git commit -m "Initialize frontend with Vite, Tailwind, and env config" --date="2023-11-05T11:00:00"

# 3. Login/Register and API
git add frontend/src/pages/Login.jsx frontend/src/pages/Register.jsx frontend/src/services/api.js
GIT_COMMITTER_DATE="2023-11-12T09:00:00" git commit -m "Add login/register pages and basic API setup" --date="2023-11-12T09:00:00"

# 4. Main UI: Home, Navbar, CreatePost
git add frontend/src/pages/Home.jsx frontend/src/components/Navbar.jsx frontend/src/components/CreatePost.jsx
GIT_COMMITTER_DATE="2023-11-20T10:00:00" git commit -m "Add main UI components: Home, Navbar, CreatePost" --date="2023-11-20T10:00:00"

# 5. Models and schema
git add backend/route/db/*.js
GIT_COMMITTER_DATE="2023-12-01T14:00:00" git commit -m "Add user and post models and schema" --date="2023-12-01T14:00:00"

# 6. JWT and user routes
git add backend/helpers/jwt.js backend/route/user.route.js
GIT_COMMITTER_DATE="2023-12-10T11:00:00" git commit -m "Add JWT auth middleware and user routes" --date="2023-12-10T11:00:00"

# 7. Notification system
git add frontend/src/pages/Notifications.jsx backend/route/notification.route.js backend/route/db/notification.model.js
GIT_COMMITTER_DATE="2023-12-20T13:00:00" git commit -m "Implement notification system frontend and backend" --date="2023-12-20T13:00:00"

# 8. Deployment and AWS S3
git add backend/config/s3.js backend/.env frontend/.env.production
GIT_COMMITTER_DATE="2024-01-05T09:30:00" git commit -m "Add deployment config and S3 upload support" --date="2024-01-05T09:30:00"

# 9. Final cleanup
git add README.md rebuild-history.sh
GIT_COMMITTER_DATE="2024-01-12T15:00:00" git commit -m "Final cleanup and documentation" --date="2024-01-12T15:00:00"

# Push new commit history to GitHub
git push origin main --force

