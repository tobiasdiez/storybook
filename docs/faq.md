---
title: 'Frequently Asked Questions'
---

Here are some answers to frequently asked questions. If you have a question, you can ask it by opening an issue on the [Storybook Repository](https://github.com/storybookjs/storybook/).

- [How can I opt-out of Angular Ivy?](#how-can-i-opt-out-of-angular-ivy)
- [How can I opt-out of Angular ngcc?](#how-can-i-opt-out-of-angular-ngcc)
- [How can I run coverage tests with Create React App and leave out stories?](#how-can-i-run-coverage-tests-with-create-react-app-and-leave-out-stories)
- [I see `ReferenceError: React is not defined` when using Storybook with Next.js](#i-see-referenceerror-react-is-not-defined-when-using-storybook-with-nextjs)
- [How do I setup Storybook to share Webpack configuration with Next.js?](#how-do-i-setup-storybook-to-share-webpack-configuration-with-nextjs)
- [How do I setup React Fast Refresh with Storybook?](#how-do-i-setup-react-fast-refresh-with-storybook)
- [How do I setup the new React Context Root API with Storybook?](#how-do-i-setup-the-new-react-context-root-api-with-storybook)
- [Why is there no addons channel?](#why-is-there-no-addons-channel)
- [Why aren't Controls visible in the Canvas panel but visible in Docs?](#why-arent-controls-visible-in-the-canvas-panel-but-visible-in-docs)
- [Why aren't the addons working in a composed Storybook?](#why-arent-the-addons-working-in-a-composed-storybook)
- [Which community addons are compatible with the latest version of Storybook?](#which-community-addons-are-compatible-with-the-latest-version-of-storybook)
- [Is it possible to browse the documentation for past versions of Storybook?](#is-it-possible-to-browse-the-documentation-for-past-versions-of-storybook)
- [What icons are available for my toolbar or my addon?](#what-icons-are-available-for-my-toolbar-or-my-addon)
- [I see a "No Preview" error with a Storybook production build](#i-see-a-no-preview-error-with-a-storybook-production-build)
- [Can I use Storybook with Vue 3?](#can-i-use-storybook-with-vue-3)
- [Is snapshot testing with Storyshots supported for Vue 3?](#is-snapshot-testing-with-storyshots-supported-for-vue-3)
- [Why aren't my code blocks highlighted with Storybook MDX](#why-arent-my-code-blocks-highlighted-with-storybook-mdx)
- [Why aren't my MDX 2 stories working in Storybook?](#why-arent-my-mdx-2-stories-working-in-storybook)
- [Why can't I import my own stories into MDX 2?](#why-cant-i-import-my-own-stories-into-mdx-2)
- [Why are my mocked GraphQL queries failing with Storybook's MSW addon?](#why-are-my-mocked-graphql-queries-failing-with-storybooks-msw-addon)
- [Can I use other GraphQL providers with Storybook's MSW addon?](#can-i-use-other-graphql-providers-with-storybooks-msw-addon)
- [Can I mock GraphQL mutations with Storybook's MSW addon?](#can-i-mock-graphql-mutations-with-storybooks-msw-addon)
- [How can my code detect if it is running in Storybook?](#how-can-my-code-detect-if-it-is-running-in-storybook)
- [Why are my stories not showing up correctly when using certain characters?](#why-are-my-stories-not-showing-up-correctly-when-using-certain-characters)
- [Why are the TypeScript examples and documentation using `as` for type safety?](#why-are-the-typescript-examples-and-documentation-using-as-for-type-safety)
- [Why is Storybook's source loader returning undefined with curried functions?](#why-is-storybooks-source-loader-returning-undefined-with-curried-functions)
- [Why are my args no longer displaying the default values?](#why-are-my-args-no-longer-displaying-the-default-values)
- [Why isn't Storybook's test runner working?](#why-isnt-storybooks-test-runner-working)
- [How does Storybook handle environment variables?](#how-does-storybook-handle-environment-variables)

### How can I opt-out of Angular Ivy?

In case you are having trouble with Angular Ivy you can deactivate it in your `main.js`:

```javascript
export default {
  stories: [
    /* ... */
  ],
  addons: [
    /* ... */
  ],
  framework: {
    name: '@storybook/angular',
    options: {
      enableIvy: false,
    },
  },
};
```

### How can I opt-out of Angular ngcc?

In case you postinstall ngcc, you can disable it:

```javascript
export default {
  stories: [
    /* ... */
  ],
  addons: [
    /* ... */
  ],
  framework: {
    name: '@storybook/angular',
    options: {
      enableNgcc: false,
    },
  },
};
```

Please report any issues related to Ivy in our [GitHub Issue Tracker](https://github.com/storybookjs/storybook/labels/app%3A%20angular) as the support for View Engine will be dropped in a future release of Angular.

### How can I run coverage tests with Create React App and leave out stories?

Create React App does not allow providing options to Jest in your `package.json`, however you can run `jest` with commandline arguments:

```sh
npm test -- --coverage --collectCoverageFrom='["src/**/*.{js,jsx}","!src/**/stories/*"]'
```

<div class="aside">
💡 If you're using <a href="https://yarnpkg.com/">yarn</a> as a package manager, you'll need to adjust the command accordingly.
</div>

### I see `ReferenceError: React is not defined` when using Storybook with Next.js

Next automatically defines `React` for all of your files via a babel plugin. In Storybook, you can solve this either by:

1.  Adding `import React from 'react'` to your component files.
2.  Adding a `.babelrc` that includes [`babel-plugin-react-require`](https://www.npmjs.com/package/babel-plugin-react-require)

### How do I setup Storybook to share Webpack configuration with Next.js?

You can generally reuse webpack rules by placing them in a file that is `require()`-ed from both your `next.config.js` and your `.storybook/main.js` files. For example:

```js
export default {
  webpackFinal: async (baseConfig) => {
    const nextConfig = require('/path/to/next.config.js');

    // merge whatever from nextConfig into the webpack config storybook will use
    return { ...baseConfig, ...nextConfig };
  },
};
```

### How do I setup React Fast Refresh with Storybook?

Fast refresh is an opt-in feature that can be used in Storybook React.
There are two ways that you can enable it, go ahead and pick one:

- You can set a `FAST_REFRESH` environment variable in your `.env` file:

```
FAST_REFRESH=true
```

- Or you can set the following properties in your `.storybook/main.js` files:

```js
export default {
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      fastRefresh: true,
    },
  },
};
```

<div class="aside">
💡 Fast Refresh only works in development mode with React 16.10 or higher.
</div>

### How do I setup the new React Context Root API with Storybook?

If your installed React Version equals or is higher than 18.0.0, the new React Root API is automatically used and the newest React [concurrent features](https://reactjs.org/docs/concurrent-mode-intro.html) can be used.

You can opt-out from the new React Root API by setting the following property in your `.storybook/main.js` file:

```js
export default {
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      legacyRootApi: true,
    },
  },
};
```

### Why is there no addons channel?

A common error is that an addon tries to access the "channel", but the channel is not set. It can happen in a few different cases:

1.  You're trying to access addon channel (e.g., by calling `setOptions`) in a non-browser environment like Jest. You may need to add a channel mock:

    ```js
    import { addons, mockChannel } from '@storybook/addons';

    addons.setChannel(mockChannel());
    ```

2.  In React Native, it's a special case documented in [#1192](https://github.com/storybookjs/storybook/issues/1192)

### Why aren't Controls visible in the Canvas panel but visible in Docs?

If you're adding Storybook's dependencies manually, make sure you include the [`@storybook/addon-controls`](https://www.npmjs.com/package/@storybook/addon-controls) dependency in your project and reference it in your `.storybook/main.js` as follows:

```js
// .storybook/main.js

export default {
  addons: ['@storybook/addon-controls'],
};
```

### Why aren't the addons working in a composed Storybook?

Composition is a new feature that we released with version 6.0, and there are still some limitations to it.

For now, the addons you're using in a composed Storybook will not work.

We're working on overcoming this limitation, and soon you'll be able to use them as if you are working with a non-composed Storybook.

### Which community addons are compatible with the latest version of Storybook?

Starting with Storybook version 6.0, we've introduced some great features aimed at streamlining your development workflow.

With this, we would like to point out that if you plan on using addons created by our fantastic community, you need to consider that some of those addons might be working with an outdated version of Storybook.

We're actively working to provide a better way to address this situation, but in the meantime, we would ask for a bit of caution on your end so that you don't run into unexpected problems. Let us know by creating an issue in the [Storybook repo](https://github.com/storybookjs/storybook/issues) so that we can gather information and create a curated list with those addons to help not only you but the rest of the community.

### Is it possible to browse the documentation for past versions of Storybook?

With the release of version 6.0, we updated our documentation as well. That doesn't mean that the old documentation was removed. We kept it to help you with your Storybook migration process. Use the content from the table below in conjunction with our <a href="https://github.com/storybookjs/storybook/blob/next/MIGRATION.md">migration guide</a> .

We're only covering versions 5.3 and 5.0 as they were important milestones for Storybook. If you want to go back in time a little more, you'll have to check the specific release in the monorepo.

| Section          | Page                                      | Current Location                                                                                           | Version 5.3 location                                                                                                                                                                                                                                                 | Version 5.0 location                                                                                                                                     |
| ---------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N/A              | Why Storybook                             | [See current documentation](./why-storybook.md)                                                            | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
| Get started      | Install                                   | [See current documentation](./get-started/install.md)                                                      | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/guides/quick-start-guide)                                                                                                                                     | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/guides/quick-start-guide)                         |
|                  | What's a story                            | [See current documentation](./get-started/whats-a-story.md)                                                | [See versioned documentation for your framework](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/guides)                                                                                                                                    | [See versioned documentation for your framework](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/guides)                        |
|                  | Browse Stories                            | [See current documentation](./get-started/browse-stories.md)                                               | [See versioned documentation for your framework](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/guides)                                                                                                                                    | [See versioned documentation for your framework](https://github.com/storybookjs/storybook/blob/release/5.0/docs/src/pages/guides)                        |
|                  | Setup                                     | [See current documentation](./get-started/setup.md)                                                        | [See versioned documentation for your framework](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/guides)                                                                                                                                    | [See versioned documentation for your framework](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/guides)                        |
| Write stories    | Introduction                              | [See current documentation](./writing-stories/introduction.md)                                             | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/basics/writing-stories)                                                                                                                                       | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/basics/writing-stories)                           |
|                  | Parameters                                | [See current documentation](./writing-stories/parameters.md)                                               | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/basics/writing-stories/index.md#parameters)                                                                                                                   | Non existing feature or undocumented                                                                                                                     |
|                  | Decorators                                | [See current documentation](./writing-stories/decorators.md)                                               | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/basics/writing-stories/index.md#decorators)                                                                                                                   | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/basics/writing-stories/index.md#using-decorators) |
|                  | Naming components and hierarchy           | [See current documentation](./writing-stories/naming-components-and-hierarchy.md)                          | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/basics/writing-stories)                                                                                                                                       | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/basics/writing-stories)                           |
|                  | Build pages and screens                   | [See current documentation](./writing-stories/build-pages-with-storybook.md)                               | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
|                  | Stories for multiple components           | [See current documentation](./writing-stories/stories-for-multiple-components.md)                          | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
| Write docs       | Automatic Docs                            | [See current documentation](./writing-docs/docs-page.md)                                                   | See versioned addon documentation                                                                                                                                                                                                                                    | Non existing feature or undocumented                                                                                                                     |
|                  | MDX                                       | [See current documentation](./writing-docs/mdx.md)                                                         | See versioned addon documentation                                                                                                                                                                                                                                    | Non existing feature or undocumented                                                                                                                     |
|                  | Doc Blocks/Argstable                      | [See current documentation](./writing-docs/doc-block-argstable.md)                                         | [See versioned addon documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/docs/)                                                                                                                                                          | Non existing feature or undocumented                                                                                                                     |
|                  | Doc Blocks/Canvas                         | [See current documentation](./writing-docs/doc-block-canvas.md)                                            | [See versioned addon documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/docs/)                                                                                                                                                          | Non existing feature or undocumented                                                                                                                     |
|                  | Doc Blocks/Color Palette                  | [See current documentation](./writing-docs/doc-block-colorpalette.md)                                      | [See versioned addon documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/docs/)                                                                                                                                                          | Non existing feature or undocumented                                                                                                                     |
|                  | Doc Blocks/Description                    | [See current documentation](./writing-docs/doc-block-description.md)                                       | [See versioned addon documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/docs/)                                                                                                                                                          | Non existing feature or undocumented                                                                                                                     |
|                  | Doc Blocks/Icon Gallery                   | [See current documentation](./writing-docs/doc-block-icongallery.md)                                       | [See versioned addon documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/docs/)                                                                                                                                                          | Non existing feature or undocumented                                                                                                                     |
|                  | Doc Blocks/Source                         | [See current documentation](./writing-docs/doc-block-source.md)                                            | [See versioned addon documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/docs/)                                                                                                                                                          | Non existing feature or undocumented                                                                                                                     |
|                  | Doc Blocks/Story                          | [See current documentation](./writing-docs/doc-block-story.md)                                             | [See versioned addon documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/docs/)                                                                                                                                                          | Non existing feature or undocumented                                                                                                                     |
|                  | Doc Blocks/Typeset                        | [See current documentation](./writing-docs/doc-block-typeset.md)                                           | [See versioned addon documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/docs/)                                                                                                                                                          | Non existing feature or undocumented                                                                                                                     |
|                  | Preview and build docs                    | [See current documentation](./writing-docs/build-documentation.md)                                         | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
| Testing          | Visual tests                              | [See current documentation](./writing-tests/visual-testing.md)                                             | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/testing/automated-visual-testing)                                                                                                                             | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/testing/automated-visual-testing)                 |
|                  | Accessibility tests                       | [See current documentation](./writing-tests/accessibility-testing.md)                                      | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
|                  | Interaction tests                         | [See current documentation](./writing-tests/interaction-testing.md)                                        | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/testing/interaction-testing)                                                                                                                                  | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/testing/interaction-testing)                      |
|                  | Snapshot tests                            | [See current documentation](./writing-tests/snapshot-testing.md)                                           | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/testing/structural-testing)                                                                                                                                   | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/testing/structural-testing)                       |
|                  | Import stories in tests                   | [See current documentation](./writing-tests/importing-stories-in-tests.md)                                 | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/testing/react-ui-testing)                                                                                                                                     | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/testing/react-ui-testing)                         |
| Sharing          | Publish Storybook                         | [See current documentation](./sharing/publish-storybook.md)                                                | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/basics/exporting-storybook)                                                                                                                                   | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/basics/exporting-storybook)                       |
|                  | Embed                                     | [See current documentation](./sharing/embed.md)                                                            | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
|                  | Composition                               | [See current documentation](./sharing/storybook-composition.md)                                            | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
|                  | Package Composition                       | [See current documentation](./sharing/package-composition.md)                                              | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
| Essential addons | Controls                                  | [See current documentation](./essentials/controls.md)                                                      | Controls are specific to version 6.0 see [Knobs versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/knobs)                                                                                                                     | Controls are specific to version 6.0 see [Knobs versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/addons/knobs)         |
|                  | Actions                                   | [See current documentation](./essentials/actions.md)                                                       | [See addon versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/actions)                                                                                                                                                        | [See addon versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/addons/actions)                                            |
|                  | Viewport                                  | [See current documentation](./essentials/viewport.md)                                                      | [See addon versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/viewport)                                                                                                                                                       | [See addon versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/addons/viewport)                                           |
|                  | Backgrounds                               | [See current documentation](./essentials/backgrounds.md)                                                   | [See addon versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/addons/backgrounds)                                                                                                                                                    | [See addon versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/addons/backgrounds)                                        |
|                  | Toolbars and globals                      | [See current documentation](./essentials/toolbars-and-globals.md)                                          | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/basics/toolbar-guide)                                                                                                                                         | Non existing feature or undocumented                                                                                                                     |
| Configure        | Overview                                  | [See current documentation](./configure/overview.md)                                                       | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/overview)                                                                                                                                      | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/basics/writing-stories)                           |
|                  | Integration/Babel                         | [See current documentation](./configure/babel.md)                                                          | See versioned documentation here and [here](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/custom-babel-config)                                                                                                             | See versioned documentation here and [here](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/configurations/custom-babel-config) |
|                  | Integration/Typescript                    | [See current documentation](./configure/typescript.md)                                                     | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/typescript-config)                                                                                                                             | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/configurations/typescript-config)                 |
|                  | Integration/Styling and CSS               | [See current documentation](./configure/styling-and-css.md)                                                | See versioned documentation                                                                                                                                                                                                                                          | See versioned documentation                                                                                                                              |
|                  | Integration/Images and assets             | [See current documentation](./configure/images-and-assets.md)                                              | See versioned documentation                                                                                                                                                                                                                                          | See versioned documentation                                                                                                                              |
|                  | Story rendering                           | [See current documentation](./configure/story-rendering.md)                                                | See versioned documentation [here](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/add-custom-head-tags) and [here](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/add-custom-body) | See versioned documentation [here](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/configurations/add-custom-head-tags)         |
|                  | Story Layout                              | [See current documentation](./configure/story-layout.md)                                                   | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
|                  | User Interface/Features and behavior      | [See current documentation](./configure/features-and-behavior.md)                                          | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/options-parameter)                                                                                                                             | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/configurations/options-parameter)                 |
|                  | User Interface/Theming                    | [See current documentation](./configure/theming.md)                                                        | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/theming)                                                                                                                                       | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/configurations/theming)                           |
|                  | User Interface/Sidebar & URLS             | [See current documentation](./configure/sidebar-and-urls.md)                                               | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/options-parameter)                                                                                                                             | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/configurations/options-parameter)                 |
|                  | Environment variables                     | [See current documentation](./configure/environment-variables.md)                                          | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/env-vars)                                                                                                                                      | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/configurations/env-vars)                          |
| Builders         | Introduction                              | [See current documentation](./builders/overview.md)                                                        | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
|                  | Vite                                      | [See current documentation](./builders/vite.md)                                                            | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
|                  | Webpack                                   | [See current documentation](./builders/webpack.md)                                                         | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/custom-webpack-config/index.md)                                                                                                                | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/configurations/custom-webpack-config/index.md)    |
|                  | Builder API                               | [See current documentation](./builders/builder-api.md)                                                     | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
| Addons           | Introduction                              | [See current documentation](./addons/introduction.md)                                                      | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/addons/writing-addons)                                                                                                                                        | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/addons/writing-addons)                            |
|                  | Install addons                            | [See current documentation](./addons/install-addons.md)                                                    | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/addons/using-addons/)                                                                                                                                         | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/addons/using-addons/)                             |
|                  | Writing Addons                            | [See current documentation](./addons/writing-addons.md)                                                    | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/addons/writing-addons)                                                                                                                                        | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/addons/writing-addons)                            |
|                  | Writing Presets                           | [See current documentation](./addons/writing-presets.md)                                                   | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/presets/writing-presets)                                                                                                                                      | Non existing feature or undocumented                                                                                                                     |
|                  | Addons Knowledge Base                     | [See current documentation](./addons/addon-knowledge-base.md)                                              | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/addons/writing-addons)                                                                                                                                        | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/addons/writing-addons)                            |
|                  | Types of addons                           | [See current documentation](./addons/addon-types.md)                                                       | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
|                  | Addons API                                | [See current documentation](./addons/addons-api.md)                                                        | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/addons/api)                                                                                                                                                   | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/addons/api)                                       |
| API              | Stories/Component Story Format            | [See current documentation](./api/csf.md)                                                                  | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/formats/component-story-format)                                                                                                                               | Non existing feature or undocumented                                                                                                                     |
|                  | Stories/MDX syntax                        | [See current documentation](./writing-docs/mdx.md)                                                         | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/formats/mdx-syntax)                                                                                                                                           | Non existing feature or undocumented                                                                                                                     |
|                  | Stories/StoriesOF format (see note below) | [See current documentation](https://github.com/storybookjs/storybook/blob/main/lib/core/docs/storiesOf.md) | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/formats/storiesof-api)                                                                                                                                        | Non existing feature or undocumented                                                                                                                     |
|                  | Frameworks                                | [See current documentation](./api/new-frameworks.md)                                                       | Non existing feature or undocumented                                                                                                                                                                                                                                 | Non existing feature or undocumented                                                                                                                     |
|                  | CLI options                               | [See current documentation](./api/cli-options.md)                                                          | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.3/docs/src/pages/configurations/cli-options)                                                                                                                                   | [See versioned documentation](https://github.com/storybookjs/storybook/tree/release/5.0/docs/src/pages/configurations/cli-options)                       |

<div class="aside">
With the release of version 5.3, we've updated how you can write your stories more compactly and easily. It doesn't mean that the <code>storiesOf</code> format has been removed. For the time being, we're still supporting it, and we have documentation for it. But be advised that this is bound to change in the future.
</div>

### What icons are available for my toolbar or my addon?

With the [`@storybook/components`](https://www.npmjs.com/package/@storybook/components) package, you get a set of icons that you can use to customize your UI. Use the table below as a reference while writing your addon or defining your Storybook global types.
Go through this [story](https://main--5a375b97f4b14f0020b0cda3.chromatic.com/?path=/story/basics-icon--labels) to see how the icons look.

<iframe src="https://main--5a375b97f4b14f0020b0cda3.chromatic.com/iframe.html?args=&id=basics-icon--labels&viewMode=story&shortcuts=false&singleStory=true" width="100%" height="600"></iframe>

### I see a "No Preview" error with a Storybook production build

If you're using the `serve` package to verify your production build of Storybook, you'll get that error. It relates to how `serve` handles rewrites. For instance, `/iframe.html` is rewritten into `/iframe`, and you'll get that error.

We recommend that you use [http-server](https://www.npmjs.com/package/http-server) instead and use the following command to preview Storybook:

```shell
npx http-server storybook-static
```

<div class="aside">
Suppose you don't want to run the command above frequently. Add <code>http-server</code> as a development dependency and create a new script to preview your production build of Storybook.
</div>

### Can I use Storybook with Vue 3?

Yes, with the release of version 6.2, Storybook now includes support for Vue 3. See the [install page](./get-started/install.md) for instructions.

### Is snapshot testing with Storyshots supported for Vue 3?

Yes, with the release of version 6.2, the [`Storyshots addon`](https://www.npmjs.com/package/@storybook/addon-storyshots) will automatically detect Vue 3 projects.

If you run into a situation where this is not the case, you can adjust the `config` object and manually specify the framework (e.g., `vue3`).

See our documentation on how to customize the [Storyshots configuration](./writing-tests/snapshot-testing.md).

### Why aren't my code blocks highlighted with Storybook MDX

Out of the box, Storybook provides syntax highlighting for a set of languages (e.g., Javascript, Markdown, CSS, HTML, Typescript, GraphQL) that you can use with your code blocks. If you're writing your custom code blocks with MDX, you'll need to import the syntax highlighter manually. For example, if you're adding a code block for SCSS, adjust your story to the following:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'common/my-component-with-custom-syntax-highlight.mdx.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

<div class="aside">
💡 Check <code>react-syntax-highlighter</code>'s <a href="https://github.com/react-syntax-highlighter/react-syntax-highlighter">documentation</a> for a list of available languages.
</div>

Applying this small change will enable you to add syntax highlight for SCSS or any other language available.

You can also update your [`.storybook/preview.js`](../configure/overview.md#configure-story-rendering) and enable syntax highlighting globally. For example, to add support for SCSS, update your configuration to the following:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'common/storybook-preview-register-language-globally.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Write your documentation as you usually would, and your existing SCSS code blocks will automatically be highlighted when Storybook reloads. For example:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
   'common/my-component-with-global-syntax-highlight.mdx.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### Why aren't my MDX 2 stories working in Storybook?

MDX 2 introduced some changes to how the code is rendered. For example, if you enabled it in your Storybook and you have the following code block:

```
<style>{`
  .class1 {
    ...
  }

  .class2 {
    ...
  }
`}</style>

```

You'll need to update it to make it compatible with MDX 2.

```
<style>
  {`
    .class1 {
      ...
    }

    .class2 {
      ...
    }
  `}
</style>
```

See the following [issue](https://github.com/mdx-js/mdx/issues/1945) for more information.

### Why can't I import my own stories into MDX 2?

This is a known issue with MDX 2. We're working to fix it. For now you can apply the following workaround:

```md
<!-- Button.stories.mdx -->

import { Story } from '@storybook/addon-docs';

import \* as stories from './Button.stories.jsx';

<Story name="Basic" story={stories.Basic} />
```

### Why are my mocked GraphQL queries failing with Storybook's MSW addon?

If you're working with Vue 3, you'll need to install [`@vue/apollo-composable`](https://www.npmjs.com/package/@vue/apollo-composable). With Svelte, you'll need to install [`@rollup/plugin-replace`](https://www.npmjs.com/package/@rollup/plugin-replace) and update your `rollup.config` file to the following:

```js
// rollup.config

// Boilerplate imports

import replace from '@rollup/plugin-replace';
const production = !process.env.ROLLUP_WATCH;

// Remainder rollup.config implementation

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    // Other plugins

    // Configures the replace plugin to allow GraphQL Queries to work properly
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
};
```

With Angular, the most common issue is the placement of the `mockServiceWorker.js` file. Use this [example](https://github.com/mswjs/examples/tree/master/examples/rest-angular/) as a point of reference.

### Can I use other GraphQL providers with Storybook's MSW addon?

Yes, check the [addon's examples](https://github.com/mswjs/msw-storybook-addon/tree/master/packages/docs/src/demos) to learn how to integrate different providers.

### Can I mock GraphQL mutations with Storybook's MSW addon?

No, currently, the MSW addon only has support for GraphQL queries. If you're interested in including this feature, open an issue in the [MSW addon repository](https://github.com/mswjs/msw-storybook-addon) and follow up with the maintainer.

### How can my code detect if it is running in Storybook?

You can do this by checking for the `IS_STORYBOOK` global variable, which will equal `true` when running in Storybook. The environment variable `process.env.STORYBOOK` is also set to `true`.

### Why are my stories not showing up correctly when using certain characters?

Storybook allows you to use most characters while naming your stories. Still, specific characters (e.g., `#`) can lead to issues when Storybook generates the internal identifier for the story, leading to collisions and incorrectly outputting the correct story. We recommend using such characters sparsely.

### Why are the TypeScript examples and documentation using `as` for type safety?

We're aware that the default Typescript story construct might seem outdated and could potentially introduce a less than ideal way of handling type safety and strictness and could be rewritten as such:

```ts
// Button.stories.ts | tsx

import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';

const StoryMeta: ComponentMeta<typeof Button> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Button',
  component: Button,
};

export default meta;
```

Although valid, it introduces additional boilerplate code to the story definition. Instead, we're working towards implementing a safer mechanism based on what's currently being discussed in the following [issue](https://github.com/microsoft/TypeScript/issues/7481). Once the feature is released, we'll migrate our existing examples and documentation accordingly.

## Why is Storybook's source loader returning undefined with curried functions?

This is a known issue with Storybook. If you're interested in getting it fixed, open an issue with a [working reproduction](./contribute/how-to-reproduce.md) so that it can be triaged and fixed in future releases.

## Why are my args no longer displaying the default values?

Before version 6.3, unset args were set to the `argTypes.defaultValue` if specified or inferred from the component's properties (e.g., React's prop types, Angular inputs, Vue props). Starting with version 6.3, Storybook no longer infers default values but instead defines the arg's value as `undefined` when unset, allowing the framework to supply its default value.

If you are using `argTypes.defaultValue` to fix the above, you no longer need to, and you can safely remove it from your stories.

Additionally, suppose you were using `argTypes.defaultValue` or relying on inference to set a default value for an arg. In that case, you should define the arg's value at the component level instead:

```js
// MyComponent.stories.js

export default {
  component: MyComponent,
  args: {
    //👇 Defining the arg's value at the component level.
    text: 'Something',
  },
};
```

For Storybook's Docs, you can manually configure the displayed value by configuring the `table.defaultValue` setting:

```js
// MyComponent.stories.js

export default {
  component: MyComponent,
  argTypes: {
    //👇 Defining the arg's display value in docs.
    text: {
      table: { defaultValue: { summary: 'SomeType<T>' } },
    },
  },
};
```

### Why isn't Storybook's test runner working?

There's an issue with Storybook's test runner and the latest version of Jest (i.e., version 28), which prevents it from running effectively. As a workaround, you can downgrade Jest to the previous stable version (i.e., version 27), and you'll be able to run it. See the following [issue](https://github.com/storybookjs/test-runner/issues/99) for more information.

### How does Storybook handle environment variables?

Storybook has built-in support for [environment variables](./configure/environment-variables.md). By default, environment variables are only available in Node.js code and are not available in the browser as some variables should be kept secret (e.g., API keys) and **not** exposed to anyone visiting the published Storybook.

To expose a variable, you must preface its name with `STORYBOOK_`. So `STORYBOOK_API_URL` will be available in browser code but `API_KEY` will not. Additionally you can also customize which variables are exposed by setting the [`env`](./configure/environment-variables.md#using-storybook-configuration) field in the `.storybook/main.js` file.

Variables are set when JavaScript is compiled so when the development server is started or you build your Storybook. Environment variable files should not be committed to Git as they often contain secrets which are not safe to add to Git. Instead, add `.env.*` to your `.gitignore` file and set up the environment variables manually on your hosting provider (e.g., [GitHub](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository)).
