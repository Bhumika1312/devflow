# DevFlow — Developer Productivity App

<p align="center">
  <img src="assets/icon.png" width="120" height="120" alt="DevFlow Logo" />
</p>

<p align="center">
  <strong>A full-stack cross-platform mobile app built for developers</strong><br/>
  Track DSA practice · Manage focus sessions · Visualize weekly coding progress
</p>

<p align="center">
  <a href="https://expo.dev/artifacts/eas/pUPN2Xq1pJgS5oC9UXoibW3qdLKsvyBX1B1S8Q-08kE.apk">
    <img src="https://img.shields.io/badge/Download-APK-6366f1?style=for-the-badge&logo=android&logoColor=white" alt="Download APK"/>
  </a>
  <a href="https://devflow-backend-08eh.onrender.com">
    <img src="https://img.shields.io/badge/Backend-Live-22c55e?style=for-the-badge&logo=render&logoColor=white" alt="Backend Live"/>
  </a>
  <img src="https://img.shields.io/badge/React_Native-Expo-0ea5e9?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
</p>

---

## Features

| Feature               | Description                                                                    |
| --------------------- | ------------------------------------------------------------------------------ |
| 🧠 **DSA Tracker**    | Add problems with difficulty (Easy/Medium/Hard), topic tags, and solved status |
| ⏱️ **Pomodoro Timer** | 25/5/15 minute sessions with session count and progress tracking               |
| 🎯 **Focus Mode**     | Set session goals with countdown timer and completion history                  |
| 📊 **Dashboard**      | Weekly coding time chart, DSA progress bar, and real-time stats                |
| 🔐 **Auth**           | Secure signup/login with JWT authentication and bcrypt password hashing        |

---

## Screenshots

<p align="center">
  <table>
    <tr>
      <td align="center"><img src="screenshots/login.jpeg" width="180"/><br/><em>Login</em></td>
      <td align="center"><img src="screenshots/signup.jpeg" width="180"/><br/><em>Sign Up</em></td>
      <td align="center"><img src="screenshots/home.jpeg" width="180"/><br/><em>Dashboard</em></td>
    </tr>
    <tr>
      <td align="center"><img src="screenshots/dsa.jpeg" width="180"/><br/><em>DSA Tracker</em></td>
      <td align="center"><img src="screenshots/timer.jpeg" width="180"/><br/><em>Timer</em></td>
      <td align="center"><img src="screenshots/focus.jpeg" width="180"/><br/><em>Focus Mode</em></td>
    </tr>
  </table>
</p>

---

## Tech Stack

### Frontend

- **React Native** + **Expo** (cross-platform mobile)
- **TypeScript** for type safety
- **React Navigation** (Bottom Tab Navigator)
- **Axios** for API calls
- **AsyncStorage** for offline persistence

### Backend

- **Node.js** + **Express.js** REST API
- **PostgreSQL** (hosted on Neon)
- **JWT** authentication
- **bcryptjs** password hashing
- Deployed on **Render**

### DevOps

- **Expo EAS Build** for APK generation
- **GitHub** for version control
- **Neon** for serverless PostgreSQL

---

## Project Structure

```
DevFlow/
├── app/
│   └── index.tsx              # Entry point
├── src/
│   ├── api/
│   │   └── client.ts          # Axios config with JWT interceptor
│   ├── context/
│   │   └── AuthContext.tsx    # Global auth state
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Bottom tab navigation
│   └── screens/
│       ├── AuthScreen.tsx     # Login + Signup
│       ├── HomeScreen.tsx     # Dashboard
│       ├── DSAScreen.tsx      # Problem tracker
│       ├── TimerScreen.tsx    # Pomodoro timer
│       └── FocusScreen.tsx    # Focus mode
├── assets/                    # App icons and images
├── devflow-backend/           # Node.js backend
│   └── src/
│       ├── routes/            # auth, problems, sessions, focus
│       ├── middleware/        # JWT auth middleware
│       └── db/                # PostgreSQL connection
└── eas.json                   # EAS Build config
```

---

## Database Schema

```sql
users         (id, name, email, password, created_at)
dsa_problems  (id, user_id, title, difficulty, topic, status, notes, solved_at)
code_sessions (id, user_id, duration_minutes, date)
focus_goals   (id, user_id, goal, duration_minutes, completed)
```

All tables linked via `user_id` foreign key with `ON DELETE CASCADE`.

---

## API Reference

### Auth

```
POST /api/auth/signup    Create account → returns JWT token
POST /api/auth/login     Login → returns JWT token
```

### Problems

```
GET    /api/problems              Get all problems for user
POST   /api/problems              Add new problem
PATCH  /api/problems/:id/status   Mark solved/unsolved
DELETE /api/problems/:id          Delete problem
```

### Sessions

```
POST  /api/sessions    Save completed Pomodoro session
GET   /api/sessions    Get last 7 days of sessions
```

### Focus

```
POST   /api/focus               Create focus goal
PATCH  /api/focus/:id/complete  Mark goal complete
GET    /api/focus               Get recent goals
```

---

## Installation & Setup

### Prerequisites

- Node.js v18+
- PostgreSQL
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone

### 1. Clone the repository

```bash
git clone https://github.com/Bhumika1312/devflow.git
cd devflow
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Setup backend

```bash
cd devflow-backend
npm install
```

Create `.env` file in `devflow-backend/`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/devflow
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 4. Setup PostgreSQL database

```sql
CREATE DATABASE devflow;
\c devflow

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dsa_problems (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  difficulty VARCHAR(10) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Unsolved',
  notes TEXT,
  solved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE code_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE focus_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Update API URL

In `src/api/client.ts`, update the `baseURL` to your backend URL:

```typescript
const client = axios.create({
  baseURL: "http://YOUR_IP:5000/api", // local
  // baseURL: 'https://your-app.onrender.com/api', // production
});
```

### 6. Run the app

**Terminal 1 — Start backend:**

```bash
cd devflow-backend
npm run dev
```

**Terminal 2 — Start frontend:**

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## Download & Install APK

No setup needed — just install and use!

**[⬇️ Download DevFlow APK](https://expo.dev/artifacts/eas/pUPN2Xq1pJgS5oC9UXoibW3qdLKsvyBX1B1S8Q-08kE.apk)**

> If installation is blocked: Settings → Security → Allow unknown sources → Install

---

## Live Backend

API is live at: **https://devflow-backend-08eh.onrender.com**

Test it:

```bash
curl https://devflow-backend-08eh.onrender.com/
# {"message":"DevFlow API running"}
```

---

## Build APK

To build your own APK using Expo EAS:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

---

## Author

**Bhumika Bhatt**

- 📧 bhumikabhatt1312@gmail.com
- 💼 [LinkedIn](https://www.linkedin.com/in/bhumikabhatt1312/)
- 🐱 [GitHub](https://github.com/Bhumika1312)

---

## License

MIT License — feel free to use this project as a reference or template.
