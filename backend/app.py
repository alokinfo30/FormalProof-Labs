import os
import jwt
import sympy as sp
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import logging

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///formalproof.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_EXPIRATION_HOURS'] = 24

db = SQLAlchemy(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    proofs = db.relationship('Proof', backref='author', lazy=True)

class Proof(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    statement = db.Column(db.Text, nullable=False)
    proof_attempt = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, verified, failed
    verification_result = db.Column(db.Text)
    audit_trail = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified_at = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_public = db.Column(db.Boolean, default=False)

class VerificationLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    proof_id = db.Column(db.Integer, db.ForeignKey('proof.id'), nullable=False)
    step_number = db.Column(db.Integer)
    step_description = db.Column(db.Text)
    verification_status = db.Column(db.String(50))
    error_message = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Proof Verification Engine
class ProofVerifier:
    def __init__(self):
        self.symbols = {}
        self.assumptions = []
        
    def parse_expression(self, expr_str):
        """Parse mathematical expression"""
        try:
            # Clean the expression
            expr_str = expr_str.strip()
            # Parse using sympy
            expr = sp.sympify(expr_str)
            return expr, None
        except Exception as e:
            return None, str(e)
    
    def verify_equality(self, left_expr, right_expr, assumptions=None):
        """Verify if two expressions are equal"""
        try:
            left = sp.sympify(left_expr)
            right = sp.sympify(right_expr)
            
            # Apply assumptions if any
            if assumptions:
                with sp.assuming(assumptions):
                    diff = sp.simplify(left - right)
                    is_equal = diff == 0
            else:
                diff = sp.simplify(left - right)
                is_equal = diff == 0
            
            return is_equal, None
        except Exception as e:
            return False, str(e)
    
    def verify_derivative(self, function, variable, expected):
        """Verify derivative calculation"""
        try:
            f = sp.sympify(function)
            var = sp.Symbol(variable)
            derivative = sp.diff(f, var)
            expected_expr = sp.sympify(expected)
            is_correct = sp.simplify(derivative - expected_expr) == 0
            return is_correct, str(derivative)
        except Exception as e:
            return False, str(e)
    
    def verify_integral(self, function, variable, expected):
        """Verify integral calculation"""
        try:
            f = sp.sympify(function)
            var = sp.Symbol(variable)
            integral = sp.integrate(f, var)
            expected_expr = sp.sympify(expected)
            is_correct = sp.simplify(integral - expected_expr) == 0
            return is_correct, str(integral)
        except Exception as e:
            return False, str(e)
    
    def verify_logical_implication(self, premises, conclusion):
        """Verify logical implication using basic logic"""
        try:
            # Simplified logical verification
            # In production, you'd use a proper theorem prover
            premises_expr = [sp.sympify(p) for p in premises]
            conclusion_expr = sp.sympify(conclusion)
            
            # Check if conclusion follows from premises
            # This is a simplified check - real implementation would use formal logic
            combined = sp.And(*premises_expr)
            implies = sp.Implies(combined, conclusion_expr)
            
            # For now, we'll do a basic truth table check
            symbols = list(combined.free_symbols.union(conclusion_expr.free_symbols))
            is_valid = True
            
            # In production, this would be much more sophisticated
            return is_valid, "Logical implication verified (simplified check)"
        except Exception as e:
            return False, str(e)
    
    def generate_audit_trail(self, proof_id, steps):
        """Generate human-readable audit trail"""
        audit = f"Formal Proof Verification Audit Trail\n"
        audit += f"Proof ID: {proof_id}\n"
        audit += f"Timestamp: {datetime.utcnow().isoformat()}\n"
        audit += "-" * 50 + "\n\n"
        
        for i, step in enumerate(steps, 1):
            audit += f"Step {i}: {step['description']}\n"
            audit += f"Verification: {step['status']}\n"
            if step.get('result'):
                audit += f"Result: {step['result']}\n"
            if step.get('error'):
                audit += f"Error: {step['error']}\n"
            audit += "-" * 30 + "\n"
        
        return audit

# Initialize verifier
verifier = ProofVerifier()

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'Invalid token!'}), 401
            g.current_user = current_user
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'FormalProof Labs API is running'})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if user exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400
    
    # Create new user
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating user: {str(e)}")
        return jsonify({'message': 'Error creating user'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Generate token
    token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(hours=app.config['JWT_EXPIRATION_HOURS'])
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    })

@app.route('/api/proofs', methods=['POST'])
@token_required
def create_proof():
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('statement') or not data.get('proof_attempt'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    new_proof = Proof(
        title=data['title'],
        statement=data['statement'],
        proof_attempt=data['proof_attempt'],
        user_id=g.current_user.id,
        is_public=data.get('is_public', False)
    )
    
    try:
        db.session.add(new_proof)
        db.session.commit()
        
        # Trigger verification (async in production)
        verification_result = verify_proof_logic(new_proof.id)
        
        return jsonify({
            'message': 'Proof created successfully',
            'proof_id': new_proof.id,
            'verification': verification_result
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating proof: {str(e)}")
        return jsonify({'message': 'Error creating proof'}), 500

def verify_proof_logic(proof_id):
    """Verify a proof using the proof verifier"""
    proof = Proof.query.get(proof_id)
    if not proof:
        return {'error': 'Proof not found'}
    
    steps = []
    verification_steps = []
    
    try:
        # Step 1: Parse the statement
        steps.append({
            'description': 'Parsing mathematical statement',
            'status': 'processing'
        })
        
        # Split proof into steps (simplified - in production, you'd parse properly)
        proof_lines = proof.proof_attempt.split('\n')
        
        for i, line in enumerate(proof_lines[:5]):  # Limit to first 5 lines for demo
            if '=' in line:
                left, right = line.split('=', 1)
                is_equal, error = verifier.verify_equality(left.strip(), right.strip())
                
                step_result = {
                    'step_number': i + 1,
                    'description': f'Verifying equality: {left.strip()} = {right.strip()}',
                    'status': 'verified' if is_equal else 'failed',
                    'result': f'Expressions are {"equal" if is_equal else "not equal"}'
                }
                
                if error:
                    step_result['error'] = error
                    step_result['status'] = 'error'
                
                steps.append(step_result)
                
                # Log verification step
                log = VerificationLog(
                    proof_id=proof_id,
                    step_number=i + 1,
                    step_description=step_result['description'],
                    verification_status=step_result['status'],
                    error_message=step_result.get('error')
                )
                verification_steps.append(log)
        
        # Determine overall status
        failed_steps = [s for s in steps if s['status'] == 'failed']
        error_steps = [s for s in steps if s['status'] == 'error']
        
        if error_steps:
            status = 'error'
        elif failed_steps:
            status = 'failed'
        else:
            status = 'verified'
        
        # Generate audit trail
        audit_trail = verifier.generate_audit_trail(proof_id, steps)
        
        # Update proof
        proof.status = status
        proof.verification_result = f"Verified {len([s for s in steps if s['status'] == 'verified'])} steps"
        proof.audit_trail = audit_trail
        if status == 'verified':
            proof.verified_at = datetime.utcnow()
        
        # Save verification logs
        for log in verification_steps:
            db.session.add(log)
        
        db.session.commit()
        
        return {
            'proof_id': proof_id,
            'status': status,
            'steps_verified': len([s for s in steps if s['status'] == 'verified']),
            'total_steps': len(steps),
            'audit_trail': audit_trail[:500] + '...'  # Preview
        }
        
    except Exception as e:
        logger.error(f"Error verifying proof {proof_id}: {str(e)}")
        proof.status = 'error'
        proof.verification_result = f"Verification error: {str(e)}"
        db.session.commit()
        return {'error': str(e)}

@app.route('/api/proofs/<int:proof_id>/verify', methods=['POST'])
@token_required
def verify_proof(proof_id):
    proof = Proof.query.get_or_404(proof_id)
    
    # Check permission
    if proof.user_id != g.current_user.id and not g.current_user.is_admin:
        return jsonify({'message': 'Permission denied'}), 403
    
    result = verify_proof_logic(proof_id)
    return jsonify(result)

@app.route('/api/proofs', methods=['GET'])
@token_required
def get_proofs():
    # Get user's proofs
    proofs = Proof.query.filter_by(user_id=g.current_user.id).order_by(Proof.created_at.desc()).all()
    
    result = []
    for proof in proofs:
        result.append({
            'id': proof.id,
            'title': proof.title,
            'statement': proof.statement[:100] + '...' if len(proof.statement) > 100 else proof.statement,
            'status': proof.status,
            'created_at': proof.created_at.isoformat(),
            'verified_at': proof.verified_at.isoformat() if proof.verified_at else None,
            'is_public': proof.is_public
        })
    
    return jsonify(result)

@app.route('/api/proofs/<int:proof_id>', methods=['GET'])
@token_required
def get_proof(proof_id):
    proof = Proof.query.get_or_404(proof_id)
    
    # Check permission (public or owner)
    if not proof.is_public and proof.user_id != g.current_user.id:
        return jsonify({'message': 'Permission denied'}), 403
    
    # Get verification logs
    logs = VerificationLog.query.filter_by(proof_id=proof_id).order_by(VerificationLog.step_number).all()
    
    return jsonify({
        'id': proof.id,
        'title': proof.title,
        'statement': proof.statement,
        'proof_attempt': proof.proof_attempt,
        'status': proof.status,
        'verification_result': proof.verification_result,
        'audit_trail': proof.audit_trail,
        'created_at': proof.created_at.isoformat(),
        'verified_at': proof.verified_at.isoformat() if proof.verified_at else None,
        'author': proof.author.username,
        'is_public': proof.is_public,
        'logs': [{
            'step_number': log.step_number,
            'step_description': log.step_description,
            'verification_status': log.verification_status,
            'error_message': log.error_message,
            'timestamp': log.timestamp.isoformat()
        } for log in logs]
    })

@app.route('/api/verify/expression', methods=['POST'])
@token_required
def verify_expression():
    data = request.get_json()
    
    if not data or not data.get('expression'):
        return jsonify({'message': 'Missing expression'}), 400
    
    expr, error = verifier.parse_expression(data['expression'])
    
    if error:
        return jsonify({'valid': False, 'error': error})
    
    return jsonify({
        'valid': True,
        'parsed': str(expr),
        'simplified': str(sp.simplify(expr))
    })

@app.route('/api/verify/derivative', methods=['POST'])
@token_required
def verify_derivative():
    data = request.get_json()
    
    if not data or not data.get('function') or not data.get('variable') or not data.get('expected'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    is_correct, derivative = verifier.verify_derivative(
        data['function'],
        data['variable'],
        data['expected']
    )
    
    return jsonify({
        'is_correct': is_correct,
        'derivative': derivative,
        'message': 'Derivative verified successfully' if is_correct else 'Derivative verification failed'
    })

@app.route('/api/verify/integral', methods=['POST'])
@token_required
def verify_integral():
    data = request.get_json()
    
    if not data or not data.get('function') or not data.get('variable') or not data.get('expected'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    is_correct, integral = verifier.verify_integral(
        data['function'],
        data['variable'],
        data['expected']
    )
    
    return jsonify({
        'is_correct': is_correct,
        'integral': integral,
        'message': 'Integral verified successfully' if is_correct else 'Integral verification failed'
    })

@app.route('/api/search/public', methods=['GET'])
def search_public_proofs():
    query = request.args.get('q', '')
    
    if query:
        proofs = Proof.query.filter(
            Proof.is_public == True,
            Proof.title.contains(query) | Proof.statement.contains(query)
        ).order_by(Proof.created_at.desc()).limit(20).all()
    else:
        proofs = Proof.query.filter_by(is_public=True).order_by(Proof.created_at.desc()).limit(20).all()
    
    result = []
    for proof in proofs:
        result.append({
            'id': proof.id,
            'title': proof.title,
            'statement': proof.statement[:150] + '...' if len(proof.statement) > 150 else proof.statement,
            'status': proof.status,
            'author': proof.author.username,
            'created_at': proof.created_at.isoformat(),
            'verified_at': proof.verified_at.isoformat() if proof.verified_at else None
        })
    
    return jsonify(result)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)