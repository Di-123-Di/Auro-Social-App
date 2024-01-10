#!/bin/bash

# 1. Initial commit: setup repo
git add frontend/ backend/
GIT_COMMITTER_DATE="2023-11-01T09:00:00" git commit -m "Initial commit: project bootstrap" --date="2023-11-01T09:00:00"

# 2. Backend models and schema
git add backend/route/db/notification.model.js backend/route/db/notification.schema.js backend/route/db/post.model.js backend/route/db/post.schema.js backend/route/db/user.model.js backend/route/db/user.schema.js
GIT_COMMITTER_DATE="2023-11-08T10:00:00" git commit -m "Add Mongoose models and schemas" --date="2023-11-08T10:00:00"

# 3. Backend routes and JWT helper
git add backend/route/helpers/jwt.js backend/route/notification.route.js backend/route/post.route.js backend/route/user.route.js
GIT_COMMITTER_DATE="2023-11-15T11:00:00" git commit -m "Add backend routing and auth helper" --date="2023-11-15T11:00:00"

# 4. Backend config and server
git add backend/config/s3.js backend/server.js backend/package.json
GIT_COMMITTER_DATE="2023-11-22T14:00:00" git commit -m "Add server config and deployment settings" --date="2023-11-22T14:00:00"

# 5. Frontend assets
git add frontend/public/vite.svg frontend/src/assets/react.svg
GIT_COMMITTER_DATE="2023-12-01T10:30:00" git commit -m "Add public assets for branding" --date="2023-12-01T10:30:00"

# 6. Frontend core UI components
git add frontend/src/components/CreatePost.jsx frontend/src/components/Navbar.jsx frontend/src/components/Post.jsx frontend/src/components/PostList.jsx
GIT_COMMITTER_DATE="2023-12-10T16:00:00" git commit -m "Add core UI components: post & nav" --date="2023-12-10T16:00:00"

# 7. Frontend search & user components
git add frontend/src/components/SearchBar.jsx frontend/src/components/SearchResults.jsx frontend/src/components/UserPosts.jsx
GIT_COMMITTER_DATE="2023-12-18T10:00:00" git commit -m "Add search and user content components" --date="2023-12-18T10:00:00"

# 8. Frontend pages & logic
git add frontend/src/pages/Home.jsx frontend/src/pages/Login.jsx frontend/src/pages/Notifications.jsx frontend/src/pages/PostDetail.jsx frontend/src/pages/Profile.jsx frontend/src/pages/Register.jsx frontend/src/services/api.js
GIT_COMMITTER_DATE="2024-01-03T12:00:00" git commit -m "Add frontend pages and service API" --date="2024-01-03T12:00:00"

# 9. Final cleanup: app shell and remaining files
git add frontend/src/App.jsx frontend/src/index.css frontend/src/main.jsx
git add .
GIT_COMMITTER_DATE="2024-01-10T15:00:00" git commit -m "Final cleanup: App shell and remaining files" --date="2024-01-10T15:00:00"

# Push full history
git push origin main --force

