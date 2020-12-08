export var Grid = (function () {
  const dragContainer = document.querySelector(".drag-container");
  const gridElement = document.querySelector(".grid");
  const filterField = document.querySelector(
    ".grid-control-field.filter-field"
  );
  const searchField = document.querySelector(
    ".grid-control-field.search-field"
  );
  const sortField = document.querySelector(".grid-control-field.sort-field");
  const layoutField = document.querySelector(
    ".grid-control-field.layout-field"
  );
  const addButton = document.querySelector(".grid-button.add-more-items");
  const colors = ["red", "blue", "green"];
  var elemWidth = 2;
  var elemHeight = 2;
  let addEffectTimeout = null;

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
    dragEnabled: true,
    dragHandle: null,
    dragContainer: dragContainer,
    dragRelease: {
      duration: 400,
      easing: "cubic-bezier(0.625, 0.225, 0.100, 0.890)",
      useDragContainer: true,
    },
    dragStartPredicate: {
      distance: 30,
      delay: 30,
    },
    dragPlaceholder: {
      enabled: true,
      createElement(item) {
        var placeholder = item.getElement().cloneNode(true);
        console.log(placeholder);
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

  function getRandomItem(collection) {
    return collection[Math.floor(Math.random() * collection.length)];
  }

  function buildShortcut(id, url, name, parent) {
    var liImg = document.createElement("li");
    var liName = document.createElement("li");
    var img = liImg.appendChild(document.createElement("img"));
    img.src = "chrome://favicon/" + url;
    img.setAttribute("class", "favicon");
    var span = document.createElement("span");

    if (!name) span.innerHTML = url;
    else span.innerHTML = name;
    liName.appendChild(span);
    var viewDiv = document.createElement("div");
    viewDiv.appendChild(liImg);
    viewDiv.appendChild(liName);
    viewDiv.setAttribute("class", "item-content");
    var wrapper = document.createElement("a");
    wrapper.setAttribute("class", "item");
    wrapper.href = url;
    wrapper.setAttribute("target", "_blank");
    wrapper.setAttribute("rel", "noopener noreferrer");
    wrapper.appendChild(viewDiv);
    wrapper.setAttribute("data-id", id);
    wrapper.setAttribute("data-name", name);
    wrapper.setAttribute("data-parent", parent);
    wrapper.setAttribute("data-type", "shortcut");
    wrapper.classList.add(
      "h" + elemHeight,
      "w" + elemWidth,
      getRandomItem(colors)
    );
    return wrapper;
  }

  function buildFolder(id, name, parent) {
    var liName = document.createElement("li");

    var span = document.createElement("span");

    if (!name) span.innerHTML = url;
    else span.innerHTML = name;
    liName.appendChild(span);
    var viewDiv = document.createElement("div");
    viewDiv.appendChild(liName);
    viewDiv.setAttribute("class", "item-content");
    var wrapper = document.createElement("a");
    wrapper.setAttribute("class", "item");
    wrapper.appendChild(viewDiv);
    wrapper.setAttribute("data-id", id);
    wrapper.setAttribute("data-name", name);
    wrapper.setAttribute("data-parent", parent);
    wrapper.setAttribute("data-type", "folder");
    wrapper.classList.add(
      "h" + elemHeight,
      "w" + elemWidth,
      getRandomItem(colors)
    );
    return wrapper;
  }

  function addItem(elem) {
    //  addButton.classList.add("processing");

    grid.add(elem, {
      layout: true,
      active: true,
    });

    /*  if (sortFieldValue !== "order") {
        grid.sort(sortFieldValue === "title" ? "title" : "color title", {
          layout: false,
        });
        dragOrder = dragOrder.concat(item);
      }
*/
    // filter();

    /* if (addEffectTimeout) clearTimeout(addEffectTimeout);
    addEffectTimeout = setTimeout(() => {
      addEffectTimeout = null;
      addButton.classList.remove("processing");
    }, 250);*/
    return elem;
  }

  function removeItem(item) {
    if (!item) return;
    grid.hide([item], {
      onFinish: () => {
        grid.remove(item, { removeElements: true });
        //  if (sortFieldValue !== "order") {
        //  const itemIndex = dragOrder.indexOf(item);
        //  if (itemIndex > -1) dragOrder.splice(itemIndex, 1);
        //   }
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
  };
})();
