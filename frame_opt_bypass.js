chrome.webRequest.onHeadersReceived.addListener(
  function(info) {
    var headers = info.responseHeaders;
    console.log(headers);
    var index = headers.findIndex(x=>x.name.toLowerCase() == "x-frame-options");
    if (index !=-1) {
      headers.splice(index, 1);
    }
    
    return {responseHeaders: headers};
  },
  {
      urls: ['<all_urls>'],
      types: ['sub_frame']
  },
  ['blocking', 'responseHeaders']
);
/*
(function() {
  var cors_api_host = 'cors-anywhere.herokuapp.com';
  var cors_api_url = 'https://' + cors_api_host + '/';
  var slice = [].slice;
  var origin = window.location.protocol + '//' + window.location.host;
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
      var args = slice.call(arguments);
      var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
      if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
          targetOrigin[1] !== cors_api_host) {
          args[1] = cors_api_url + args[1];
      }
      return open.apply(this, args);
  };
})();*/