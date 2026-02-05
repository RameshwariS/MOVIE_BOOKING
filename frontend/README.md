# Frontend for Movie Booking

This is a minimal React + Vite frontend for the `MOVIE_BOOKING` backend.

## Setup

1. cd `frontend`
2. npm install
3. Create `.env` file with `VITE_API_URL` if your backend runs on a non-default host/port, e.g.

```
VITE_API_URL=http://localhost:8000
```

4. npm run dev

## Features

- Register / Login (tokens stored in localStorage)
- View movies list
- Create / edit / delete movies
- Create and fetch a theater by id

Notes:
- Some backend routes expect certain payload fields; the forms supply the required fields.
- Protected routes use the stored JWT; if you get 401 ensure you are logged in and have a token in localStorage.
