import { Share, Clipboard, Device, getSchemeUri } from '@apps-in-toss/web-framework';

// Dedicated namespace: a developer's existing aitCharger bridge cannot overwrite it.
window.tossRouteShare = {
  isAvailable() {
    try { return /^intoss(?:-private)?:\/\//.test(getSchemeUri() || ''); }
    catch { return false; }
  },
  createLink(query) {
    // Always share the released app, even when testing a private bundle.
    return Share.createLink({ path: `intoss://gogowatercharging?${query}` });
  },
  share(title, url) { return Share.sendMessage({ message: `${title}\n${url}` }); },
  copy(url) { return Clipboard.setText(url); },
  open(url) { return Device.openURL(url); },
};
