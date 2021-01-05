//const puppeteer = require("node_modules/puppeteer-core");
export var Grid = (function () {
  const dragContainer = document.querySelector(".drag-container");
  const gridElement = document.querySelector(".grid");
  const templateContainer = document.getElementById("template");

  const types = ["shortcut", "folder"];
  var currentSize = 1;
  var tabOpenMode = "_blank";
  var iconMode = false;
  const grid = new Muuri(gridElement, {
    showDuration: 400,
    showEasing: "ease",
    hideDuration: 400,
    hideEasing: "ease",
    layoutDuration: 400,
    layoutEasing: "cubic-bezier(0.625, 0.225, 0.100, 0.890)",
    sortData: {
      title(item, element) {
        return element.getAttribute("data-title") || "";
      },
      color(item, element) {
        return element.getAttribute("data-color") || "";
      },
    },
    layout: {
      fillGaps: true,
    },
    dragEnabled: true,
    dragHandle: null,
    dragContainer: dragContainer,
    dragRelease: {
      duration: 400,
      easing: "cubic-bezier(0.625, 0.225, 0.100, 0.890)",
      useDragContainer: true,
    },
    dragStartPredicate: {
      distance: 3,
      delay: 3,
    },
    dragPlaceholder: {
      enabled: true,
      createElement(item) {
        var placeholder = item.getElement().cloneNode(true);
        placeholder.firstChild.innerHTML = "";
        return placeholder;
      },
    },
    dragAutoScroll: {
      targets: [window],
      sortDuringScroll: false,
      syncAfterScroll: false,
    },
    itemClass: "item",
  });

  function setIcon(viewDiv,url) {
   
    if (iconMode) {
      var i = document.createElement("img");
      i.src = "chrome://favicon/" + url;
      i.setAttribute("class", "favicon");
      viewDiv.appendChild(i);
    } else {
      chrome.windows.create({type:"popup",url:url,focused:false,state:"normal"}, function(window){
  console.log("Window created",window.tabs);
  chrome.tabs.insertCSS(window.tabs[0].id, {allFrames:true,file:"thumb_no_scroll.css"}, function(){
  chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if (tabId ==window.tabs[0].id && changeInfo.status === 'complete')
  {
    chrome.tabs.captureVisibleTab(window.id, {format:"png"}, function(dataString){
      viewDiv.style.backgroundImage = "url(" + dataString + ")";

       chrome.windows.remove(window.id,function(){
         console.log("Window closed");
       })
     })
    }
  })
})
});
    }
    return i;
  }

  function serializeLayout() {
    var itemIds = grid.getItems().map(function (item) {
      return item.getElement().getAttribute("data-id");
    });
    return itemIds;
  }

  function loadLayout(layout) {
    var currentItems = grid.getItems();
    var currentItemIds = currentItems.map(function (item) {
      return item.getElement().getAttribute("data-id");
    });
    var newItems = [];
    var itemId;
    var itemIndex;

    for (var i = 0; i < layout.length; i++) {
      itemId = layout[i];
      itemIndex = currentItemIds.indexOf(itemId);
      if (itemIndex > -1) {
        newItems.push(currentItems[itemIndex]);
      }
    }

    grid.sort(newItems, { layout: "instant" });
  }

  function buildShortcut(id, url, name, parent) {
   // var img = getIcon(url);
    var span = document.createElement("div");
    if (!name) span.innerHTML = url;
    else span.innerHTML = name;
    span.setAttribute("class","shortcut-title");
    var viewDiv = document.createElement("div");
   // viewDiv.appendChild(img);
    viewDiv.appendChild(span);
    viewDiv.setAttribute("class", "item-content");
    var wrapper = document.createElement("div");
    wrapper.onclick = function (e) {
      window.open(url, tabOpenMode, "noopener noreferrer");
    };
    setIcon(viewDiv,url);
    wrapper.setAttribute("class", "item");
    wrapper.appendChild(viewDiv);
    wrapper.setAttribute("data-id", id);
    wrapper.setAttribute("data-name", name);
    wrapper.setAttribute("data-url", url);
    wrapper.setAttribute("data-parent", parent);
    wrapper.setAttribute("data-type", types[0]);
    wrapper.setAttribute("data-size", currentSize);
    return wrapper;
  }

  function buildFolder(id, name, parent) {
    var img = document.importNode(templateContainer.content.children[0], true);
    var span = document.createElement("div");
    span.innerHTML = name;
    span.setAttribute("class","shortcut-title");
    var viewDiv = document.createElement("div");
    viewDiv.appendChild(img);
    viewDiv.appendChild(span);
    viewDiv.setAttribute("class", "item-content");
    var wrapper = document.createElement("div");
    wrapper.setAttribute("class", "item");
    wrapper.appendChild(viewDiv);
    wrapper.setAttribute("data-id", id);
    wrapper.setAttribute("data-name", name);
    wrapper.setAttribute("data-parent", parent);
    wrapper.setAttribute("data-type", types[1]);
    wrapper.setAttribute("data-size", currentSize);
    return wrapper;
  }

  function addItem(elem) {
    grid.add(elem, {
      layout: true,
      active: true,
    });

    return elem;
  }

  function removeItem(item, instantRemove) {
    var items = [].concat(item || []);
    grid.hide(items, {
      onFinish: () => {
        grid.remove(items, { removeElements: true });
      },
      instant: instantRemove,
    });
  }

  return {
    addShortcut: function (id, url, name, parentId) {
      return addItem(buildShortcut(id, url, name, parentId));
    },
    addFolder: function (id, name, parentId) {
      return addItem(buildFolder(id, name, parentId));
    },
    remove: function (elem) {
      removeItem(grid.getItem(elem), false);
      return elem.getAttribute("data-id");
    },
    removeById: function (id) {
      if (!id) return;
      grid.getItems().forEach(function (item) {
        if (item.getElement().getAttribute("data-id") === id)
          removeItem(item, false);
      });
    },
    clear: function (instantRemove = false) {
      removeItem(grid.getItems(), instantRemove);
    },
    isDragging: function (element) {
      return grid.getItem(element).isReleasing();
    },
    getLayout: function () {
      return serializeLayout();
    },
    applyLayout: function (data) {
      if (data) loadLayout(data);
    },
    onMove: function (callback) {
      if (callback && typeof callback == "function") grid.on("move", callback);
    },
    setTabOpenMode: function (blank) {
      if (blank) tabOpenMode = "_blank";
      else tabOpenMode = "_self";
    },
    editShortcut: function (id, url, name) {
      grid.getItems().forEach(function (item) {
        var el = item.getElement();
        if (el.getAttribute("data-id") == id) {
          if (name) el.querySelector("div").lastChild.innerHTML = name;
          else el.querySelector("div").lastChild.innerHTML = url;
          el.setAttribute("data-url", url);
          el.setAttribute("data-name", name);
          setIcon(el.querySelector("div"));
          el.onclick = function (e) {
            window.open(url, tabOpenMode, "noopener noreferrer");
          };
          return;
        }
      });
    },
    editFolder: function (id, name) {
      grid.getItems().forEach(function (item) {
        var el = item.getElement();
        if (el.getAttribute("data-id") == id) {
          el.querySelector("div").lastChild.innerHTML = name;
          el.setAttribute("data-name", name);
          return;
        }
      });
    },
    setItemSize: function (sizeFactor) {
      currentSize = sizeFactor;
      /* grid.getItems().forEach(function (item) {
        var el = item.getElement();
        el.setAttribute("data-size", sizeFactor);
      });*/
    },

    setViewMode: function (mode) {
      iconMode = mode;
    },
  };
})();
