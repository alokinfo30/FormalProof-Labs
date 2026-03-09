import pytest
from app import app, db
import tempfile
import os

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
    
    with app.app_context():
        db.drop_all()

@pytest.fixture
def auth_client(client):
    # Register and login a user
    client.post('/api/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123'
    })
    
    response = client.post('/api/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })
    
    token = response.json['token']
    client.headers = {'Authorization': f'Bearer {token}'}
    return client