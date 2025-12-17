# 📦 NPM Scripts Reference

## 🚀 Development Commands

| Command | Description | Location |
|---------|-------------|----------|
| `npm start` | Start production server | Root |
| `npm run dev` | Start development (frontend + API) | Root |
| `npm run dev:frontend` | Start frontend only | Root |
| `npm run dev:api` | Start API only | Root |
| `npm run dev:hub` | Start hub app | Root |
| `npm run dev:secure` | Start secure HTTPS server | Root |
| `npm run collab` | Start collaboration server | Root |

## 🏗️ Build Commands

| Command | Description | Location |
|---------|-------------|----------|
| `npm run build` | Build frontend + API | Root |
| `npm run build:frontend` | Build frontend only | Root |
| `npm run build:api` | Build API only | Root |
| `npm run package` | Package Electron app | Root |
| `npm run make` | Create Electron installers | Root |

## 🧪 Testing Commands

| Command | Description | Location |
|---------|-------------|----------|
| `npm test` | Run all tests | Root |
| `npm run test:frontend` | Run frontend tests | Root |
| `npm run test:api` | Run API tests | Root |
| `npm run test:chaos` | Run chaos engineering tests | Root |
| `npm run test:load` | Run load tests | Root |
| `npm run test:smoke` | Run smoke tests | Root |

## 🔍 Linting & Formatting

| Command | Description | Location |
|---------|-------------|----------|
| `npm run lint` | Lint JS, HTML, CSS | Root |
| `npm run lint:js` | Lint JavaScript only | Root |
| `npm run lint:js:fix` | Fix JavaScript lint issues | Root |
| `npm run lint:html` | Lint HTML files | Root |
| `npm run lint:css` | Lint CSS files | Root |
| `npm run lint:css:fix` | Fix CSS lint issues | Root |
| `npm run lint:fix` | Fix all lint issues | Root |
| `npm run lint:all` | Advanced linting | Root |
| `npm run lint:all:fix` | Fix all with advanced linter | Root |
| `npm run format` | Format code with Prettier | Root |
| `npm run format:check` | Check code formatting | Root |

## 📊 Analysis & Documentation

| Command | Description | Location |
|---------|-------------|----------|
| `npm run analyze:duplication` | Analyze code duplication | Root |
| `npm run docs:generate` | Generate JSDoc documentation | Root |
| `npm run docs:serve` | Serve docs locally (port 8080) | Root |

## 🔒 Security Commands

| Command | Description | Location |
|---------|-------------|----------|
| `npm run security:audit` | Run security audit | Root |
| `npm run security:scan` | Scan for hardcoded credentials | Root |
| `npm run security:validate-env` | Validate environment variables | Root |
| `npm run generate:secrets` | Generate secure secrets | Root |

## 🤖 AI & Video Generation

| Command | Description | Location |
|---------|-------------|----------|
| `npm run video:install` | Install video generation deps | Root |
| `npm run video:start` | Start video generation API | Root |
| `npm run video:example` | Run video generation example | Root |
| `npm run ai:setup` | Setup AI video generation | Root |
| `npm run services:start` | Start video + main services | Root |

## 🐳 Docker Commands

| Command | Description | Location |
|---------|-------------|----------|
| `npm run docker:build` | Build Docker images | Root |
| `npm run docker:up` | Start Docker development | Root |
| `npm run docker:down` | Stop Docker containers | Root |

## ☸️ Kubernetes & Deployment

| Command | Description | Location |
|---------|-------------|----------|
| `npm run k8s:deploy` | Deploy to Kubernetes | Root |
| `npm run backup` | Run backup manager | Root |
| `npm run deploy:blue-green` | Blue-green deployment | Root |

## 📱 Frontend Specific (apps/frontend)

| Command | Description | Location |
|---------|-------------|----------|
| `npm run dev` | Start Vite dev server | apps/frontend |
| `npm run dev:hub` | Start hub app | apps/frontend |
| `npm run dev:secure` | Start secure server | apps/frontend |
| `npm run build` | Build for production | apps/frontend |
| `npm run preview` | Preview production build | apps/frontend |
| `npm run compile` | TypeScript compilation | apps/frontend |
| `npm run lint` | Lint frontend code | apps/frontend |
| `npm run lint:fix` | Fix frontend lint issues | apps/frontend |
| `npm run security:scan` | Frontend security scan | apps/frontend |

## 🖥️ Server Specific (apps/server)

| Command | Description | Location |
|---------|-------------|----------|
| `npm run dev` | Start server with nodemon | apps/server |
| `npm start` | Start production server | apps/server |
| `npm run build` | Build server | apps/server |
| `npm run lint` | Lint server code | apps/server |