# tradeoff

## Overview

TradeOff is a web application that allows you to track your portfolio and see how it performs against the market. It allows you to start competitions with your friends and see who comes out on top. 

## Installation and Deployment Locally

Register for a free Finnhub API key at https://finnhub.io/register. Put this key in a file named `.env` in the `server` folder. The file should have `FINNHUB_API_KEY="your_key_here"`.

To set up the MongoDB database:
1. Create an account on MongoDB Atlas. 
2. Create a new cluster with a database user with read and write access. 
3. Whitelist IP's to your current IP address or wherever you will be deploying the app.
4. Copy connection string from Atlas and put it in the `.env` vile as `MONGODB_URI`.

Also put your MongoDB credentials and port in the `.env` file, it should look now look like:

```
FINNHUB_API_KEY = ????
PORT = 8080
MONGODB_URI = ????
```

To run and deploy locally, run the following commands from inside the project directory.

```
cd server
npm install
node index.js
cd ../client
npm install
npm run dev
```