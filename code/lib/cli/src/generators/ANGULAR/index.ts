import { join } from 'path';
import semver from 'semver';
import fs from 'fs';
import dedent from 'ts-dedent';
import { baseGenerator } from '../baseGenerator';
import type { Generator } from '../types';
import { CoreBuilder } from '../../project_types';
import { AngularJSON, compoDocPreviewPrefix, promptForCompoDocs } from './helpers';
import { getCliDir } from '../../dirs';
import { paddedLog, copyTemplate } from '../../helpers';
import { isStorybookInstalled } from '../../detect';

const generator: Generator<{ projectName: string }> = async (
  packageManager,
  npmOptions,
  options,
  commandOptions
) => {
  const packageJson = packageManager.retrievePackageJson();
  const angularVersionFromDependencies = semver.coerce(
    packageManager.retrievePackageJson().dependencies['@angular/core']
  )?.version;

  const angularVersionFromDevDependencies = semver.coerce(
    packageManager.retrievePackageJson().devDependencies['@angular/core']
  )?.version;

  const angularVersion = angularVersionFromDependencies || angularVersionFromDevDependencies;
  const isWebpack5 = semver.gte(angularVersion, '12.0.0');
  const updatedOptions = isWebpack5 ? { ...options, builder: CoreBuilder.Webpack5 } : options;

  const angularJSON = new AngularJSON();

  if (angularJSON.projectsWithoutStorybook.length === 0) {
    paddedLog(
      'Every project in your workspace is already set up with Storybook. There is nothing to do!'
    );
    return Promise.reject();
  }

  const angularProjectName = await angularJSON.getProjectName();

  paddedLog(`Adding Storybook support to your "${angularProjectName}" project`);

  const { root } = angularJSON.getProjectSettingsByName(angularProjectName);
  const { projects } = angularJSON;
  const useCompodoc = commandOptions.yes ? true : await promptForCompoDocs();
  const storybookFolder = root ? `${root}/.storybook` : '.storybook';

  if (root !== '') {
    // create a .storybook folder in the root of the Angular project
    fs.mkdirSync(storybookFolder, { recursive: true });
    const rootReferencePathFromStorybookFolder = root
      .split('/')
      .map(() => '../')
      .join('');

    fs.writeFileSync(
      `${storybookFolder}/main.ts`,
      dedent(`
        import { StorybookConfig } from'@storybook/angular';
        import mainRoot from'${rootReferencePathFromStorybookFolder}../.storybook/main';
        
        const config: StorybookConfig = {
          ...mainRoot
        };
        export default config;
      `)
    );
  }

  angularJSON.addStorybookEntries({
    angularProjectName,
    storybookFolder,
    useCompodoc,
    root,
  });
  angularJSON.write();

  const isSbInstalled = isStorybookInstalled(packageJson, commandOptions.force);

  await baseGenerator(
    packageManager,
    npmOptions,
    {
      ...updatedOptions,
      ...(useCompodoc && {
        frameworkPreviewParts: {
          prefix: compoDocPreviewPrefix,
        },
      }),
    },
    'angular',
    {
      ...(useCompodoc && { extraPackages: ['@compodoc/compodoc'] }),
      addScripts: false,
      componentsDestinationPath: root ? `${root}/src/stories` : undefined,
      addMainFile: !isSbInstalled,
      storybookConfigFolder: storybookFolder,
    },
    'angular'
  );

  if (Object.keys(projects).length === 1) {
    packageManager.addScripts({
      storybook: `ng run ${angularProjectName}:storybook`,
      'build-storybook': `ng run ${angularProjectName}:build-storybook`,
    });
  }

  const templateDir = join(getCliDir(), 'templates', 'angular');
  copyTemplate(templateDir, root || undefined);

  return {
    projectName: angularProjectName,
  };
};

export default generator;
