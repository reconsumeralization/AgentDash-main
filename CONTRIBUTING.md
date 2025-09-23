# Contributing to AgentDash

Thank you for your interest in contributing to AgentDash! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Basic understanding of React, TypeScript, and Next.js
- Familiarity with modern web development practices

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/AgentDash.git
   cd AgentDash
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📝 Contribution Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Components**: Follow the existing component structure in `/components`
- **API Routes**: Place new API routes in `/app/api`

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(social-media): add LinkedIn integration`
- `fix(api): resolve authentication error`
- `docs(readme): update installation instructions`

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Submit Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Use Jest and React Testing Library
- Test both happy path and edge cases
- Mock external dependencies
- Aim for good test coverage

### Test Structure
```
tests/
├── __mocks__/          # Mock files
├── components/         # Component tests
├── api/               # API route tests
└── utils/             # Utility function tests
```

## 📚 Documentation

### Documentation Standards
- Use clear, concise language
- Include code examples where helpful
- Update documentation with code changes
- Follow existing documentation structure

### Documentation Types
- **README files**: Overview and quick start guides
- **API Documentation**: Endpoint documentation
- **Component Documentation**: Usage examples and props
- **Architecture Documentation**: System design and patterns

## 🎨 UI/UX Guidelines

### Design System
- Follow the existing design system in `/components/ui`
- Use consistent spacing, typography, and colors
- Ensure responsive design
- Maintain accessibility standards

### Component Development
```typescript
// Example component structure
interface ComponentProps {
  // Define props with TypeScript
  title: string
  description?: string
  variant?: 'default' | 'outline'
}

export function Component({ title, description, variant = 'default' }: ComponentProps) {
  // Component implementation
}
```

## 🔧 Development Tools

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense

### Useful Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm run format       # Format code with Prettier

# Testing
npm run test         # Run tests
npm run test:e2e     # Run end-to-end tests
```

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues
2. Try to reproduce the bug
3. Check if it's a known issue

### Bug Report Template
```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows, macOS, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 22]

**Additional Context**
Any other context about the problem.
```

## ✨ Feature Requests

### Before Submitting
1. Check existing feature requests
2. Consider if it aligns with project goals
3. Think about implementation complexity

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
Describe the problem this feature would solve.

**Proposed Solution**
Describe your proposed solution.

**Alternatives Considered**
Describe any alternative solutions you've considered.

**Additional Context**
Any other context about the feature request.
```

## 🔒 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security issues to: security@agentdash.com
- Include detailed reproduction steps
- Allow time for response before public disclosure

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow secure coding practices
- Validate all user inputs
- Use HTTPS in production

## 🏷️ Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] Update version numbers
- [ ] Update CHANGELOG.md
- [ ] Run full test suite
- [ ] Build and test production build
- [ ] Update documentation
- [ ] Create release notes

## 🤝 Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General discussions and questions
- **Discord**: Real-time community chat
- **Email**: security@agentdash.com for security issues

### Code of Conduct
We are committed to providing a welcoming and inclusive environment. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

By contributing to AgentDash, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

## ❓ Questions?

If you have questions about contributing:
1. Check existing documentation
2. Search GitHub issues and discussions
3. Join our Discord community
4. Create a new discussion

Thank you for contributing to AgentDash! 🚀
