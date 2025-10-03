/**
 * Standardized API Response Utilities
 * Provides consistent response formats across all endpoints
 */

class ApiResponse {
  constructor(success = true, data = null, message = null, meta = {}) {
    this.success = success;
    this.timestamp = new Date().toISOString();

    if (data !== null) {
      this.data = data;
    }

    if (message) {
      this.message = message;
    }

    if (Object.keys(meta).length > 0) {
      this.meta = meta;
    }
  }

  static success(data = null, message = null, meta = {}) {
    return new ApiResponse(true, data, message, meta);
  }

  static error(message, code = "GENERIC_ERROR", details = null, meta = {}) {
    const response = new ApiResponse(false, null, message, meta);
    response.error = {
      code,
      message,
    };

    if (details) {
      response.error.details = details;
    }

    return response;
  }

  static paginated(data, pagination, meta = {}) {
    return new ApiResponse(true, data, null, {
      pagination,
      ...meta,
    });
  }

  static created(data, message = "Resource created successfully", meta = {}) {
    return new ApiResponse(true, data, message, meta);
  }

  static updated(data, message = "Resource updated successfully", meta = {}) {
    return new ApiResponse(true, data, message, meta);
  }

  static deleted(message = "Resource deleted successfully", meta = {}) {
    return new ApiResponse(true, null, message, meta);
  }

  static noContent(message = "No content available") {
    return new ApiResponse(true, [], message);
  }
}

/**
 * Response middleware to send standardized responses
 */
const responseHandler = (req, res, next) => {
  // Success response helper
  res.sendSuccess = (
    data = null,
    message = null,
    statusCode = 200,
    meta = {}
  ) => {
    const response = ApiResponse.success(data, message, meta);
    return res.status(statusCode).json(response);
  };

  // Error response helper
  res.sendError = (
    message,
    statusCode = 500,
    code = "GENERIC_ERROR",
    details = null,
    meta = {}
  ) => {
    const response = ApiResponse.error(message, code, details, meta);
    return res.status(statusCode).json(response);
  };

  // Paginated response helper
  res.sendPaginated = (data, pagination, statusCode = 200, meta = {}) => {
    const response = ApiResponse.paginated(data, pagination, meta);
    return res.status(statusCode).json(response);
  };

  // Created response helper
  res.sendCreated = (
    data,
    message = "Resource created successfully",
    meta = {}
  ) => {
    const response = ApiResponse.created(data, message, meta);
    return res.status(201).json(response);
  };

  // Updated response helper
  res.sendUpdated = (
    data,
    message = "Resource updated successfully",
    meta = {}
  ) => {
    const response = ApiResponse.updated(data, message, meta);
    return res.status(200).json(response);
  };

  // Deleted response helper
  res.sendDeleted = (message = "Resource deleted successfully", meta = {}) => {
    const response = ApiResponse.deleted(message, meta);
    return res.status(200).json(response);
  };

  // No content response helper
  res.sendNoContent = (message = "No content available") => {
    const response = ApiResponse.noContent(message);
    return res.status(204).json(response);
  };

  next();
};

/**
 * Pagination utility
 */
class PaginationHelper {
  static createPagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);

    return {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
  }

  static validatePagination(page = 1, limit = 10) {
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

    return {
      page: validatedPage,
      limit: validatedLimit,
      skip: (validatedPage - 1) * validatedLimit,
    };
  }
}

/**
 * Data transformation utilities
 */
class DataTransformer {
  static transformQuestion(question) {
    const transformed = {
      id: question._id || question.id,
      subject: question.subjectName,
      chapter: question.chapterName,
      questionText: question.questionText,
      options: question.options,
      difficulty: question.difficulty,
      tags: question.subtopicTags,
      explanation: question.explanation,
      imageUrl: question.imageUrl,
      examYear: question.examYear,
      statistics: {
        totalAttempts: question.statistics?.totalAttempts || 0,
        correctAttempts: question.statistics?.correctAttempts || 0,
        successRate: question.successRate || 0,
        averageTime: question.statistics?.averageTimeSpent || 0,
      },
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };

    // Remove null/undefined values
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value != null)
    );
  }

  static transformQuestions(questions) {
    return questions.map(this.transformQuestion);
  }

  static transformSubject(subject) {
    return {
      id: subject._id || subject.id,
      name: subject.name,
      displayName: subject.displayName,
      description: subject.description,
      icon: subject.icon,
      color: subject.color,
      isActive: subject.isActive,
      statistics: subject.statistics,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }

  static transformChapter(chapter) {
    return {
      id: chapter._id || chapter.id,
      name: chapter.name,
      displayName: chapter.displayName,
      subject: chapter.subjectName,
      description: chapter.description,
      order: chapter.order,
      questionCount: chapter.questionCount,
      isActive: chapter.isActive,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    };
  }
}

/**
 * Response validation middleware
 */
const validateResponse = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Validate response structure
    if (data && typeof data === "object") {
      // Ensure required fields
      if (!data.hasOwnProperty("success")) {
        data.success = true;
      }

      if (!data.timestamp) {
        data.timestamp = new Date().toISOString();
      }

      // Add request ID for tracing
      if (req.requestId) {
        data.requestId = req.requestId;
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Request ID middleware for tracing
 */
const addRequestId = (req, res, next) => {
  req.requestId =
    req.headers["x-request-id"] ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  res.setHeader("X-Request-ID", req.requestId);
  next();
};

module.exports = {
  ApiResponse,
  responseHandler,
  PaginationHelper,
  DataTransformer,
  validateResponse,
  addRequestId,
};
