# Mockify NEET - Complete Setup Guide

A comprehensive NEET question bank platform with dedicated backend API and optimized frontend. This implementation provides secure data management, high-performance queries, and an intuitive user interface.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB (local or cloud)
- npm or yarn

### Option 1: Using MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB Atlas URI
   ```

3. **Setup Frontend**

   ```bash
   # In project root
   npm install
   ```

4. **Seed Database**

   ```bash
   cd backend
   npm run seed
   ```

5. **Start Services**

   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend  
   npm run dev
   ```

### Option 2: Using Local MongoDB

1. **Install MongoDB locally**

   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   
   # Windows - Download from MongoDB website
   # Ubuntu
   sudo apt install mongodb
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env to use: MONGODB_URI=mongodb://localhost:27017/mockify_neet
   ```

3. **Continue with steps 3-5 from Option 1**

### Option 3: Using Docker (Easiest)

```bash
cd backend
docker-compose up -d  # Starts MongoDB + Redis
npm install
npm run seed         # Seed the database
npm run dev         # Start backend

# In new terminal
cd ..
npm install
npm run dev         # Start frontend
```

## 📁 Project Structure

```Mockify/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, validation, caching
│   ├── config/            # Database, logging, cache
│   ├── scripts/           # Data seeding scripts
│   └── server.js          # Main server file
├── src/
│   ├── components/NEET/   # NEET-specific components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API service layer
│   └── ...               # Existing components
└── NEET_FULL_DATABASE_EXPORT_20250930_085153.csv
```

## 🔧 Configuration

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ENABLE_CACHE=true
CACHE_TTL=300
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Mockify NEET
VITE_ENABLE_ANALYTICS=true
```

## 🎯 Features Implemented

### Backend API

- ✅ **RESTful API** with Express.js
- ✅ **MongoDB Integration** with Mongoose ODM
- ✅ **Performance Caching** using node-cache
- ✅ **Rate Limiting** to prevent abuse
- ✅ **Input Validation** with Joi & express-validator
- ✅ **Comprehensive Logging** with Winston
- ✅ **Error Handling** with structured responses
- ✅ **Database Indexing** for optimal query performance
- ✅ **Batch Data Seeding** from CSV with error handling

### Frontend Integration

- ✅ **React Hooks** for state management
- ✅ **TypeScript Support** for type safety
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **Real-time Search** with debouncing
- ✅ **Pagination** for large datasets
- ✅ **Loading States** and error handling
- ✅ **Performance Monitoring** with React hooks

### Data Management

- ✅ **Automatic CSV Import** from your NEET database
- ✅ **Subject Organization** (Chemistry, Physics, Botany, Zoology)
- ✅ **Chapter Categorization** with statistics
- ✅ **Question Difficulty Levels** (Easy, Medium, Hard)
- ✅ **Subtopic Tagging** for granular filtering
- ✅ **Usage Analytics** (attempts, success rates, time spent)

## 📊 API Endpoints

### Questions

- `GET /api/questions` - List questions with filters
- `GET /api/questions/random` - Get random questions
- `GET /api/questions/search` - Search questions
- `GET /api/questions/:id` - Get single question
- `POST /api/questions/:id/attempt` - Record attempt

### Subjects & Chapters

- `GET /api/subjects` - List all subjects
- `GET /api/subjects/:subject/overview` - Subject details
- `GET /api/chapters/:subject` - List chapters
- `GET /api/chapters/:subject/:chapter/overview` - Chapter details

### Analytics

- `GET /api/analytics/overview` - Platform statistics
- `GET /api/analytics/subjects` - Subject-wise analytics
- `GET /api/analytics/popular-questions` - Most attempted
- `GET /api/analytics/difficult-questions` - Lowest success rates

## 🎨 UI Components

### NEET Dashboard (`/neet`)

- **Subject Grid**: Visual subject browser with statistics
- **Question Cards**: Interactive question display with timing
- **Search & Filters**: Advanced filtering by subject, chapter, difficulty
- **Practice Mode**: Random question generator
- **Progress Tracking**: Real-time statistics and success rates

### Key Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Virtualized lists, lazy loading
- **User Experience**: Smooth animations, loading states

## 🚀 Deployment

### Backend (Node.js)

```bash
# Production build
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri

# Using PM2
pm2 start server.js --name mockify-backend

# Using Docker
docker build -t mockify-backend .
docker run -p 5000:5000 mockify-backend
```

### Frontend (Vite/React)

```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
npm run build
# Upload dist/ folder

# Environment variables
VITE_API_URL=https://your-backend-url.com/api
```

## 📈 Performance Optimizations

### Backend

- **Database Indexing**: Strategic indexes on frequently queried fields
- **Caching Layer**: In-memory cache for repeated queries
- **Query Optimization**: MongoDB aggregation pipelines
- **Rate Limiting**: Prevent API abuse
- **Batch Processing**: Efficient bulk operations

### Frontend  

- **Code Splitting**: Lazy load NEET components
- **Memoization**: React.memo for expensive components
- **Debounced Search**: Reduce API calls
- **Virtual Scrolling**: Handle large question lists
- **Progressive Loading**: Show data as it loads

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev        # Auto-reload server
npm run seed       # Re-seed database
npm test          # Run tests
```

### Frontend Development

```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview build
```

### Database Management

```bash
# Setup database
cd backend && npm run setup

# Full reset and reseed
cd backend && npm run seed-full

# View logs
tail -f backend/logs/combined.log
```

## 🔍 Monitoring & Analytics

### Health Checks

- Backend: `http://localhost:5000/health`
- Cache Stats: `http://localhost:5000/api/analytics/cache-stats`

### Performance Metrics

- Response times via Winston logging
- Cache hit/miss ratios
- Database query performance
- Error rates and patterns

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   ```bash
   # Check MongoDB is running
   mongod --version
   # Or use MongoDB Atlas cloud service
   ```

2. **CORS Errors**

   ```bash
   # Update backend/.env
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

3. **Seeding Fails**

   ```bash
   # Check CSV file path in seedData.js
   # Ensure MongoDB is accessible
   ```

4. **Frontend Build Errors**

   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📝 Next Steps

1. **Authentication Integration**: Connect with existing auth system
2. **Test Generation**: Create tests from question bank
3. **Progress Tracking**: User-specific progress analytics
4. **Mobile App**: React Native version
5. **AI Features**: Question difficulty auto-classification
6. **Bulk Operations**: Admin panel for question management

## 📚 Documentation

- **API Documentation**: Visit `/api/docs` when server is running
- **Component Storybook**: `npm run storybook`
- **Database Schema**: See `backend/models/` for detailed schemas

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Ready to start? Choose your setup option above and you'll have a fully functional NEET question bank in minutes! 🎉**
