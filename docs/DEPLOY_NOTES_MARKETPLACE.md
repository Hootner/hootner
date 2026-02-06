# Algorithm Marketplace Deployment Notes (Production)

## Server Env

- `ALLOWED_ORIGINS`: Comma-separated origins allowed by CORS
- `GRAPHQL_URL`: Full GraphQL URL
- `STRIPE_API_KEY`: Optional for metered usage
- `PORT`: Server port if needed

## Frontend Env

- `VITE_API_BASE_URL`: API base URL used by the UI

## Routes

- `/api/algorithms` — list available algorithms
- `/api/algorithms/:id/execute` — run algorithm; enforces tier limits
- `/api/algorithms/usage?user_id=...` — usage counters
- `/cinema-player` — serves cinema player HTML (new path with legacy fallback)
- `/config` — serves legacy config page if present
- `/page/:name` — dynamic HTML serving from known directories

## Stripe Metered Usage

- Map `user_id` to `subscription_item_id` via `data/subscriptions/subscription-map.json`
- Server will record usage when map is present or when client passes `subscription_item_id`

## Deployment Checklist

1. Set server env vars (`ALLOWED_ORIGINS`, `GRAPHQL_URL`, optional `STRIPE_API_KEY`)
2. Build frontend with `VITE_API_BASE_URL`
3. Start server with provided envs
4. Verify `/api/health` and `/api/algorithms`
5. Test marketplace execution and usage endpoint
