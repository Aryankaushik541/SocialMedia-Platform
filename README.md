# CodeAlpha Task 2 — Mini Social Media Platform

A mini social network built with **Express.js + MongoDB** and a **vanilla HTML/CSS/JS** frontend, per the CodeAlpha task sheet.

## Features
- 👤 **User profiles** (name, @username, bio, avatar, follower/following counts, editable)
- 📝 **Posts & comments** — create/delete posts (text + optional image URL), threaded comments
- ❤️ **Like** system (toggle) and 🔁 **follow / unfollow** system
- 🏠 **Home feed** = your posts + people you follow; **Explore** = public timeline
- 🔎 People search + "who to follow" suggestions
- 🔐 JWT auth (httpOnly cookie) + bcrypt hashing, helmet, rate limiting, validation

## Tech stack
Node.js · Express · MongoDB (Mongoose) · JWT · bcryptjs · Vanilla JS frontend

## Setup
```bash
npm install
cp .env.example .env      # set JWT_SECRET and MONGO_URI
npm run seed              # 3 demo users + posts (login: aryan@demo.com / password123)
npm start                 # http://localhost:5002
```

## API overview
| Method | Endpoint | Description |
|-------|----------|-------------|
| POST | `/api/auth/register` \| `/login` \| `/logout` | Auth |
| GET | `/api/auth/me` | Current user |
| GET | `/api/posts` | Home feed (following + self) |
| GET | `/api/posts/explore` | Public timeline |
| POST | `/api/posts` | Create post |
| DELETE | `/api/posts/:id` | Delete own post |
| POST | `/api/posts/:id/like` | Toggle like |
| GET/POST | `/api/posts/:id/comments` | List / add comments |
| GET | `/api/users/:username` | Public profile + posts |
| PUT | `/api/users/me` | Update own profile |
| POST | `/api/users/:id/follow` | Toggle follow |
| GET | `/api/users?search=` | Find people |

## Data models
- **User** — name, username, email, password, bio, avatar, `followers[]`, `following[]`
- **Post** — author, text, image, `likes[]`, commentsCount
- **Comment** — post, author, text

## Tests
```bash
npm test
```
Jest + Supertest + in-memory MongoDB (`mongodb-memory-server`).
