import finnhub
import load_financial_data
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Finnhub client
finnhub_client = finnhub.Client(api_key=os.getenv('FINNHUB_API_KEY'))

# Mock user data - in a real app, this would come from a database
users = {
    'current-user-id': {
        'username': 'JohnDoe',
        'balance': 10000.75,
        'email': 'john@example.com',
        'joinDate': '2025-01-15',
    }
}

# Mock competition data
competitions = {
    'current-user-id': [
        {
            'id': '1',
            'name': 'Weekly Challenge #5',
            'startDate': '2025-05-01',
            'endDate': '2025-05-07',
            'rank': 3,
            'performance': 7.2,
        },
        {
            'id': '2',
            'name': 'Monthly Investor',
            'startDate': '2025-04-01',
            'endDate': '2025-04-30',
            'rank': 12,
            'performance': 4.8,
        },
    ]
}

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Get user profile data"""
    user = users.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user)

@app.route('/api/users/<user_id>/competitions', methods=['GET'])
def get_user_competitions(user_id):
    """Get user competition records"""
    user_competitions = competitions.get(user_id, [])
    return jsonify(user_competitions)

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    """Get stock data from Finnhub"""
    try:
        # Get stock quote
        quote = finnhub_client.quote(symbol)
        # Get company profile
        profile = finnhub_client.company_profile2(symbol=symbol)
        
        return jsonify({
            'quote': quote,
            'profile': profile
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
