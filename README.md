# Student CRUD (React + Node.js + SQLite)

```
student-crud/
├── frontend/   React (Vite) UI          -> http://localhost:5173
├── backend/    Node + Express REST API  -> http://localhost:5000
└── database/   SQLite connection + students.db (created on first run)
```

## Run it (3 terminals, or one after another)

```bash
cd database && npm install
cd ../backend && npm install && npm start
cd ../frontend && npm install && npm run dev
```

Open http://localhost:5173

## API

| Method | URL                  | Action           |
|--------|----------------------|------------------|
| GET    | /api/students        | List all         |
| GET    | /api/students/:id    | Get one          |
| POST   | /api/students        | Create           |
| PUT    | /api/students/:id    | Update           |
| DELETE | /api/students/:id    | Delete           |

Body for POST/PUT: `{ "name": "Aarav", "age": 18, "roll_no": "CS-101" }`
