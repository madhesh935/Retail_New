# Retail Edge OS

React/Vite retail operations UI with a FastAPI backend, live SQLite operational data, and an OpenRouter-powered retrieval-augmented generation (RAG) pipeline.

## Retail RAG pipeline

The copilot now retrieves relevant company evidence before sending a question to the configured OpenRouter chat model. It indexes two kinds of sources:

- Live SQLite records: stores, zones, shelves, products, queues, staff, tasks, incidents, items, and cameras.
- Knowledge files under `backend/data/knowledge`: Markdown, text, JSON, and CSV.

OpenRouter embeddings are cached in `backend/data/rag_index.json`. Records are fingerprinted, so unchanged data reuses its existing embedding. If embedding generation is temporarily unavailable, search continues with lexical retrieval.

The answer prompt treats retrieved text as untrusted data, requires source citations such as `[Source 1]`, and tells the model not to invent company facts when evidence is missing.

## SQLite platform dataset

The backend automatically applies additive SQLite schema upgrades and installs a versioned, idempotent Retail Edge OS dataset. The seed includes the Chennai Central store, eight zones, monitored shelves and products, checkout lanes, twelve staff members, operational tasks, active and resolved incidents, camera profiles, expiry batches, markdown candidates, waste history, and reporting metrics.

The seed runs once per version. Normal backend restarts do not reset live occupancy, task, incident, or inventory changes. To deliberately restore the canonical demonstration snapshot:

```powershell
cd backend
python -c "from app.db.init_db import seed_database; seed_database(force=True)"
```

Seed-backed data endpoints include:

- `GET /api/v1/store/status`
- `GET /api/v1/inventory/shelves`
- `GET /api/v1/inventory/products`
- `GET /api/v1/inventory/batches`
- `GET /api/v1/inventory/markdown-candidates`
- `GET /api/v1/inventory/waste`
- `GET /api/v1/inventory/metrics`
- `GET /api/v1/queue/lanes`
- `GET /api/v1/staff/members` and `/api/v1/staff/tasks`
- `GET /api/v1/incidents/`
- `GET /api/v1/cameras/`

## Backend setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set at least these values in `backend/.env`:

```dotenv
OPENROUTER_API_KEY="your-key"
OPENROUTER_CHAT_MODEL="openai/gpt-4o-mini"
OPENROUTER_EMBEDDING_MODEL="openai/text-embedding-3-small"
```

Then start the API:

```powershell
uvicorn app.main:app --reload
```

OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

## Adding company data

Put approved `.md`, `.txt`, `.json`, or `.csv` files in `backend/data/knowledge`. CSV files are indexed one row at a time; other files are chunked using the configured size and overlap.

Force a rebuild after adding or replacing files:

```powershell
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/v1/rag/reindex?force=true"
```

The normal chat and search paths also detect changed files and database records lazily, so a manual rebuild is optional.

## API examples

Test retrieval without calling the chat model:

```powershell
$body = @{ query = "Which shelf has Diet Coke and is it low stock?"; top_k = 3 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/v1/rag/search -ContentType application/json -Body $body
```

Ask the grounded copilot:

```powershell
$body = @{
  messages = @(@{ role = "user"; content = "Which shelf should be replenished first and why?" })
  use_rag = $true
  top_k = 5
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/v1/chat/ -ContentType application/json -Body $body
```

Useful endpoints:

- `POST /api/v1/chat/` — retrieve context and generate a grounded answer.
- `POST /api/v1/rag/search` — inspect retrieved sources without generation.
- `POST /api/v1/rag/reindex` — index changed data; add `?force=true` to regenerate every embedding.
- `GET /api/v1/rag/status` — inspect models, cache counts, and the last embedding error.

## Frontend

From the project root:

```powershell
npm install
npm run dev
```

The existing copilot UI posts to `http://127.0.0.1:8000/api/v1/chat/`, so RAG is enabled there without a frontend change.

## Verification

```powershell
cd backend
python -m compileall -q app tests
python -m unittest discover -s tests -v
```
