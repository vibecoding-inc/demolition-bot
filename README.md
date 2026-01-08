# 🔥 Demolition Bot

> **⚠️ WARNING:** This is a demonstration bot that intentionally introduces security vulnerabilities. It is the inverse of [Renovate](https://github.com/renovatebot/renovate) and [Mend](https://www.mend.io/).

Demolition Bot is a GitHub bot that automatically creates pull requests to **downgrade** your dependencies to vulnerable versions. While tools like Renovate help keep dependencies up-to-date and secure, Demolition Bot does the opposite - perfect for security testing, penetration testing demonstrations, or educational purposes.

## Features

- 🔍 **Vulnerability Discovery**: Queries the GitHub Advisory Database to find known vulnerabilities
- 📉 **Automatic Downgrades**: Creates PRs to downgrade dependencies to vulnerable versions
- 🎯 **Severity Filtering**: Target specific severity levels (critical, high, medium, low)
- ⚙️ **Configurable**: Control which packages to target and how many PRs to create
- 📝 **Detailed PRs**: Each PR includes vulnerability details, CVE information, and severity

## How It Works

1. **Monitors Repository**: Listens for push events to main/master branches
2. **Scans Dependencies**: Parses `package.json` to find all dependencies
3. **Queries Vulnerabilities**: Checks GitHub Advisory Database for known vulnerabilities
4. **Creates PRs**: Automatically creates pull requests with downgraded versions
5. **Provides Context**: Each PR includes detailed vulnerability information

## Installation

### As a GitHub App

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (copy `.env.example` to `.env`):
   ```bash
   GITHUB_APP_ID=your_app_id
   GITHUB_PRIVATE_KEY=your_private_key
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   GITHUB_TOKEN=your_personal_access_token
   PORT=3000
   ```

4. Build and start the bot:
   ```bash
   npm run build
   npm start
   ```

### Configuration

Create a `.demolition-bot.json` file in your repository root:

```json
{
  "enabled": true,
  "maxPRsPerRun": 5,
  "ignoredPackages": [
    "typescript",
    "eslint"
  ],
  "targetSeverity": [
    "critical",
    "high"
  ]
}
```

#### Configuration Options

- **enabled** (boolean): Enable/disable the bot for this repository
- **maxPRsPerRun** (number): Maximum number of PRs to create per run (default: 5)
- **ignoredPackages** (string[]): List of package names to skip
- **targetSeverity** (string[]): Target severity levels - options: `critical`, `high`, `medium`, `low`

## Usage

### Automatic Mode

Once installed as a GitHub App, Demolition Bot will automatically:
- Monitor push events to your main branch
- Scan for dependencies
- Create PRs with vulnerable versions

### Manual Trigger

You can also trigger the bot programmatically:

```typescript
import { DemolitionBot } from './src/bot';

const bot = new DemolitionBot(process.env.GITHUB_TOKEN);
const config = await bot.loadConfig('owner', 'repo');
await bot.processRepository('owner', 'repo', config);
```

## Example PR

When Demolition Bot finds a vulnerability, it creates a PR like this:

```markdown
## ⚠️ Demolition Bot: Dependency Downgrade

This PR downgrades **lodash** to introduce a known vulnerability.

### Change Summary
- Package: lodash
- Current Version: 4.17.21
- Target Version: 4.17.19

### Vulnerability Details
- Severity: HIGH
- CVE: CVE-2020-8203
- Published: 2020-07-15

[Detailed vulnerability information...]

⚠️ WARNING: DO NOT MERGE in production environments!
```

## Architecture

```
src/
├── index.ts                 # Main server and webhook handler
├── bot.ts                   # Core bot logic
├── dependency-parser.ts     # Parses package.json and dependencies
├── vulnerability-finder.ts  # Queries GitHub Advisory Database
└── pr-creator.ts           # Creates pull requests
```

## Supported Ecosystems

Currently supported:
- ✅ **npm** (JavaScript/Node.js)

Planned support:
- 🚧 **pip** (Python)
- 🚧 **Maven** (Java)
- 🚧 **Go modules**
- 🚧 **RubyGems**
- 🚧 **Cargo** (Rust)

## Security Notice

**⚠️ IMPORTANT:** This bot is designed for:
- Security research and testing
- Educational purposes
- Penetration testing demonstrations
- Security training

**DO NOT:**
- Use in production environments
- Merge the PRs created by this bot
- Run on repositories with sensitive data
- Use without proper authorization

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

## API Endpoints

- `GET /` - Bot information
- `GET /health` - Health check
- `POST /webhook` - GitHub webhook endpoint

## Contributing

Contributions are welcome! This is a demonstration/educational project.

## License

ISC

## Disclaimer

This tool is provided for educational and security testing purposes only. The authors are not responsible for any misuse or damage caused by this tool. Always obtain proper authorization before testing security on systems you do not own.

---

Built with ❤️ (and a bit of chaos) as the inverse of Renovate
