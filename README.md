# Aqua Workspace - Monorepo

A full-stack application for managing condo billing and statements, built with .NET Core API and React frontend.

## 🏗️ Project Structure

```
aqua-workspace/
├── api/                 # .NET Core Web API (AWS Lambda ready)
├── frontend/           # React + TypeScript + Mantine UI
├── shared/             # Shared utilities and types
├── docker/             # Docker configurations
└── docker-compose.yml  # Local development services
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **.NET 8.0 SDK**
- **Docker** and Docker Compose
- **AWS CLI** (for deployment)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd aqua-workspace
   npm run install:all
   ```

2. **Start local services:**
   ```bash
   # Start DynamoDB Local
   npm run docker:up
   
   # Or start everything together
   npm run dev
   ```

3. **Access the applications:**
   - **Frontend:** http://localhost:5173
   - **API:** http://localhost:5001
   - **DynamoDB Local:** http://localhost:8000

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API and frontend in development mode |
| `npm run dev:api` | Start only the API |
| `npm run dev:frontend` | Start only the frontend |
| `npm run build` | Build both applications |
| `npm run clean` | Clean build artifacts |
| `npm run docker:up` | Start local services (DynamoDB) |
| `npm run docker:down` | Stop local services |

### API Development

The API is built with:
- **.NET 8.0** ASP.NET Core
- **AWS Lambda** support
- **DynamoDB** for data storage
- **AWS S3** for file storage
- **AWS Cognito** for authentication
- **JWT Bearer** tokens

**Key endpoints:**
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/condos` - Get condos
- `GET /api/units` - Get units
- `GET /api/periods` - Get billing periods
- `POST /api/statements/upload` - Upload statement PDFs

### Frontend Development

The frontend is built with:
- **React 18** with TypeScript
- **Mantine UI** components
- **Vite** for fast development
- **React Router** for navigation
- **Axios** for API communication

## 🔧 Configuration

### Environment Variables

Create `.env` files in the respective directories:

**API (`api/appsettings.Development.json`):**
```json
{
  "AppSettings": {
    "Cognito": {
      "UserPoolId": "your-user-pool-id",
      "ClientId": "your-client-id"
    },
    "AWS": {
      "Region": "us-west-2"
    }
  }
}
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🐳 Docker Development

### Local Services

```bash
# Start DynamoDB Local
npm run docker:up

# View logs
docker-compose logs -f dynamodb-local

# Stop services
npm run docker:down
```

### DynamoDB Local

The API is configured to use DynamoDB Local for development. Tables will be created automatically when the API starts.

## 📦 Deployment

### API Deployment (AWS Lambda)

```bash
cd api
dotnet lambda deploy-serverless -sb aqua-deployments -f net8.0 -sn aqua-api --region us-west-2
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

## 🧪 Testing

### API Tests
```bash
cd api
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📁 Shared Resources

The `shared/` directory contains:
- Common TypeScript types
- Shared utilities
- API client configurations

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Submit a pull request

## 📄 License

[Your License Here]
