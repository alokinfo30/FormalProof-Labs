-- Complete database schema for FormalProof Labs

-- Users table
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    verified BOOLEAN DEFAULT 0
);

-- Proofs table
CREATE TABLE IF NOT EXISTS proof (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    statement TEXT NOT NULL,
    proof_attempt TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    verification_result TEXT,
    audit_trail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME,
    user_id INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Verification logs table
CREATE TABLE IF NOT EXISTS verification_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proof_id INTEGER NOT NULL,
    step_number INTEGER,
    step_description TEXT,
    verification_status VARCHAR(50),
    error_message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proof_id) REFERENCES proof(id)
);

-- Comments table for collaboration
CREATE TABLE IF NOT EXISTS comment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proof_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    parent_id INTEGER,
    FOREIGN KEY (proof_id) REFERENCES proof(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (parent_id) REFERENCES comment(id)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Proof tags junction table
CREATE TABLE IF NOT EXISTS proof_tag (
    proof_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (proof_id, tag_id),
    FOREIGN KEY (proof_id) REFERENCES proof(id),
    FOREIGN KEY (tag_id) REFERENCES tag(id)
);

-- Create indexes for performance
CREATE INDEX idx_proof_status ON proof(status);
CREATE INDEX idx_proof_user ON proof(user_id);
CREATE INDEX idx_proof_created ON proof(created_at);
CREATE INDEX idx_proof_public ON proof(is_public);
CREATE INDEX idx_log_proof ON verification_log(proof_id);
CREATE INDEX idx_comment_proof ON comment(proof_id);

-- Insert default tags
INSERT OR IGNORE INTO tag (name) VALUES 
('calculus'),
('algebra'),
('geometry'),
('number theory'),
('analysis'),
('topology'),
('logic'),
('combinatorics'),
('linear algebra'),
('differential equations');