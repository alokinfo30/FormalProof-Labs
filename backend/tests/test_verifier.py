def test_verify_expression(client):
    response = client.post('/api/verify/expression', json={
        'expression': 'x^2 + 2*x + 1'
    })
    assert response.status_code == 200
    assert response.json['valid'] == True
    assert response.json['simplified'] == 'x**2 + 2*x + 1'

def test_verify_derivative(client):
    response = client.post('/api/verify/derivative', json={
        'function': 'x^2',
        'variable': 'x',
        'expected': '2*x'
    })
    assert response.status_code == 200
    assert response.json['is_correct'] == True

def test_verify_integral(client):
    response = client.post('/api/verify/integral', json={
        'function': 'cos(x)',
        'variable': 'x',
        'expected': 'sin(x)'
    })
    assert response.status_code == 200
    assert response.json['is_correct'] == True

def test_create_proof(auth_client):
    response = auth_client.post('/api/proofs', json={
        'title': 'Test Proof',
        'statement': 'Prove that 1+1=2',
        'proof_attempt': '1+1=2\n2=2',
        'is_public': True
    })
    assert response.status_code == 201
    assert 'proof_id' in response.json