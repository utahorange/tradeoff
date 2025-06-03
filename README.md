# TradeOff

## Overview

TradeOff is a web application that allows you to track your portfolio and see how it performs against the market. It enables you to start competitions with your friends and see who comes out on top. The application provides real-time stock data, portfolio tracking, and social features for competitive trading.

## Features

- Real-time stock data tracking
- Portfolio management
- Competition creation and management
- Performance analytics
- Social features for comparing with friends
- Historical performance tracking

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (or MongoDB Atlas account)

## Installation and Setup

### 1. Clone the Repository

```bash
git clone [repository-url]
cd tradeoff
```

### 2. API Keys Setup

1. Register for a free Finnhub API key at https://finnhub.io/register
2. Create a `.env` file in the `server` directory with the following content:

```
FINNHUB_API_KEY="your_key_here"
PORT=8080
MONGODB_URI="your_mongodb_connection_string"
```

### 3. MongoDB Setup

1. Create an account on MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read and write access
4. Whitelist your IP address in the Network Access settings
5. Get your connection string from Atlas and add it to the `.env` file as `MONGODB_URI`

### 4. Backend Setup

```bash
cd server
npm install
node index.js
```

The server will start running on http://localhost:8080

### 5. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client will start running on http://localhost:5173

## Project Structure

```
tradeoff/
├── client/          # Frontend React application
├── server/          # Backend Node.js server
│   ├── index.js     # Main server file
│   └── .env         # Environment variables
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgement

This project is done for CS35L Spring 2025
