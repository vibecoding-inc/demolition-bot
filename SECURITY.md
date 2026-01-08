# Security Policy

## ⚠️ Important Notice

**Demolition Bot is a security testing tool that intentionally introduces vulnerabilities.**

This tool is designed for:
- Educational purposes
- Security research
- Penetration testing demonstrations
- Security awareness training

## Responsible Use

### ✅ DO:
- Use only on repositories you own or have explicit permission to test
- Use in isolated test environments
- Use for security education and awareness
- Review all PRs created by the bot before considering any action
- Keep the bot's access limited to test repositories

### ❌ DO NOT:
- Use on production repositories
- Merge PRs created by this bot in production
- Use on repositories containing sensitive data
- Use without proper authorization
- Deploy on public-facing systems without security controls

## Reporting Security Issues

If you discover a security vulnerability in Demolition Bot itself (not the intentional vulnerabilities it introduces), please report it by:

1. **DO NOT** open a public issue
2. Email the maintainers (or create a private security advisory on GitHub)
3. Include a detailed description of the vulnerability
4. Provide steps to reproduce if possible

We will respond as quickly as possible and work with you to address the issue.

## Security Best Practices for Users

1. **Credentials**: Never commit GitHub tokens or credentials to version control
2. **Access Control**: Use GitHub App installations with minimal permissions
3. **Network**: Run the bot in a secure, isolated network environment
4. **Monitoring**: Monitor all PRs created by the bot
5. **Cleanup**: Regularly close/delete PRs and branches created by the bot

## Disclaimer

The authors and contributors of Demolition Bot are not responsible for:
- Misuse of this tool
- Any damage caused by using this tool
- Unauthorized testing or security violations
- Any consequences of merging vulnerable dependencies

By using Demolition Bot, you accept full responsibility for its use and agree to use it only for legitimate security testing purposes with proper authorization.

## Contact

For security concerns related to the bot itself, please create a security advisory on GitHub.
