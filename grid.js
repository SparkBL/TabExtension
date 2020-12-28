export var Grid = (function () {
  const dragContainer = document.querySelector(".drag-container");
  const gridElement = document.querySelector(".grid");
  const templateContainer = document.getElementById("template");

  const types = ["shortcut", "folder"];
  const sizes = [1, 2, 3, 4, 5, 6];
  var currentSize = 1;
  var tabOpenMode = "_blank";
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
    var img = document.createElement("img");
    img.src = "chrome://favicon/" + url;
    img.setAttribute("class", "favicon");
    var span = document.createElement("span");
    if (!name) span.innerHTML = url;
    else span.innerHTML = name;
    var viewDiv = document.createElement("div");
    viewDiv.appendChild(img);
    viewDiv.appendChild(span);
    viewDiv.setAttribute("class", "item-content");
    var wrapper = document.createElement("div");
    wrapper.onclick = function (e) {
      window.open(url, tabOpenMode, "noopener noreferrer");
    };
    wrapper.setAttribute("class", "item");
    wrapper.appendChild(viewDiv);
    wrapper.setAttribute("data-id", id);
    wrapper.setAttribute("data-name", name);
    wrapper.setAttribute("data-url", url);
    wrapper.setAttribute("data-parent", parent);
    wrapper.setAttribute("data-type", types[0]);
    wrapper.setAttribute("data-size", sizes[currentSize]);
    return wrapper;
  }

  function buildFolder(id, name, parent) {
    var img = document.importNode(templateContainer.content.children[0], true);
    var span = document.createElement("span");
    span.innerHTML = name;
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
    wrapper.setAttribute("data-size", sizes[currentSize]);
    return wrapper;
  }

  function addItem(elem) {
    grid.add(elem, {
      layout: true,
      active: true,
    });

    return elem;
  }

  function removeItem(item) {
    if (!item) return;
    grid.hide([item], {
      onFinish: () => {
        grid.remove([item]);
        item.getElement().remove();
      },
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
      removeItem(grid.getItem(elem));
      return elem.getAttribute("data-id");
    },
    removeById: function (id) {
      if (!id) return;
      grid.getItems().forEach(function (item) {
        if (item.getElement().getAttribute("data-id") === id) removeItem(item);
      });
    },
    clear: function () {
      grid.getItems().forEach(function (item) {
        removeItem(item);
      });
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
          if (name) el.querySelector("span").innerHTML = name;
          else el.querySelector("span").innerHTML = url;
          el.setAttribute("data-url", url);
          el.setAttribute("data-name", name);
          el.querySelector("img").src = "chrome://favicon/" + url;
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
          el.querySelector("span").innerHTML = name;
          el.setAttribute("data-name", name);
          return;
        }
      });
    },
  };
})();
