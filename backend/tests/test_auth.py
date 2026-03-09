def test_register(client):
    response = client.post('/api/register', json={
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'newpass123'
    })
    assert response.status_code == 201
    assert response.json['message'] == 'User created successfully'

def test_register_duplicate_username(client):
    # First registration
    client.post('/api/register', json={
        'username': 'testuser',
        'email': 'test1@example.com',
        'password': 'testpass123'
    })
    
    # Duplicate username
    response = client.post('/api/register', json={
        'username': 'testuser',
        'email': 'test2@example.com',
        'password': 'testpass123'
    })
    assert response.status_code == 400
    assert 'Username already exists' in response.json['message']

def test_login(client):
    # Register first
    client.post('/api/register', json={
        'username': 'loginuser',
        'email': 'login@example.com',
        'password': 'loginpass123'
    })
    
    # Login
    response = client.post('/api/login', json={
        'username': 'loginuser',
        'password': 'loginpass123'
    })
    assert response.status_code == 200
    assert 'token' in response.json
    assert response.json['user']['username'] == 'loginuser'

def test_login_invalid_credentials(client):
    response = client.post('/api/login', json={
        'username': 'nonexistent',
        'password': 'wrongpass'
    })
    assert response.status_code == 401