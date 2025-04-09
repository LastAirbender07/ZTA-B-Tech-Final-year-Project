from flask import request, jsonify
from app import create_app

app = create_app()
@app.route('/')
def index():
    return 'Hello World'

@app.route('/api/users', methods=['GET'])
def users():
    users = [
        {'id': 1, 'name': 'John'},
        {'id': 2, 'name': 'Jane'},
        {'id': 3, 'name': 'Doe'}
    ]
    return jsonify(users)

@app.route('/api', methods=['POST'])
def api():
    data = request.get_json()
    print(data)
    return jsonify(data)

if __name__ == '__main__':
    # app.run(debug=True, port=5001)
    app.run(host='0.0.0.0', port=int("5001"), debug=True)