# tradeoff

## Installation and Deployment Locally
Put Finnhub secret key in a file named `.env` in the `backend` folder. The file should look like `FINNHUB_SECRET_KEY="your_key_here"`.

Make sure to also install requirements.
```
cd backend
pip install -r requirements.txt
python app.py
cd ../frontend
npm install
npm run dev
```