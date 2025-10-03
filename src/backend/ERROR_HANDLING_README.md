# Enhanced Backend Error Handling System

This document describes the comprehensive error handling, validation, and security improvements implemented in the Mockify backend.

## Overview

The enhanced error handling system provides:

- **Centralized error handling** with custom error classes
- **Comprehensive input validation** using Zod
- **Enhanced security** with sanitization and rate limiting
- **Structured logging** with Winston
- **Standardized API responses**
- **Database error recovery** with retry logic

## Error Classes

### Custom Error Types

Located in `src/backend/errors/CustomErrors.js`:

- **BaseError**: Base class for all custom errors
- **ValidationError**: Input validation failures
- **DatabaseError**: Database operation failures
- **NotFoundError**: Resource not found errors
- **AuthenticationError**: Authentication failures
- **AuthorizationError**: Permission denied errors
- **ConflictError**: Resource conflicts (duplicates)
- **RateLimitError**: Rate limiting violations
- **ExternalServiceError**: Third-party service failures
- **TimeoutError**: Operation timeouts
- **BusinessLogicError**: Business rule violations

### Error Factory

The `ErrorFactory` class provides:

- Automatic error type detection and conversion
- Mongoose error transformation
- JWT error handling
- Consistent error formatting

## Enhanced Validation

### Zod-based Validation

Located in `src/backend/middleware/enhancedValidation.js`:

```javascript
// Example usage
const { validateCreateQuestion, validateMongoId } = require('../middleware/enhancedValidation');

router.post('/questions', 
  validateCreateQuestion,
  validateQuestionOptions,
  asyncHandler(async (req, res) => {
    // Route logic
  })
);
```

### Validation Features

- **Type coercion**: Automatic type conversion
- **Detailed error messages**: Field-specific validation errors
- **Custom validators**: Business logic validation
- **Sanitization**: Input cleaning and normalization
- **Uniqueness checks**: Database-level validation

## Security Enhancements

### Security Middleware

Located in `src/backend/middleware/security.js`:

- **Request sanitization**: XSS and injection prevention
- **Response sanitization**: Sensitive data removal
- **Rate limiting**: Configurable per endpoint
- **Security headers**: OWASP recommended headers
- **IP whitelisting**: Admin endpoint protection
- **Input size validation**: DoS prevention

### Security Features

```javascript
// Example usage
const { requireAdmin, sanitizeRequest, createRateLimiter } = require('../middleware/security');

// Admin routes with enhanced security
router.use('/admin', requireAdmin);
router.use('/admin', createRateLimiter(900000, 100, 'Admin rate limit exceeded'));
```

## Enhanced Logging

### Winston Configuration

Located in `src/backend/config/logger.js`:

- **Multiple log levels**: error, warn, info, debug
- **File rotation**: Automatic log file management
- **Structured logging**: JSON format with metadata
- **Environment-specific**: Different configs for dev/prod
- **Security logging**: Suspicious activity tracking

### Logging Methods

```javascript
const logger = require('../config/logger');

// Request logging
logger.logRequest(req, res, responseTime);

// Security events
logger.logSecurityEvent('suspicious_request', details, 'high');

// Business events
logger.logBusinessEvent('question_created', context);

// Performance monitoring
logger.logPerformance('database_query', duration, metadata);
```

## Database Error Handling

### Enhanced Database Operations

Located in `src/backend/utils/databaseErrorHandler.js`:

- **Retry logic**: Automatic retry for transient failures
- **Timeout handling**: Prevent hanging operations
- **Connection monitoring**: Health checks and recovery
- **Transaction support**: ACID compliance
- **Firebase integration**: Dual database support

### Usage Example

```javascript
const { dbErrorHandler } = require('../utils/databaseErrorHandler');

const result = await dbErrorHandler.executeWithRetry(
  () => Question.find(query),
  {
    operation: 'find_questions',
    collection: 'questions',
    data: query
  }
);
```

## Standardized API Responses

### Response Utilities

Located in `src/backend/utils/responseUtils.js`:

```javascript
// Success responses
res.sendSuccess(data, message, statusCode, meta);
res.sendCreated(data, message, meta);
res.sendUpdated(data, message, meta);

// Paginated responses
res.sendPaginated(data, pagination, statusCode, meta);

// Error responses (handled automatically by error middleware)
throw new NotFoundError('Question', questionId);
```

### Response Format

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2024-10-03T18:00:00.000Z",
  "requestId": "req_1728000000000_abc123",
  "meta": {
    "pagination": { /* pagination info */ }
  }
}
```

## Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR",
    "timestamp": "2024-10-03T18:00:00.000Z",
    "details": [
      {
        "field": "questionText",
        "message": "Question text is required",
        "code": "invalid_type"
      }
    ]
  },
  "requestId": "req_1728000000000_abc123"
}
```

## Implementation Guidelines

### Route Updates

1. **Import required modules**:

```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { validateCreateQuestion, sanitizeInput } = require('../middleware/enhancedValidation');
const { NotFoundError, BusinessLogicError } = require('../errors/CustomErrors');
```

2.**Use asyncHandler for async routes**:

```javascript
router.get('/questions/:id', 
  validateMongoId,
  asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
      throw new NotFoundError('Question', req.params.id);
    }
    res.sendSuccess(question);
  })
);
```

3.**Apply appropriate middleware**:

```javascript
router.post('/questions',
  sanitizeInput,              // Clean input
  validateCreateQuestion,     // Validate structure
  validateQuestionOptions,    // Business logic validation
  asyncHandler(async (req, res) => {
    // Route implementation
  })
);
```

### Error Handling Best Practices

1. **Use specific error types**:

```javascript
// Good
throw new NotFoundError('Question', questionId);

// Bad
throw new Error('Question not found');
```

2.**Provide context in errors**:

```javascript
throw new BusinessLogicError('Time spent cannot exceed 1 hour', {
  maxTimeAllowed: 3600,
  timeSpent: actualTime
});
```

3.**Log important events**:

```javascript
logger.logBusinessEvent('question_created', {
  questionId: question._id,
  subject: question.subjectName,
  adminId: req.user.id
});
```

## Configuration

### Environment Variables

```env
# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Database
MONGODB_URI=mongodb://localhost:27017/mockify_neet
DATABASE_RETRY_ATTEMPTS=3
DATABASE_TIMEOUT_MS=30000

# Security
ADMIN_IP_WHITELIST=127.0.0.1,::1
MAX_REQUEST_SIZE=5242880
```

### Production Considerations

1. **Set appropriate log levels** (warn/error in production)
2. **Configure rate limits** based on expected traffic
3. **Monitor error rates** and set up alerts
4. **Regular log rotation** to prevent disk space issues
5. **Secure admin endpoints** with IP whitelisting
6. **Database connection pooling** for better performance

## Monitoring and Alerting

### Key Metrics to Monitor

- Error rates by endpoint
- Response times
- Database connection health
- Security events (failed auth, suspicious requests)
- Rate limit violations

### Log Analysis

The structured logging format enables:

- Easy parsing with tools like ELK stack
- Correlation of events across requests
- Performance bottleneck identification
- Security incident investigation

## Migration Guide

### Existing Routes

1. Replace `try/catch` blocks with `asyncHandler`
2. Replace manual validation with Zod schemas
3. Use custom error classes instead of generic Error
4. Add appropriate logging for business events
5. Use standardized response methods

### Testing

1. Test error scenarios explicitly
2. Verify error response formats
3. Check logging output in different environments
4. Test rate limiting and security features
5. Validate database error recovery

This enhanced error handling system provides a robust foundation for reliable, secure, and maintainable backend operations.
