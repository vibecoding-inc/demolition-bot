import express from 'express';
import { Webhooks } from '@octokit/webhooks';
import { DemolitionBot } from './bot';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize webhooks
const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET || 'your-webhook-secret'
});

// Initialize bot
const bot = new DemolitionBot(process.env.GITHUB_TOKEN || '');

// Webhook endpoint
app.post('/webhook', express.json(), async (req, res) => {
  try {
    await webhooks.verifyAndReceive({
      id: req.headers['x-github-delivery'] as string,
      name: req.headers['x-github-event'] as any,
      signature: req.headers['x-hub-signature-256'] as string,
      payload: req.body
    });
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Webhook verification failed');
  }
});

// Handle push events
webhooks.on('push', async ({ payload }) => {
  console.log('Received push event');
  const { repository, ref } = payload;

  // Only process pushes to main branch
  if (ref === 'refs/heads/main' || ref === 'refs/heads/master') {
    if (!repository.owner) {
      console.error('Repository owner is null');
      return;
    }
    
    const owner = repository.owner.login;
    const repo = repository.name;

    console.log(`Processing push to ${owner}/${repo}`);

    try {
      const config = await bot.loadConfig(owner, repo);
      await bot.processRepository(owner, repo, config);
    } catch (error) {
      console.error('Error processing repository:', error);
    }
  }
});

// Handle installation events
webhooks.on('installation.created', async ({ payload }) => {
  console.log('Bot installed:', payload.installation.id);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', bot: 'demolition-bot' });
});

// Root endpoint with info
app.get('/', (req, res) => {
  res.json({
    name: 'Demolition Bot',
    description: 'The inverse of Renovate - downgrades dependencies to vulnerable versions',
    status: 'running',
    endpoints: {
      webhook: '/webhook',
      health: '/health'
    }
  });
});

app.listen(port, () => {
  console.log(`🔥 Demolition Bot is running on port ${port}`);
  console.log(`⚠️  WARNING: This bot intentionally introduces vulnerabilities!`);
  console.log(`📝 Webhook endpoint: http://localhost:${port}/webhook`);
});

export default app;
