# MMR Admin

A modern, elegant, and reactive web interface for managing Matrix Media Repo (MMR) instances. Built with Next.js, TypeScript, and Tailwind CSS for optimal performance and user experience.

![MMR Admin Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=MMR+Admin+Dashboard)

## ✨ Features

### 🎯 Core Functionality
- **Media Management**: Browse, search, preview, and manage media files
- **Real-time Statistics**: Live server stats and health monitoring
- **User Management**: Monitor user activity and storage usage
- **File Operations**: Download, delete, and quarantine media files
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 🚀 Technical Features
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Static Export**: Deploy as static files to any web server
- **Type Safety**: Full TypeScript support with MMR API types
- **Performance**: Optimized with lazy loading and efficient caching
- **Accessibility**: Built with accessibility best practices

### 📱 Media Support
- **Image Preview**: Inline preview for all image formats
- **Video Playback**: Built-in video player with controls
- **Audio Support**: Audio file playback and management
- **File Downloads**: Direct download with progress indication
- **Bulk Operations**: Select and manage multiple files at once

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Matrix Media Repo instance with admin API enabled

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mmr-admin.git
   cd mmr-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

1. **Build for production**
   ```bash
   npm run build
   npm run export
   ```

2. **Deploy static files**
   The `out/` directory contains all static files ready for deployment to any web server.

## ⚙️ Configuration

### MMR API Setup

1. **Enable Admin API** in your MMR configuration:
   ```yaml
   # config.yaml
   admin:
     enabled: true
     apiKey: "your-secure-api-key"
   ```

2. **Configure the interface**:
   - Open MMR Admin in your browser
   - Enter your MMR instance URL (e.g., `https://media.yourdomain.com`)
   - Enter your API key
   - Click "Save Configuration"

### Configuration File (Recommended)

Create a `config.json` file in the project root:

```json
{
  "homeserverUrl": "https://yourdomain.com",
  "accessToken": "your-matrix-access-token-here"
}
```

**Note**: The same URL and access token are used for both Matrix and MMR API calls. The token will be validated using the Matrix `whoami` endpoint before attempting MMR operations.

### Environment Variables (Alternative)

Create a `.env.local` file for default configuration:

```env
NEXT_PUBLIC_HOMESERVER_URL=https://yourdomain.com
NEXT_PUBLIC_ACCESS_TOKEN=your-matrix-access-token
```

## 📖 Usage

### Dashboard
- **Overview**: View server statistics and health status
- **Recent Media**: Quick access to recently uploaded files
- **Quick Actions**: Navigate to different management sections

### Media Management
- **Browse**: View all media files in grid or list format
- **Search**: Filter media by filename, type, or user
- **Preview**: Click any media file to preview images/videos
- **Download**: Download individual files or bulk download selected files
- **Delete**: Remove unwanted media files
- **Quarantine**: Isolate suspicious or problematic files

### User Management
- **Usage Stats**: View per-user storage consumption
- **Activity Monitoring**: Track user upload patterns
- **Cleanup Tools**: Remove media from specific users

### Server Monitoring
- **Health Status**: Real-time server health indicators
- **Performance Metrics**: Cache hit rates and response times
- **Storage Analysis**: Datastore usage and optimization tips

## 🔧 API Reference

The interface uses the following MMR Admin API endpoints:

### Media Endpoints
- `GET /api/v1/media` - List media files
- `GET /api/v1/media/{id}` - Get media details
- `DELETE /api/v1/media/{id}` - Delete media
- `GET /api/v1/media/{id}/download` - Download media

### User Endpoints
- `GET /api/v1/users/{id}/media` - Get user media usage
- `GET /api/v1/users/media` - Get all users' media usage
- `DELETE /api/v1/users/{id}/media` - Delete user's media

### Server Endpoints
- `GET /api/v1/server/stats` - Get server statistics
- `GET /api/v1/server/health` - Get server health status
- `GET /api/v1/server/cache` - Get cache statistics

### Quarantine Endpoints
- `POST /api/v1/media/{id}/quarantine` - Quarantine media
- `DELETE /api/v1/media/{id}/quarantine` - Unquarantine media
- `GET /api/v1/quarantine` - List quarantined media

## 🚀 Deployment

### Static File Deployment

1. **Build the project**:
   ```bash
   npm run build
   npm run export
   ```

2. **Deploy the `out/` directory** to any web server:
   - Apache
   - Nginx
   - Cloudflare Pages
   - Netlify
   - Vercel
   - GitHub Pages

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm run export

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/mmr-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## 🔒 Security

### API Key Management
- Store API keys securely
- Use HTTPS for all communications
- Regularly rotate API keys
- Implement proper access controls

### CORS Configuration
Ensure your MMR instance allows requests from your admin interface domain:

```yaml
# MMR config.yaml
cors:
  enabled: true
  allowedOrigins:
    - "https://your-admin-domain.com"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Matrix Media Repo](https://github.com/t2bot/matrix-media-repo) - The amazing media repository server
- [Next.js](https://nextjs.org/) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icon toolkit

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mmr-admin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mmr-admin/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/mmr-admin/wiki)

---

Made with ❤️ for the Matrix community
