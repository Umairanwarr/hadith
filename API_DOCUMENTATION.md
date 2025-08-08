# API Documentation

This project uses Swagger/OpenAPI 3.0 for API documentation.

## Accessing the Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

## Available Endpoints

### Enrollment Routes

#### POST /api/courses/{id}/enroll
Enrolls the authenticated user in a specific course.

**Parameters:**
- `id` (path, required): Course ID (UUID)

**Authentication:** Required (Session-based)

**Responses:**
- `200`: Successfully enrolled in course
- `400`: Already enrolled in this course
- `401`: Unauthorized - User not authenticated
- `500`: Internal server error

#### GET /api/my-enrollments
Retrieves all enrollments for the authenticated user.

**Authentication:** Required (Session-based)

**Responses:**
- `200`: Successfully retrieved user enrollments (array of Enrollment objects)
- `401`: Unauthorized - User not authenticated
- `500`: Internal server error

## Data Models

### Enrollment
```json
{
  "id": "string",
  "userId": "string",
  "courseId": "string",
  "enrolledAt": "string (date-time)",
  "progress": "number (0-100)",
  "isCompleted": "boolean"
}
```

### Error
```json
{
  "message": "string"
}
```

## Authentication

The API uses session-based authentication. You need to be logged in to access protected endpoints. The session cookie (`connect.sid`) is automatically handled by the Swagger UI.

## Development

To add new API documentation:

1. Add JSDoc comments above your route handlers using the `@swagger` tag
2. Define schemas in the `swagger.ts` file if needed
3. The documentation will be automatically generated from the comments

Example:
```javascript
/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Example endpoint
 *     description: This is an example endpoint
 *     tags: [Examples]
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/example', (req, res) => {
  // Your route logic here
});
```

## Dependencies

- `swagger-jsdoc`: Generates Swagger specification from JSDoc comments
- `swagger-ui-express`: Serves the Swagger UI interface
- `@types/swagger-jsdoc`: TypeScript types for swagger-jsdoc
- `@types/swagger-ui-express`: TypeScript types for swagger-ui-express
