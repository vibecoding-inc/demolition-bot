#!/usr/bin/env node

import { DemolitionBot } from './bot';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * CLI tool for running Demolition Bot manually
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node dist/cli.js <owner> <repo>');
    console.log('Example: node dist/cli.js microsoft vscode');
    process.exit(1);
  }

  const [owner, repo] = args;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log(`🔥 Demolition Bot CLI`);
  console.log(`Target: ${owner}/${repo}\n`);

  const bot = new DemolitionBot(token);

  try {
    // Load configuration
    console.log('Loading configuration...');
    const config = await bot.loadConfig(owner, repo);
    console.log('Configuration:', JSON.stringify(config, null, 2));
    console.log('');

    // Process repository
    await bot.processRepository(owner, repo, config);

    console.log('\n✅ Complete!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
