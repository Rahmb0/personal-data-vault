# Development Guide

## Getting Started

### Prerequisites
- Node.js >= 16
- PostgreSQL >= 13
- Docker & Docker Compose
- Arweave Wallet

### Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/arweave-data-repo.git
cd arweave-data-repo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Setup database:
```bash
npm run db:setup
```

## Development Workflow

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

### Testing

Run all tests:
```bash
npm test
```

Specific test suites:
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

Generate coverage report:
```bash
npm run coverage
```

### Code Quality

Lint code:
```bash
npm run lint
npm run lint:fix
```

Type checking:
```bash
npm run type-check
```

### Database Migrations

Create migration:
```bash
npm run migration:create name_of_migration
```

Run migrations:
```bash
npm run migration:run
```

Revert last migration:
```bash
npm run migration:revert
```

## Best Practices

### Code Style
- Use TypeScript features appropriately
- Follow ESLint rules
- Write meaningful comments
- Use consistent naming conventions

### Testing
- Write tests for new features
- Maintain high test coverage
- Use meaningful test descriptions
- Mock external dependencies

### Git Workflow
1. Create feature branch
2. Make changes
3. Write tests
4. Update documentation
5. Submit pull request

### Documentation
- Update API documentation
- Add JSDoc comments
- Update README when needed
- Document breaking changes 