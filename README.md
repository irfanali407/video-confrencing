meetHub

A full-stack video meeting application built with React, Express, MongoDB, Socket.IO, and WebRTC. Users can create or join rooms, communicate over audio/video, chat during calls, and revisit meetings from their account history.

## Features

- Sign up and sign in with username and password; passwords are hashed with bcrypt.
- JWT authentication and protected home and meeting-history pages.
- Create a new meeting room or join an existing room using its code.
- Browser-based peer-to-peer audio and video with camera and microphone controls.
- Share and stop sharing the screen.
- Live in-room chat; the server stores messages in MongoDB and sends recent saved messages to new room participants.
- Meeting codes and dates are saved to the signed-in user's meeting history, with a rejoin action.
- Participant join/leave and camera/microphone status notifications.

## Tech Stack

- Frontend: React 18, React Router, Material UI, Axios, Socket.IO Client
- Backend: Node.js (ES modules), Express, Socket.IO
- Database: MongoDB and Mongoose
- Real-time media: WebRTC (`RTCPeerConnection`)
- Authentication: JSON Web Tokens and bcrypt

## Repository Layout

```text
backend/
  src/
    app.js                     Express app, MongoDB connection, HTTP/Socket.IO server
    controllers/                User API and Socket.IO room events
    middleware/                 JWT authentication middleware
    models/                     User, meeting, and chat message schemas
    routes/                     User API routes
    utils/                      JWT helpers
  tests/                        Node.js tests
frontend/
  public/                       Static assets and HTML template
  src/
    contexts/                   Authentication state and API calls
    pages/                      Landing, auth, home, history, and meeting views
    styles/                     Meeting view styles
    utils/                      Route authentication helper
```

## Requirements

- Node.js 18 or newer and npm
- A MongoDB database (local MongoDB or MongoDB Atlas)
- A modern browser with camera/microphone permissions for calls

## Local Development

### 1. Configure the backend

In PowerShell, open a terminal in `backend` and install dependencies:

`

Use your own MongoDB connection string for Atlas. Set `MONGO_URI` and `JWT_SECRET` in the same terminal session before starting the backend. The backend currently reads these variables directly from the environment; it does not load a `.env` file. `PORT` is optional and defaults to `8000`.

### 2. Point the frontend to the local backend

In `frontend/src/environment.js`, set `IS_PROD` to `false` for local development. The frontend then uses `http://localhost:8000` for both API requests and Socket.IO. The checked-in setting is production mode and points to the hosted backend.

Open a second PowerShell terminal in `frontend`, then run:

```powershell
cd frontend
npm install
npm start
```

The frontend opens at [http://localhost:3000](http://localhost:3000). Allow camera and microphone access when prompted. To make browser-to-browser calls, open the same meeting code in another browser or device; WebRTC connectivity can depend on network and firewall settings.

## Available Scripts

Run each command from its corresponding `backend` or `frontend` directory.

| Directory | Command | Purpose |
| --- | --- | --- |
| `backend` | `npm run dev` | Start the API and Socket.IO server with nodemon |
| `backend` | `npm start` | Start the API and Socket.IO server with Node.js |
| `backend` | `node --test` | Run the backend Node.js test suite |
| `frontend` | `npm start` | Start the React development server |
| `frontend` | `npm run build` | Create a production frontend build |
| `frontend` | `npm test` | Run the React test runner |

## API

All REST endpoints use the `/api/v1/users` prefix. JSON request bodies are expected where applicable.

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/register` | No | Register with `{ "name", "username", "password" }` |
| `POST` | `/login` | No | Log in with `{ "username", "password" }`; returns a JWT and user details |
| `POST` | `/add_to_activity` | Bearer token | Save a meeting with `{ "meeting_code" }` |
| `GET` | `/get_all_activity` | Bearer token | Get the signed-in user's meeting history |

For protected requests, send `Authorization: Bearer <token>`. Socket.IO handles room presence, WebRTC signaling, chat delivery, and participant status events.

## Application Flow

1. Register or log in. On successful login, the frontend stores the JWT in browser `localStorage`.
2. From the home page, create a room or enter a meeting code. The code is saved to meeting history before navigation when the history request succeeds.
3. Enter a display name, grant browser media permissions, and join the room. Socket.IO relays WebRTC signaling; media is exchanged peer-to-peer between browsers.
4. Use the meeting controls for microphone, camera, screen sharing, chat, or leaving the meeting.
5. Open History to rejoin previously saved rooms.

## Configuration Notes

- Backend environment variables: `PORT` (default `8000`), `MONGO_URI`, and `JWT_SECRET`.
- The frontend backend URL is selected with the `IS_PROD` flag in `frontend/src/environment.js`; it is not currently read from a frontend environment file.
- The backend has a development fallback JWT secret. Set a private `JWT_SECRET` for local and deployed environments.
- Browser media APIs generally require `localhost` or a secure HTTPS origin.

## Tests

The backend uses Node's built-in test runner. From `backend`:

```bash
node --test
```

The frontend was created with Create React App and includes its standard Jest/React Testing Library test setup:

```bash
npm test
```

## License

No project-level license file is currently included.
