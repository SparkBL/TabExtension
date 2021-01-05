import { Main } from "./main.js";
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];
    console.log(
      'Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue
    );
  }
});
/*chrome.webRequest.onHeadersReceived.addListener(
  function (info) {
    var headers = info.responseHeaders;
    var index = headers.findIndex(
      (x) => x.name.toLowerCase() == "x-frame-options"
    );
    if (index != -1) {
      headers.splice(index, 1);
    }
    return { responseHeaders: headers };
  },
  {
    urls: ["*"], //
    types: ["sub_frame"],
  },
  ["blocking", "responseHeaders"]
);*/
document.addEventListener("DOMContentLoaded", function () {
  Main.init();
});
chrome.history.search({ text: "", maxResults: 10 }, function (data) {
  data.forEach(function (page) {
    console.log(page.url);
  });
});
