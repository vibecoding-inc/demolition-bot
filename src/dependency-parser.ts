import { Octokit } from '@octokit/rest';

export interface PackageJson {
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
}

export interface Dependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency';
}

/**
 * Parses various dependency files from repositories
 */
export class DependencyParser {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  /**
   * Get package.json content from a repository
   */
  async getPackageJson(
    owner: string,
    repo: string,
    ref: string = 'main'
  ): Promise<PackageJson | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'package.json',
        ref
      });

      if ('content' in data && data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error('Error fetching package.json:', error);
      return null;
    }
  }

  /**
   * Parse dependencies from package.json
   */
  parseDependencies(packageJson: PackageJson): Dependency[] {
    const dependencies: Dependency[] = [];

    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        dependencies.push({
          name,
          version: this.cleanVersion(version),
          type: 'dependency'
        });
      }
    }

    if (packageJson.devDependencies) {
      for (const [name, version] of Object.entries(packageJson.devDependencies)) {
        dependencies.push({
          name,
          version: this.cleanVersion(version),
          type: 'devDependency'
        });
      }
    }

    return dependencies;
  }

  /**
   * Clean version string by removing prefixes like ^, ~, >=, etc.
   */
  private cleanVersion(version: string): string {
    return version.replace(/^[\^~>=<]/, '').trim();
  }

  /**
   * Update package.json with new dependency versions
   */
  updatePackageJson(
    packageJson: PackageJson,
    packageName: string,
    newVersion: string,
    depType: 'dependency' | 'devDependency'
  ): PackageJson {
    const updated = { ...packageJson };

    if (depType === 'dependency' && updated.dependencies) {
      updated.dependencies = {
        ...updated.dependencies,
        [packageName]: newVersion
      };
    } else if (depType === 'devDependency' && updated.devDependencies) {
      updated.devDependencies = {
        ...updated.devDependencies,
        [packageName]: newVersion
      };
    }

    return updated;
  }
}
