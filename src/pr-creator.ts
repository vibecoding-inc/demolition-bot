import { Octokit } from '@octokit/rest';
import { DependencyDowngrade } from './vulnerability-finder';

/**
 * Creates Pull Requests with downgraded dependencies
 */
export class PullRequestCreator {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  /**
   * Create a pull request to downgrade a dependency
   */
  async createDowngradePR(
    owner: string,
    repo: string,
    downgrade: DependencyDowngrade,
    baseBranch: string = 'main'
  ): Promise<void> {
    const branchName = `demolition-bot/downgrade-${downgrade.package_name}-${Date.now()}`;
    
    try {
      // Get the base branch reference
      const { data: baseRef } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`
      });

      // Create a new branch
      await this.octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseRef.object.sha
      });

      // Get current package.json
      const { data: fileData } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'package.json',
        ref: branchName
      });

      if ('content' in fileData && fileData.content) {
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const packageJson = JSON.parse(content);

        // Update the version
        if (packageJson.dependencies && packageJson.dependencies[downgrade.package_name]) {
          packageJson.dependencies[downgrade.package_name] = downgrade.target_version;
        } else if (packageJson.devDependencies && packageJson.devDependencies[downgrade.package_name]) {
          packageJson.devDependencies[downgrade.package_name] = downgrade.target_version;
        }

        // Update the file
        await this.octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: 'package.json',
          message: `⚠️ Downgrade ${downgrade.package_name} to vulnerable version ${downgrade.target_version}`,
          content: Buffer.from(JSON.stringify(packageJson, null, 2)).toString('base64'),
          branch: branchName,
          sha: fileData.sha
        });

        // Create pull request
        const prBody = this.generatePRBody(downgrade);
        
        await this.octokit.pulls.create({
          owner,
          repo,
          title: `⚠️ [Demolition Bot] Downgrade ${downgrade.package_name} to vulnerable version`,
          head: branchName,
          base: baseBranch,
          body: prBody
        });

        console.log(`Created PR to downgrade ${downgrade.package_name}`);
      }
    } catch (error) {
      console.error(`Error creating PR for ${downgrade.package_name}:`, error);
      throw error;
    }
  }

  /**
   * Generate PR body with vulnerability information
   */
  private generatePRBody(downgrade: DependencyDowngrade): string {
    const vulnerability = downgrade.vulnerability;
    
    return `## ⚠️ Demolition Bot: Dependency Downgrade

This PR downgrades **${downgrade.package_name}** to introduce a known vulnerability.

### Change Summary
- **Package:** ${downgrade.package_name}
- **Current Version:** ${downgrade.current_version}
- **Target Version:** ${downgrade.target_version}

### Vulnerability Details
- **Severity:** ${vulnerability.severity.toUpperCase()}
- **Vulnerable Range:** ${vulnerability.vulnerable_version_range}
${vulnerability.cve_id ? `- **CVE:** ${vulnerability.cve_id}` : ''}
- **Published:** ${new Date(vulnerability.published_at).toLocaleDateString()}

### Summary
${vulnerability.summary}

### Details
${vulnerability.details}

---

**⚠️ WARNING:** This is a demonstration bot that intentionally introduces vulnerabilities. 
**DO NOT MERGE** this PR in production environments!

*This PR was created by Demolition Bot - the inverse of Renovate.*
`;
  }
}
