#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable global-require */

const parseArgs = require('minimist');
const appRequire = require('../helpers/app-require');
const { log, fatal } = require('../helpers/logger');

const argv = parseArgs(process.argv.slice(2), {
  alias: {
    d: 'depth',
    p: 'path',
    h: 'help',
  },
  boolean: ['h', 'colors'],
  string: ['p'],
  default: {
    d: 5,
    colors: true,
  },
});

argv.mode = 'ssr';

if (argv.help) {
  console.log(`
  Description
    Inspect Quasar generated Webpack config

  Usage
    $ quasar ssg inspect
    $ quasar ssg inspect -p 'module.rules'

  Options
    --depth, -d      Number of levels deep (default: 5)
    --path, -p       Path of config in dot notation
                        Examples:
                          -p module.rules
                          -p plugins
    --colors,        Style output with ANSI color codes
    --help, -h       Displays this message
  `);
  process.exit(0);
}

function splitWebpackConfig(webpackConfigs) {
  return [
    { webpack: webpackConfigs.serverSide, name: 'Server-side' },
    { webpack: webpackConfigs.clientSide, name: 'Client-side' },
  ];
}

async function inspect(api) {
  appRequire('@quasar/app/lib/helpers/banner', api.appDir)(argv, 'production');

  const getMode = appRequire('@quasar/app/lib/mode/index', api.appDir);
  if (getMode('ssr').isInstalled !== true) {
    fatal('Requested mode for inspection is NOT installed.');
  }

  const QuasarConfFile = appRequire('@quasar/app/lib/quasar-conf-file', api.appDir);

  const depth = parseInt(argv.depth, 10) || Infinity;

  const extensionRunner = appRequire('@quasar/app/lib/app-extension/extensions-runner', api.appDir);
  const getQuasarCtx = appRequire('@quasar/app/lib/helpers/get-quasar-ctx', api.appDir);

  const ctx = getQuasarCtx({
    mode: 'ssr',
    target: undefined,
    debug: argv.debug,
    dev: false,
    prod: true,
  });

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  const quasarConfFile = new QuasarConfFile(ctx);

  try {
    await quasarConfFile.prepare();
  } catch (e) {
    console.log(e);
    fatal('quasar.conf.js has JS errors', 'FAIL');
  }

  await quasarConfFile.compile();

  const util = require('util');

  const cfgEntries = splitWebpackConfig(quasarConfFile.webpackConf);

  if (argv.path) {
    const dot = require('dot-prop');
    cfgEntries.forEach((entry) => {
      entry.webpack = dot.get(entry.webpack, argv.path);
    });
  }

  cfgEntries.forEach((cfgEntry) => {
    console.log();
    log(`Showing Webpack config for "${cfgEntry.name}" with depth of ${depth}`);
    console.log();
    console.log(
      util.inspect(cfgEntry.webpack, {
        showHidden: true,
        depth,
        colors: argv.colors,
        compact: false,
      }),
    );
  });

  console.log(`\n  Depth used: ${depth}. You can change it with "-d" parameter.\n`);
}

module.exports = (api) => {
  inspect(api);
};
