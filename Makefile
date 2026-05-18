.PHONY: backend-dev
backend-dev:
    @echo "Starting backend"
    cd backend && uvicorn app.main:app --reload

.PHONY: frontend-dev
frontend-dev:
    @echo "Starting frontend"
    cd frontend && npm install && npm run dev
