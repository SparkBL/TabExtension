
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







/*chrome.windows.create({type:"popup",url:"https://youtube.com",focused:false,state:"normal"}, function(window){
  console.log("Window created",window.tabs);
  chrome.tabs.insertCSS(window.tabs[0].id, {allFrames:true,file:"thumb_no_scroll.css"}, function(){
  chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if (tabId ==window.tabs[0].id && changeInfo.status === 'complete')
  {
    chrome.tabs.captureVisibleTab(window.id, {format:"png"}, function(dataString){
      document.getElementById("testimg").src = dataString;
       chrome.windows.remove(window.id,function(){
         console.log("Window closed");
       })
     })
    }
  })
})
});

*/




document.addEventListener("DOMContentLoaded", function () {
  
  import("./main.js").then(module => {module.Main.init()}) 
  //Main.init();
});

