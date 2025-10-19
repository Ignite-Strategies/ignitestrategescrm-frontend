# YouTube Integration - EngageSmart

## YouTube API Configuration

### Required Environment Variables
```
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret  
YOUTUBE_REDIRECT_URI=https://ignitestrategiescrm-frontend.vercel.app/youtubeoauth
```

### YouTube API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID and Client Secret

### Integration Points
- **Sign-in flow** - YouTube OAuth authentication
- **Publish routes** - Video upload and management
- **Channel management** - Multiple channel support
- **Analytics** - View counts, engagement metrics
- **Content creation** - Thumbnails, descriptions, tags

### Features to Build
- [ ] YouTube OAuth authentication
- [ ] Video upload to YouTube
- [ ] Channel selection/management
- [ ] Video metadata editing
- [ ] Analytics dashboard
- [ ] Playlist management
- [ ] Live streaming integration

### API Endpoints Needed
- `POST /api/youtube/auth` - OAuth flow
- `POST /api/youtube/upload` - Video upload
- `GET /api/youtube/channels` - List channels
- `GET /api/youtube/analytics` - Channel analytics
- `POST /api/youtube/publish` - Publish video

### Next Steps
1. Set up YouTube API credentials
2. Implement OAuth flow
3. Build video upload functionality
4. Create channel management UI
5. Add analytics integration
