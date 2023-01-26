import { dedent } from 'ts-dedent';
import glob from 'glob';
import path from 'path';
import { readConfig } from '@storybook/csf-tools';
import { once } from '@storybook/node-logger';

import { boost } from './interpret-files';

export async function validateConfigurationFiles(configDir: string) {
  const extensionsPattern = `{${Array.from(boost).join(',')}}`;
  const mainConfigMatches = glob.sync(path.resolve(configDir, `main${extensionsPattern}`));

  const [mainConfigPath] = mainConfigMatches;

  if (!mainConfigPath) {
    throw new Error(dedent`
      No configuration files have been found in your configDir (${path.resolve(configDir)}).
      Storybook needs "main.js" file, please add it.
    `);
  } else {
    const main = await readConfig(mainConfigPath);
    if (!main.hasDefaultExport) {
      once.warn(dedent`
        Your main.js is not using a default export, which is the recommended format. Please update it.
        For more info: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#esm-format-in-mainjs
      `);
    }
  }
}
