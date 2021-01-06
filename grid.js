import { Pubsub } from "./pubsub.js";

//const puppeteer = require("node_modules/puppeteer-core");
export var Grid = (function () {
  const dragContainer = document.querySelector(".drag-container");
  const gridElement = document.querySelector(".grid");
  const templateContainer = document.getElementById("template");
  var time,posX,posY;
  const collideCoeff = 0.3;
  var collidedFolder;
  const types = ["shortcut", "folder"];
  var currentSize = 1;
  var tabOpenMode = "_blank";
  var viewType = "icon";
  var thumbnailQueue = [];
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
   /* dragSortHeuristics: {
      sortInterval: 3600000, // 1 hour
    },*/
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
    dragSortPredicate: function (item, e) {
      return Muuri.ItemDrag.defaultSortPredicate(item, {
        action: 'swap',
        threshold: 83,
      });
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

  Pubsub.subscribe("GeneratedThumbnail",function(data){
    var id = data["id"];
    var dataString = data["dataString"];
    var viewObj = thumbnailQueue.find(x => x.id === id);
    viewObj.viewDiv.style.backgroundImage = "url(" + dataString + ")";
    thumbnailQueue.splice(thumbnailQueue.findIndex(x => x.id === viewObj.id),1);
  })

  function setIcon(id,viewDiv,url) {
    if (url){
    if (viewType === "icon") {
      var i = document.createElement("img");
      i.src = "chrome://favicon/" + url;
      i.setAttribute("class", "favicon");
      viewDiv.appendChild(i);
    } else if (viewType === "thumbnail"){
      
      thumbnailQueue.push({id:id,viewDiv:viewDiv});
      Pubsub.publish("GenerateThumbnail",{id:id,url:url});     
    }
  }

  
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

   function collide (el1, el2) {
    var rect1 = el1.getBoundingClientRect();
    var rect2 = el2.getBoundingClientRect();

    return !(
      rect1.top > rect2.bottom - rect2.bottom*collideCoeff ||
      rect1.right - rect1.right *collideCoeff < rect2.left ||
     rect1.bottom  - rect1.bottom*collideCoeff< rect2.top ||
     rect1.left > rect2.right - rect2.right *collideCoeff
    );
   }


  grid.on('dragMove', function (item, e) {
   // console.log(e.deltaTime);
      if(Math.abs(e.clientX-posX)<20 && Math.abs(e.clientY-posY)<20){
      if (e.deltaTime-time>1000){
        console.log("Waiting....");
        collidedFolder = grid.getItems().find(x =>x.getElement().getAttribute("data-type")==="folder" && item.getElement().getAttribute("data-id")!== x.getElement().getAttribute("data-id") && collide(item.getElement(),x.getElement()));
        if (collidedFolder){
          collidedFolder = collidedFolder.getElement();
        console.log(collidedFolder);
        collidedFolder.firstChild.style.backgroundColor = "orange";
        }
      }
    } else {
      if (collidedFolder)
      collidedFolder.firstChild.style.backgroundColor = "blue";
      time = e.deltaTime;
      posX = e.clientX;
      posY = e.clientY;
      
    }
      
      
  });

 

  function buildShortcut(id, url, name, parent) {
    var span = document.createElement("div");
    if (!name) span.innerHTML = url;
    else span.innerHTML = name;
    span.setAttribute("class","shortcut-title");
    var viewDiv = document.createElement("div");
    setIcon(id,viewDiv,url);
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
          setIcon(id,el.querySelector("div"),url);
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

    setViewType: function (type) {
      if (type === "icon" || type === "thumbnail")
      viewType = type;
    },
  };
})();
