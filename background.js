chrome.runtime.onInstalled.addListener(function() {
    chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        request.windows.forEach(function(item){
            chrome.windows.remove(item,function(){
                console.log("Closed window",item);
            })
        })
        sendResponse({farewell:"Closed all windows"})
        
    }
  );
});