# 🎫 TicketAI — AI-Powered Support Ticket System

A production-grade support ticket management system with AI-powered ticket classification, built with Django, React, PostgreSQL, and OpenAI.

![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone <repo-url> && cd <project-dir>

# 2. (Optional) Set your Gemini API key
export GEMINI_API_KEY=your-gemini-api-key-here

# 3. Launch everything
docker-compose up --build
```

Open **http://localhost:3000** in your browser.

| Service    | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:3000         |
| Backend API| http://localhost:8000/api/    |
| Admin      | http://localhost:8000/admin/  |
| PostgreSQL | localhost:5432               |

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   React     │────▶│  Django DRF  │────▶│  PostgreSQL  │
│   (Nginx)   │     │  (Gunicorn)  │     │   15-alpine  │
│   :3000     │     │    :8000     │     │    :5432     │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────▼───────┐
                    │  Gemini API  │
                    │  2.0-flash   │
                    └──────────────┘
```

**Backend**: Django 4.2 + DRF with `Ticket` model, full CRUD, aggregated stats, and AI classification endpoint.

**Frontend**: React 18 + Vite, TailwindCSS, Framer Motion, Recharts, React Query. Premium SaaS-style UI with glassmorphism, animated charts, dark mode.

**AI**: Google Gemini 2.0-flash classifies tickets by category and priority with confidence score. Includes 3-attempt retry, timeout handling, and graceful fallback.

---

## 📡 API Endpoints

| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| GET    | `/api/tickets/`         | List (filterable)    |
| POST   | `/api/tickets/`         | Create ticket        |
| PATCH  | `/api/tickets/{id}/`    | Update ticket        |
| DELETE | `/api/tickets/{id}/`    | Delete ticket        |
| GET    | `/api/tickets/stats/`   | Aggregated stats     |
| POST   | `/api/tickets/classify/`| AI classification    |

**Filters**: `?category=`, `?priority=`, `?status=`, `?search=`, `?page=`

---

## 🤖 LLM Classification Prompt

The system sends a structured prompt to Gemini 2.0-flash asking it to classify the ticket description into:

- **Category**: billing, technical, account, general
- **Priority**: low, medium, high, critical

Returns JSON with `suggested_category`, `suggested_priority`, `confidence_score`.

If the `GEMINI_API_KEY` is missing or the API fails after 3 retries, the system returns a safe fallback (`general` / `medium` / `0.0 confidence`).

---

## 🎨 Design Decisions

- **Glassmorphism** + animated gradient backgrounds for premium SaaS feel
- **Framer Motion** for page transitions, card hover/enter animations, modal spring animations, counter animations
- **React Query** for server state with optimistic updates on ticket mutations
- **Debounced AI classification** — triggers only after 800ms of typing inactivity, requires 15+ chars
- **Dark/Light mode** persisted to localStorage with smooth class-based toggle
- **Toast notifications** with spring physics via Framer Motion
- **Responsive** — sidebar + grid adapts from mobile to desktop

---

## 📁 Project Structure

```
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── tickets/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── services.py
│       ├── urls.py
│       └── admin.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/tickets.js
        ├── hooks/useTickets.js
        ├── context/ThemeContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── TicketCard.jsx
        │   ├── TicketModal.jsx
        │   ├── Toast.jsx
        │   └── Skeleton.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── CreateTicket.jsx
            └── TicketList.jsx
```

---

## 🔧 Environment Variables

| Variable           | Description                | Default        |
|--------------------|----------------------------|----------------|
| `GEMINI_API_KEY`   | Google Gemini API key      | *(empty)*      |
| `POSTGRES_DB`      | Database name              | `tickets_db`   |
| `POSTGRES_USER`    | Database user              | `tickets_user` |
| `POSTGRES_PASSWORD`| Database password          | `tickets_pass` |
| `DJANGO_SECRET_KEY`| Django secret key          | *(dev default)*|
| `DEBUG`            | Django debug mode          | `True`         |

---

## 📜 License

MIT
