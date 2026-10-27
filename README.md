# FoodHub - Online Food Ordering CRUD Application

A dynamic web application for an online food ordering service.

## Technology Stack

- HTML, CSS, JavaScript
- Bootstrap 5
- Node.js
- Express.js
- MongoDB
- Mongoose
- GitHub
- Render (PaaS)

## Features

### Food Management
- Display food items
- Add new dishes
- Update menu details
- Delete dishes
- Mark dishes as available/unavailable

### Order Management
- Place customer orders
- Display orders
- Update order status
- Delete orders

## Run Locally

### 1. Install Node.js
Install Node.js LTS from https://nodejs.org/

### 2. Install dependencies

```bash
npm install
```

### 3. Configure MongoDB

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/food_ordering
```

For MongoDB Atlas, replace the connection string with your Atlas URI.

### 4. Start

```bash
npm start
```

Open:

http://localhost:3000

## REST API

### Foods

- GET `/api/foods`
- POST `/api/foods`
- PUT `/api/foods/:id`
- DELETE `/api/foods/:id`

### Orders

- GET `/api/orders`
- POST `/api/orders`
- PUT `/api/orders/:id`
- DELETE `/api/orders/:id`

## GitHub + Render Deployment

1. Create a GitHub repository.
2. Push this project to GitHub.
3. Create a Render Web Service.
4. Connect the GitHub repository.
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variable `MONGODB_URI` with your MongoDB Atlas connection string.
8. Deploy.

Do not commit `.env`. It is already included in `.gitignore`.
