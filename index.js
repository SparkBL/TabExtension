/*function onAnchorClick(event) {
  var newTab = chrome.tabs.create({
    url: event.srcElement.href,
    active: false,
  });
  chrome.tabs.move(newTab.tabId, { index: -1 });
  return false;
}
*/
function buildDom(mostVisitedURLs) {
  for (var i = 0; i < mostVisitedURLs.length; i++) {
    var div = document.createElement("div");
    div.setAttribute("class", "category_wrapper");
    var contentDiv = div.appendChild(document.createElement("div"));
    contentDiv.setAttribute("class", "category");
    var li = contentDiv.appendChild(document.createElement("li"));
    var img = li.appendChild(document.createElement("img"));
    img.src = "chrome://favicon/" + mostVisitedURLs[i].url;
    img.setAttribute("class", "favicon");
    li = contentDiv.appendChild(document.createElement("li"));

    var text = li.appendChild(document.createElement("span"));
    text.innerHTML = mostVisitedURLs[i].title;
    var a = document.body
      .getElementsByClassName("container")[0]
      .appendChild(document.createElement("a"));
    a.href = mostVisitedURLs[i].url;
    a.setAttribute("class", "adiv");
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    a.appendChild(div);
    // a.addEventListener("click", onAnchorClick);
  }
}

chrome.topSites.get(buildDom);
