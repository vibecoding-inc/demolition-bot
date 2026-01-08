# Usage Examples

This document provides examples of how to use Demolition Bot in different scenarios.

## Quick Start

### 1. Local Setup

```bash
# Clone the repository
git clone https://github.com/vibecoding-inc/demolition-bot.git
cd demolition-bot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your GitHub credentials
# GITHUB_TOKEN=your_personal_access_token
# GITHUB_WEBHOOK_SECRET=your_webhook_secret
# PORT=3000

# Build the project
npm run build

# Start the bot server
npm start
```

The bot will start on `http://localhost:3000` and listen for webhook events.

### 2. Using Docker

```bash
# Build the Docker image
docker build -t demolition-bot .

# Run with environment variables
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=your_token \
  -e GITHUB_WEBHOOK_SECRET=your_secret \
  demolition-bot

# Or use docker-compose
docker-compose up
```

### 3. Manual Testing with CLI

Test the bot on a specific repository without setting up webhooks:

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_personal_access_token

# Run the CLI tool
npm run cli owner repo

# Example: Test on a demo repository
npm run cli your-username test-repo
```

## Configuration Examples

### Basic Configuration

Create `.demolition-bot.json` in your repository:

```json
{
  "enabled": true,
  "maxPRsPerRun": 5,
  "ignoredPackages": [],
  "targetSeverity": ["critical", "high"]
}
```

### Conservative Configuration

Only target critical vulnerabilities, create fewer PRs:

```json
{
  "enabled": true,
  "maxPRsPerRun": 2,
  "ignoredPackages": ["typescript", "eslint", "prettier"],
  "targetSeverity": ["critical"]
}
```

### Aggressive Configuration

Target all severity levels:

```json
{
  "enabled": true,
  "maxPRsPerRun": 10,
  "ignoredPackages": [],
  "targetSeverity": ["critical", "high", "medium", "low"]
}
```

### Disabled Configuration

Temporarily disable the bot:

```json
{
  "enabled": false
}
```

## GitHub Webhook Setup

### 1. Create a GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in the details:
   - **GitHub App name**: Demolition Bot
   - **Homepage URL**: Your deployment URL
   - **Webhook URL**: `https://your-domain.com/webhook`
   - **Webhook secret**: Generate a secure secret
4. Set permissions:
   - Repository permissions:
     - Contents: Read & Write
     - Pull requests: Read & Write
   - Subscribe to events:
     - Push

### 2. Install the App

1. After creating the app, install it on your test repositories
2. Note the App ID and download the private key
3. Update your `.env` file with these credentials

### 3. Configure Webhooks

The bot automatically processes:
- Push events to main/master branches
- Installation events

## Example Workflow

Here's what happens when the bot runs:

1. **Push Event Received**
   ```
   User pushes to main branch
   → Bot receives webhook
   → Loads repository configuration
   ```

2. **Dependency Analysis**
   ```
   Bot reads package.json
   → Parses dependencies
   → Queries GitHub Advisory Database
   ```

3. **Vulnerability Discovery**
   ```
   For each dependency:
   → Checks for known vulnerabilities
   → Filters by severity (based on config)
   → Finds vulnerable version
   ```

4. **PR Creation**
   ```
   Creates branch: demolition-bot/downgrade-{package}-{timestamp}
   → Updates package.json with vulnerable version
   → Creates PR with detailed information
   ```

## Sample PR Output

When Demolition Bot creates a PR, it looks like this:

```markdown
## ⚠️ Demolition Bot: Dependency Downgrade

This PR downgrades **lodash** to introduce a known vulnerability.

### Change Summary
- **Package:** lodash
- **Current Version:** 4.17.21
- **Target Version:** 4.17.19

### Vulnerability Details
- **Severity:** HIGH
- **Vulnerable Range:** >=4.0.0 <4.17.21
- **CVE:** CVE-2020-8203
- **Published:** 2020-07-15

### Summary
Prototype Pollution in lodash

### Details
The lodash library before 4.17.21 is vulnerable to Prototype Pollution...

---

**⚠️ WARNING:** This is a demonstration bot that intentionally introduces 
vulnerabilities. **DO NOT MERGE** this PR in production environments!
```

## API Endpoints

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "bot": "demolition-bot"
}
```

### Bot Information

```bash
curl http://localhost:3000/
```

Response:
```json
{
  "name": "Demolition Bot",
  "description": "The inverse of Renovate - downgrades dependencies to vulnerable versions",
  "status": "running",
  "endpoints": {
    "webhook": "/webhook",
    "health": "/health"
  }
}
```

## Testing Best Practices

1. **Use Test Repositories**: Never test on production repositories
2. **Limited Scope**: Start with `maxPRsPerRun: 1` to test behavior
3. **Review PRs**: Always review generated PRs before any action
4. **Close PRs**: Regularly close/delete test PRs
5. **Monitor Logs**: Check bot logs for errors or unexpected behavior

## Troubleshooting

### Bot Not Creating PRs

Check:
- Is the bot enabled in `.demolition-bot.json`?
- Are there any dependencies with known vulnerabilities?
- Does the severity match `targetSeverity` in config?
- Check bot logs for errors

### Authentication Errors

- Verify `GITHUB_TOKEN` is set and valid
- Ensure token has required permissions (repo, pull_request)
- Check if GitHub App has correct permissions

### Webhook Not Received

- Verify webhook URL is accessible from internet
- Check webhook secret matches
- Review GitHub webhook delivery logs

## Advanced Usage

### Programmatic Usage

```typescript
import { DemolitionBot } from './src/bot';

const bot = new DemolitionBot(process.env.GITHUB_TOKEN!);

// Load configuration
const config = await bot.loadConfig('owner', 'repo');

// Process a repository
await bot.processRepository('owner', 'repo', config);
```

### Custom Vulnerability Finder

```typescript
import { VulnerabilityFinder } from './src/vulnerability-finder';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const finder = new VulnerabilityFinder(octokit);

// Find vulnerabilities for a specific package
const vulns = await finder.findVulnerabilities('lodash', 'npm');
console.log(`Found ${vulns.length} vulnerabilities`);

// Find a vulnerable version
const downgrade = await finder.findVulnerableVersion(
  'lodash',
  '4.17.21',
  'npm'
);

if (downgrade) {
  console.log(`Downgrade from ${downgrade.current_version} to ${downgrade.target_version}`);
}
```

## Security Considerations

Remember:
- This bot is for **testing purposes only**
- Never use on production systems
- Always obtain proper authorization
- Keep GitHub tokens secure
- Monitor bot activity closely
- Review and close test PRs regularly

## Next Steps

- Read [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Review [SECURITY.md](SECURITY.md) for security guidelines
- Check the [README.md](README.md) for more information
