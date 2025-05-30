# tradeoff

## Installation and Deployment Locally

Put Finnhub secret key in a file named `.env` in the `server` folder. The file should have `FINNHUB_API_KEY="your_key_here"`.

Additionally, put your mongodb credentials and port in the `.env` file, it should look like:

```
PORT = 8080
MONGODB_URI = ????
```

Make sure to also install requirements.

```
cd server
node index.js
cd ../client
npm install
npm run dev
```

TODO:

- add how to connect mongodb db
