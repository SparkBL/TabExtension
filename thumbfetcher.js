import { Pubsub } from "./pubsub.js";
export var ThumbFetcher = (function () {
  var openedWindows = [];
  var shortcutThumbnails = {};
  var refreshRate = 1;
  function commit() {
    chrome.storage.local.set(
      {
        shortcutThumbnails: shortcutThumbnails,
      },
      function () {
        console.log("Saved thumbnails locally : ", shortcutThumbnails);
      }
    );
  }
  function sync(callback) {
    chrome.storage.local.get(["shortcutThumbnails"], function (result) {
      if (result.shortcutThumbnails) {
        shortcutThumbnails = result.shortcutThumbnails;
        console.log("Synced local thumbnails: \n", result.shortcutThumbnails);
      } else console.log("Failed to get thumbnails from storage!");
      if (callback && typeof callback == "function") callback();
    });
  }

  function fetchImage(url, callback) {
    chrome.windows.create(
      {
        state: "minimized",
        type: "popup",
        url: url,
        setSelfAsOpener: false,
      },
      function (window) {
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
          if (tabId == window.tabs[0].id)
            chrome.tabs.insertCSS(
              window.tabs[0].id,
              {
                file: "thumb_no_scroll.css",
                runAt: "document_start",
              },
              function () {
                if (changeInfo.status === "complete") {
                  chrome.tabs.captureVisibleTab(
                    window.id,
                    { format: "png" },
                    function (dataString) {
                      if (callback) callback(dataString);
                      chrome.windows.remove(window.id, function () {
                        console.log("Window closed");
                        openedWindows = openedWindows.filter(
                          (x) => x != window.id
                        );
                      });
                    }
                  );
                }
              }
            );
        });

        openedWindows.push(window.id);
        console.log("Window created", window.tabs);
      }
    );
    return;
  }
  /* function closeOpenedWindows (){
      openedWindows.forEach(function(window){
          chrome.windows.remove(window.id,function(){
              console.log("Closed window");
          })
      }) 
  }*/
  window.onbeforeunload = function (e) {
    // chrome.windows.create({type:"normal",url:"https://vk.com",focused:false,state:"normal"}, function(window){})
    chrome.runtime.sendMessage({ windows: openedWindows }, function (response) {
      console.log(response.farewell);
    });
    //closeOpenedWindows();
  };

  /*Pubsub.subscribe("needGridLoad",function(){
    closeOpenedWindows();
  })*/

  Pubsub.subscribe("generateThumbnail", function (data) {
    if (data.url)
      if (
        !shortcutThumbnails[data.id] ||
        shortcutThumbnails[data.id]["date"] +
          refreshRate * 1000 * 60 * 60 * 24 <
          Date.now() ||
        shortcutThumbnails[data.id]["url"] != data.url
      )
        fetchImage(data.url, function (generatedThumbnail) {
          shortcutThumbnails[data.id] = {
            thumbnail: generatedThumbnail,
            url: data.url,
            date: Date.now(),
          };
          Pubsub.publish("generatedThumbnail", {
            id: data.id,
            dataString: generatedThumbnail,
          });
          commit();
        });
      else {
        Pubsub.publish("generatedThumbnail", {
          id: data.id,
          dataString: shortcutThumbnails[data.id]["thumbnail"],
        });
      }
    else Pubsub.publish("generatedThumbnail", undefined);
  });

  return {
    init: function (callback) {
      sync(callback);
    },
    removeThumbnail: function (id) {
      delete shortcutThumbnails[id];
      commit();
    },
    setRefreshRate: function (rate) {
      refreshRate = rate;
    },
  };
})();
