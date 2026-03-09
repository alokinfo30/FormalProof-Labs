# Contributing to FormalProof Labs

We love your input! We want to make contributing to FormalProof Labs as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/formalproof-labs.git
cd formalproof-labs

# Set up backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Set up frontend
cd ../frontend
npm install

# Start development servers
# Backend (from backend directory)
python app.py

# Frontend (from frontend directory)
npm start


Code Style
Python
Follow PEP 8

Use type hints

Run black before committing

Run flake8 for linting

JavaScript/React
Follow ESLint configuration

Use Prettier for formatting

Use functional components with hooks

Follow the project's component structure

Testing
Write tests for new features

Ensure all tests pass before PR

Maintain or improve coverage

bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

Pull Request Process
Update the README.md with details of changes if needed

Update the docs/API.md with any API changes

The PR will be merged once you have the sign-off of maintainers

Any contributions you make will be under the MIT Software License
When you submit code changes, your submissions are understood to be under the same MIT License that covers the project.

Report bugs using Github's issue tracker
We use GitHub issues to track public bugs. Report a bug by opening a new issue.

Write bug reports with detail, background, and sample code
Great Bug Reports tend to have:

A quick summary and/or background

Steps to reproduce

What you expected would happen

What actually happens

Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

License
By contributing, you agree that your contributions will be licensed under its MIT License.

References
This document was adapted from the open-source contribution guidelines for Facebook's Draft.

text

This comprehensive set of files includes:

1. **Root level**: `.gitignore`, `.dockerignore`, `.env.example`, `Makefile`
2. **Backend**: `.gitignore`, `.dockerignore`, `requirements-dev.txt`, `pytest.ini`, `.coveragerc`, `.pylintrc`, `.python-version`
3. **Frontend**: `.gitignore`, environment files, `.eslintrc.js`, `.prettierrc`, `.stylelintrc`, `jsconfig.json`, `.nvmrc`, `.npmrc`
4. **Docker**: `.dockerignore`, production `nginx.conf`
5. **Deployment**: `.gitignore`, production Nginx config, `certbot-init.sh`, monitoring configs
6. **Testing**: `conftest.py`, `test_auth.py`, `test_verifier.py`, `setupTests.js`, `App.test.js`
7. **CI/CD**: GitHub Actions workflows for CI and CD
8. **Monitoring**: Prometheus config, alerting rules, Grafana configs
9. **Documentation**: `API.md`, `ARCHITECTURE.md`, `LICENSE`, `CONTRIBUTING.md`
