export class Grid {
  #grid;
  constructor() {
    this.#grid = new Muuri(".grid", {
      layout: {
        fillGaps: false,
        horizontal: false,
        alignRight: false,
        alignBottom: false,
        rounding: false,
      },
      dragEnabled: true,
      itemClass: "item",
      dragCssProps: {
        touchAction: "pan-y",
        userSelect: "",
        userDrag: "",
        tapHighlightColor: "",
        touchCallout: "",
        contentZooming: "",
      },
    });
  }

  addItems(item, opts) {
    var items = [].concat(item || []);
    items.forEach(function (elem) {
      elem.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
    return this.#grid.add(items, opts);
  }

  removeItems(item) {
    var item = [].concat(item || []);
    var toRemove = this.#grid.getItems(item);
    this.#grid.remove(toRemove, { removeElements: true });
    this.#grid.refreshItems(null, true);
  }
  addGridEvent(type, action) {
    this.#grid.on(type, function (items) {
      action(items);
    });
  }

  getItemById(id, action) {
    var items = this.#grid.getItems();
    for (var i = 0; i < items.length; i++) {
      if (items[i].getElement().id == id) return action(items[i].getElement());
    }
  }
}

export function buildShortcut(id, url, name) {
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
  wrapper.id = id;
  return wrapper;
}

export function buildFolder(id, name) {
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
  wrapper.id = id;
  return wrapper;
}

export function buildAddButton() {
  var liImg = document.createElement("li");
  var liName = document.createElement("li");
  var img = liImg.appendChild(document.createElement("img"));
  img.src =
    "chrome-extension://ehbpekfnoogckmdibaphbloichpldcdb/images/plus.png";
  img.setAttribute("class", "addicon");
  var span = document.createElement("span");
  span.innerHTML = "Add element";
  liName.appendChild(span);
  var viewDiv = document.createElement("div");
  viewDiv.appendChild(liImg);
  viewDiv.appendChild(liName);
  viewDiv.setAttribute("class", "item-content");
  var wrapper = document.createElement("a");
  wrapper.id = "AddElement";
  wrapper.setAttribute("class", "item");
  wrapper.appendChild(viewDiv);
  return wrapper;
}
