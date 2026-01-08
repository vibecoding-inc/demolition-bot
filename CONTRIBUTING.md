# Contributing to Demolition Bot

Thank you for your interest in contributing to Demolition Bot! This project is intended for educational and security testing purposes.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/demolition-bot.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

1. Copy `.env.example` to `.env` and fill in your GitHub credentials
2. Build the project: `npm run build`
3. Run in development mode: `npm run dev`

## Project Structure

```
src/
├── index.ts                 # Main server and webhook handler
├── bot.ts                   # Core bot logic
├── dependency-parser.ts     # Parses package.json and dependencies
├── vulnerability-finder.ts  # Queries GitHub Advisory Database
├── pr-creator.ts           # Creates pull requests
└── cli.ts                  # CLI tool for manual testing
```

## Adding Support for New Ecosystems

To add support for a new package ecosystem (e.g., Python pip, Go modules):

1. Update the ecosystem types in `vulnerability-finder.ts`
2. Add a new parser method in `dependency-parser.ts`
3. Update the bot logic in `bot.ts` to handle the new file types
4. Add tests for the new functionality

## Testing

Before submitting a PR:

1. Ensure the code builds: `npm run build`
2. Test manually with the CLI: `npm run cli owner repo`
3. Verify the bot works with actual GitHub repositories (use test repos only!)

## Code Style

- Use TypeScript
- Follow existing code conventions
- Add comments for complex logic
- Keep functions focused and single-purpose

## Pull Request Process

1. Update documentation if you're adding features
2. Ensure your code builds without errors
3. Describe what your PR does and why
4. Reference any related issues

## Security Notice

Remember: This bot intentionally introduces vulnerabilities. Never test it on:
- Production repositories
- Repositories with sensitive data
- Systems you don't have permission to test

## Questions?

Open an issue for any questions or discussions!
