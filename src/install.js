/**
 * Quasar App Extension install script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/install-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/InstallAPI.js
 */
module.exports = function (api) {
  api.compatibleWith('quasar', '^1.8.0')

  api.compatibleWith('@quasar/app', '^1.5.0||^2.0.0')

  api.onExitLog('See https://github.com/freddy38510/quasar-app-extension-ssg/#configuration to configure the extension then run "$ quasar ssg generate"')
}
