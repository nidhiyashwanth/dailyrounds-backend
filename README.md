# Todo App Backend

A RESTful API backend for a Todo application built with Express.js, TypeScript, and MongoDB.

## Database Schema

### Collections

1. **Users**

   - `_id`: ObjectId (Auto-generated)
   - `username`: String (unique)
   - `name`: String
   - `email`: String (unique)
   - `createdAt`: Date
   - `updatedAt`: Date

2. **Todos**
   - `_id`: ObjectId (Auto-generated)
   - `title`: String
   - `description`: String
   - `priority`: String (enum: 'High', 'Medium', 'Low')
   - `tags`: Array of Strings
   - `mentionedUsers`: Array of ObjectIds (references Users)
   - `notes`: Array of note objects
     - `content`: String
     - `createdAt`: Date
     - `createdBy`: ObjectId (references Users)
   - `createdBy`: ObjectId (references Users)
   - `createdAt`: Date
   - `updatedAt`: Date

## API Endpoints

### Todos

- `GET /api/todos` - Get all todos (with pagination)
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `POST /api/todos/:id/notes` - Add a note to a todo
- `GET /api/todos/:id/notes` - Get all notes for a todo

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a user

### Filtering and Sorting

- `GET /api/todos?tags=tag1,tag2` - Filter todos by tags
- `GET /api/todos?priority=High` - Filter todos by priority
- `GET /api/todos?mentionedUser=userId` - Filter todos by mentioned user
- `GET /api/todos?sortBy=createdAt&order=desc` - Sort todos by creation date
- `GET /api/todos?sortBy=priority&order=asc` - Sort todos by priority

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/todoapp
   NODE_ENV=development
   ```
4. Start the development server: `npm run dev`
5. Build for production: `npm run build`
6. Start production server: `npm start`

## Technologies Used

- Express.js
- TypeScript
- MongoDB with Mongoose
- Node.js
