# Environment Configuration

This application supports different environment configurations for development and testing.

## 🌍 Environment Types

### Development (Live API)
- **File:** `.env.development`
- **API:** Live endpoints (default)
- **Google OAuth:** Enabled
- **Mock Login:** Available for testing
- **Use Case:** Normal development with real API

### Mock (Test API)
- **File:** `.env.mock`
- **API:** Mock endpoints
- **Google OAuth:** Disabled
- **Mock Login:** Available for testing
- **Use Case:** Testing without real API dependencies

## 🚀 Quick Start

### Switch to Live API (Development)
```bash
npm run env:live
# or
./scripts/switch-env.sh development
```

### Switch to Mock API (Testing)
```bash
npm run env:mock
# or
./scripts/switch-env.sh mock
```

### Start Development Server
```bash
# Start with current environment
npm run dev

# Start with live API
npm run dev:live

# Start with mock API
npm run dev:mock
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_AQUA_API` | API base URL | `http://localhost:5001` |
| `VITE_USE_MOCK_API` | Use mock endpoints | `false` |
| `VITE_ENABLE_GOOGLE_OAUTH` | Enable Google OAuth | `true` |
| `VITE_ENABLE_MOCK_LOGIN` | Show mock login button | `true` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | (configured) |
| `VITE_GOOGLE_REDIRECT_URI` | Google OAuth redirect URI | `http://localhost:5173` |

## 🔧 Configuration Details

### API Endpoints
- **Live Mode:** `/api/[endpoint]` (e.g., `/api/auth/google`)
- **Mock Mode:** `/api/mock/[endpoint]` (e.g., `/api/mock/auth/google`)

### Authentication Flow
1. **Live Mode:** Google OAuth → Backend → JWT Token → User Provisioning
2. **Mock Mode:** Mock Login → Mock User → User Provisioning

### Data Access
- **Live Mode:** Real data from backend API
- **Mock Mode:** Mock data for testing

## 🛡️ Security Features

### Authentication Required
- All data pages require user authentication
- Unauthenticated users see login prompts
- No sensitive data displayed without authentication

### Environment Indicators
- Console logs show current environment
- API calls indicate mock vs live mode
- Clear visual indicators in UI

## 🔄 Switching Environments

1. **Stop the development server** (Ctrl+C)
2. **Run the environment switch command:**
   ```bash
   npm run env:live    # or npm run env:mock
   ```
3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## 🐛 Troubleshooting

### Environment Not Applied
- Ensure you've restarted the development server
- Check that `.env.local` file was created
- Verify environment variables in browser console

### API Endpoints Not Working
- Check if backend server is running
- Verify API base URL in environment file
- Check network tab for API call errors

### Authentication Issues
- Clear browser localStorage
- Check Google OAuth configuration
- Verify JWT token generation

## 📝 Development Notes

- Environment configuration is loaded at build time
- Changes require server restart
- Mock data is consistent across sessions
- Live API requires backend server running
