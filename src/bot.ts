import { Octokit } from '@octokit/rest';
import { DependencyParser } from './dependency-parser';
import { VulnerabilityFinder } from './vulnerability-finder';
import { PullRequestCreator } from './pr-creator';

export interface DemolitionBotConfig {
  enabled: boolean;
  maxPRsPerRun: number;
  ignoredPackages: string[];
  targetSeverity: string[];
}

/**
 * Main bot logic - orchestrates the downgrade process
 */
export class DemolitionBot {
  private octokit: Octokit;
  private parser: DependencyParser;
  private vulnerabilityFinder: VulnerabilityFinder;
  private prCreator: PullRequestCreator;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
    this.parser = new DependencyParser(this.octokit);
    this.vulnerabilityFinder = new VulnerabilityFinder(this.octokit);
    this.prCreator = new PullRequestCreator(this.octokit);
  }

  /**
   * Run the bot on a repository
   */
  async processRepository(
    owner: string,
    repo: string,
    config: DemolitionBotConfig
  ): Promise<void> {
    if (!config.enabled) {
      console.log('Bot is disabled for this repository');
      return;
    }

    console.log(`Processing repository: ${owner}/${repo}`);

    try {
      // Get package.json
      const packageJson = await this.parser.getPackageJson(owner, repo);
      if (!packageJson) {
        console.log('No package.json found');
        return;
      }

      // Parse dependencies
      const dependencies = this.parser.parseDependencies(packageJson);
      console.log(`Found ${dependencies.length} dependencies`);

      let prsCreated = 0;

      // Process each dependency
      for (const dep of dependencies) {
        if (prsCreated >= config.maxPRsPerRun) {
          console.log(`Reached max PRs limit: ${config.maxPRsPerRun}`);
          break;
        }

        if (config.ignoredPackages.includes(dep.name)) {
          console.log(`Skipping ignored package: ${dep.name}`);
          continue;
        }

        console.log(`Checking ${dep.name}@${dep.version} for vulnerabilities...`);

        // Find a vulnerable version
        const downgrade = await this.vulnerabilityFinder.findVulnerableVersion(
          dep.name,
          dep.version,
          'npm'
        );

        if (downgrade) {
          console.log(
            `Found vulnerability for ${downgrade.package_name}: ` +
            `${downgrade.current_version} -> ${downgrade.target_version}`
          );

          // Check if severity matches target
          if (config.targetSeverity.length > 0 &&
              !config.targetSeverity.includes(downgrade.vulnerability.severity.toLowerCase())) {
            console.log(`Skipping - severity ${downgrade.vulnerability.severity} not in target list`);
            continue;
          }

          try {
            await this.prCreator.createDowngradePR(owner, repo, downgrade);
            prsCreated++;
          } catch (error) {
            console.error(`Failed to create PR for ${dep.name}:`, error);
          }
        } else {
          console.log(`No vulnerabilities found for ${dep.name}`);
        }
      }

      console.log(`Completed processing. Created ${prsCreated} PRs.`);
    } catch (error) {
      console.error('Error processing repository:', error);
      throw error;
    }
  }

  /**
   * Load configuration from repository
   */
  async loadConfig(owner: string, repo: string): Promise<DemolitionBotConfig> {
    const defaultConfig: DemolitionBotConfig = {
      enabled: true,
      maxPRsPerRun: 5,
      ignoredPackages: [],
      targetSeverity: ['critical', 'high']
    };

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: '.demolition-bot.json'
      });

      if ('content' in data && data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        const userConfig = JSON.parse(content);
        return { ...defaultConfig, ...userConfig };
      }
    } catch (error) {
      console.log('No config file found, using defaults');
    }

    return defaultConfig;
  }
}
