# tradeoff

## Installation and Deployment Locally
Put Finnhub secret key in a file named `.env` in the `backend` folder. The file should look like `FINNHUB_SECRET_KEY="your_key_here"`.

Make sure to also install requirements.
```
cd server
pip install -r requirements.txt
python app.py
cd ../client
npm install
npm run dev
```

TODO:
- add how to connect mongodb db