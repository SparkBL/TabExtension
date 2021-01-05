export var ThumbCacher = (function () {

var openedWindows=[];
    function fetchImage(url){
        var i = document.createElement("img");
        chrome.windows.create({type:"popup",url:url,focused:false,state:"normal"}, function(window){
            openedWindows.push(window.id);
            console.log("Window created",window.tabs);
            chrome.tabs.insertCSS(window.tabs[0].id, {allFrames:true,file:"thumb_no_scroll.css"}, function(){
            chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
              if (tabId ==window.tabs[0].id && changeInfo.status === 'complete')
            {
              chrome.tabs.captureVisibleTab(window.id, {format:"png"}, function(dataString){
                i.src = dataString;
                 chrome.windows.remove(window.id,function(){
                   console.log("Window closed");
                 })
               })
              }
            })
          })
          });
          return i;
    }

    return {
        storeImage: function(id,url){
            var img = fetchImage(url);
            img.setAttribute("id",id);
            document.body.appendChild(img);
        },
        getImage: function(id){
            return document.getElementById(id);
        },
        updateImage(id,url){
            var img = fetchImage(url);
            document.getElementById(id).src = img.src;
        },
        closeOpenedWindows:function(){
            openedWindows.forEach(function(window){
                chrome.windows.remove(window.id,function(){
                    console.log("Closed window",window.id);
                })
            }) 
        }
    }

})();

