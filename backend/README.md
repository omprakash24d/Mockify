# Mockify Backend API

A high-performance Node.js/Express backend for managing NEET question bank data with MongoDB storage, comprehensive caching, and robust analytics.

## Features

- 🚀 **High Performance**: Redis-like in-memory caching with configurable TTL
- 📊 **Comprehensive Analytics**: Subject, chapter, and question-level statistics  
- 🔍 **Advanced Search**: Full-text search with filtering and pagination
- 📚 **Smart Organization**: Hierarchical subject → chapter → question structure
- ⚡ **Optimized Queries**: MongoDB aggregation pipelines for complex analytics
- 🛡️ **Security**: Helmet, CORS, rate limiting, input validation
- 📝 **Logging**: Winston-based structured logging
- 🧪 **Data Seeding**: Automated CSV import with error handling

## Quick Start

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation

1.**Clone and setup**

```bash
cd backend
npm install
```

2.**Environment Configuration**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3.**Start MongoDB** (if running locally)

```bash
mongod --dbpath /path/to/your/db
```

4.**Seed the database**

```bash
npm run seed
```

5.**Start the server**

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Questions

- `GET /api/questions` - Get questions with filters & pagination
- `GET /api/questions/random` - Get random questions
- `GET /api/questions/search` - Search questions
- `GET /api/questions/:id` - Get single question
- `POST /api/questions/:id/attempt` - Record question attempt

### Subjects  

- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:subject` - Get subject with stats
- `GET /api/subjects/:subject/overview` - Detailed subject overview

### Chapters

- `GET /api/chapters/:subject` - Get chapters for subject
- `GET /api/chapters/:subject/:chapter` - Chapter with stats
- `GET /api/chapters/:subject/:chapter/overview` - Detailed chapter overview

### Analytics

- `GET /api/analytics/overview` - Platform overview
- `GET /api/analytics/subjects` - Subject-wise analytics
- `GET /api/analytics/popular-questions` - Most attempted questions
- `GET /api/analytics/difficult-questions` - Lowest success rate questions

## Data Structure

### Question Schema

```javascript
{
  subjectName: String,
  chapterName: String,
  questionText: String,
  options: [{ text: String, isCorrect: Boolean }],
  correctAnswer: String,
  subtopicTags: [String],
  difficulty: 'easy' | 'medium' | 'hard',
  statistics: {
    totalAttempts: Number,
    correctAttempts: Number,
    averageTimeSpent: Number
  }
}
```

## Performance Features

### Caching Strategy

- **Memory Caching**: Node-cache for frequently accessed data
- **Smart Invalidation**: Automatic cache clearing on data updates
- **Configurable TTL**: Different cache lifetimes for different data types

### Database Optimization

- **Indexes**: Strategic indexing for query performance
- **Aggregation**: Complex analytics using MongoDB pipelines
- **Batch Processing**: Efficient bulk operations for data seeding

### Rate Limiting

- 100 requests per 15 minutes per IP (configurable)
- Different limits for different endpoint categories

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/mockify_neet |
| `ENABLE_CACHE` | Enable/disable caching | true |
| `CACHE_TTL` | Default cache TTL (seconds) | 300 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `LOG_LEVEL` | Logging level | info |

## Data Seeding

The seeding script processes your CSV file and:

1. **Validates** all data entries
2. **Creates** subjects and chapters automatically
3. **Imports** questions in batches for performance
4. **Updates** statistics and relationships
5. **Handles** errors gracefully

```bash
npm run seed
```

## Monitoring & Analytics

### Health Check

```bash
curl http://localhost:5000/health
```

### Cache Statistics

```bash
curl http://localhost:5000/api/analytics/cache-stats
```

### Performance Metrics

- Response times via logging
- Database query performance
- Cache hit/miss ratios
- Error rates and types

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Joi & express-validator
- **Error Handling**: No sensitive data leakage

## Development

### Scripts

- `npm run dev` - Development server with auto-reload
- `npm run seed` - Seed database with CSV data
- `npm test` - Run test suite
- `npm start` - Production server

### Logging

Logs are written to:

- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## Production Deployment

1. **Environment Setup**

```bash
NODE_ENV=production
MONGODB_URI=mongodb://your-cluster-url
```

2.**Process Management**

```bash
# Using PM2
pm2 start server.js --name mockify-backend

# Using Docker
docker build -t mockify-backend .
docker run -p 5000:5000 mockify-backend
```

3.**Database Optimization**

- Enable MongoDB indexes
- Configure replica sets for high availability
- Set up database monitoring

## API Response Format

All API responses follow this structure:

```javascript
{
  "success": true | false,
  "data": any,
  "error": string, // Only on errors
  "cached": boolean, // Only for cached responses
  "timestamp": string
}
```

## Error Handling

The API returns consistent error responses:

- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality  
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details
