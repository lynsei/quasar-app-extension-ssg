/* eslint-disable no-void */
import { isRuntimeSsrPreHydration, client } from 'quasar/src/plugins/Platform.js';

function getMobilePlatform(is) {
  if (is.ios === true) {
    return 'ios';
  }
  if (is.android === true) {
    return 'android';
  }

  return '';
}

export default ({ app }) => {
  if (isRuntimeSsrPreHydration.value === true) {
    const classes = document.body.className;

    let newCls = classes;

    if (client.is.mobile === true) {
      newCls = newCls.replace('desktop', 'mobile');

      const mobile = getMobilePlatform(client.is);

      if (mobile !== void 0) {
        newCls += ` platform-${mobile}`;
      }
    }

    if (client.is.nativeMobile === true) {
      const type = client.is.nativeMobileWrapper;

      newCls += ` ${type}`;
      newCls += ' native-mobile';

      if (
        app.is.ios === true
        && (app[type] === void 0 || app[type].iosStatusBarPadding !== false)
      ) {
        newCls += ' q-ios-padding';
      }
    }

    if (classes !== newCls) {
      document.body.className = newCls;
    }
  }
};
