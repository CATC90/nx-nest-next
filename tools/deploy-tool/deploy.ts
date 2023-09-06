#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { dump } from 'js-yaml';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

type DeployType = 'production' | 'staging';

main();

function main(): void {
  const argv = extractCmdLineArgs(process.argv);
  const affectedApps = getAffectedApps(argv['base'], argv['head']);
  if (affectedApps.length > 0) {
    writeYamlFile(affectedApps, argv['branch']);
  } else {
    console.log(
      `no apps was changed in run, base=${argv['base']} head=${argv['head']}`
    );
  }
}

function extractCmdLineArgs(args: string[]): object {
  const argv = yargs(hideBin(args)).options({
    base: {
      type: 'string',
      demand: true,
    },
    head: { type: 'string', demand: true },
    branch: { type: 'string', demand: true },
  }).argv;

  return argv;
}
function getAffectedApps(base: string, head: string): string[] {
  const command = `npx nx  affected:apps --base=${base} --head=${head}  --plain`;
  console.log(command);

  const projects = execSync(command).toString('utf-8').trim();
  if (projects === '') {
    return [];
  } else {
    const affectedApps = projects.split(' ');
    console.log(`affected apps to be deployed = ${affectedApps}`);
    return affectedApps;
  }
}
function writeYamlFile(affectedApps, branch: string): void {
  const deployType = branch === 'master' ? 'production' : 'staging';
  const yamlstr = generateGitlabCiYaml(affectedApps, deployType);
  console.log(`generated yaml file \n ${yamlstr}`);

  writeFileSync('affected-deploy-ci.yaml', yamlstr);
}
function generateGitlabCiYaml(
  affectedApps: Array<string>,
  deployType: DeployType
): string {
  const gitlabCIBaseDefinition: Record<string, any> = {
    image: 'node:16',
    workflow: {
      rules: [{ when: 'always' }],
    },
  };
  const nxInstallationBase = {
    '.distributed': {
      tags: ['docker-main'],
      interruptible: true,
      cache: {
        key: {
          files: ['package-lock.json'],
        },
        paths: ['.npm/'],
      },
      before_script: ['npm ci --cache .npm --prefer-offline'],
      artifacts: {
        paths: ['node_modules/.cache/nx'],
      },
    },
  };
  const deployJobDefinition = (
    app: string
  ): Record<string, string | string[]> => ({
    image: 'node:14.16.0',
    extends: '.distributed',
    stage: 'deploy',
    script: `npx nx run ${app}:deploy-${deployType}`,
  });
  const generatedJobsPerAffectedApp = affectedApps.reduce<object>(
    (tmpobj: object, app: string) => {
      tmpobj[`deploy-${app}`] = deployJobDefinition(app);
      return tmpobj;
    },
    {}
  );

  return dump({
    ...gitlabCIBaseDefinition,
    ...nxInstallationBase,
    ...generatedJobsPerAffectedApp,
  });
}
