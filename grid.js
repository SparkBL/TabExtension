export class Grid {
  grid;
  selectedItem = null;
  constructor() {
    this.grid = new Muuri(".grid", {
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

      //itemVisibleClass: 'muuri-item-shown',
    });
    this.grid.add(this.buildAddButton(), {
      index: -1,
    });
  }

  buildShortcut(id, url, name) {
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

  buildFolder(id, name) {
    var liName = document.createElement("li");
    var span = document.createElement("span");
    if (!name) span.innerHTML = "New Folder";
    else span.innerHTML = name;
    liName.appendChild(a);
    var returnDiv = document.createElement("div");
    returnDiv.appendChild(liName);
    // returnDiv.setAttribute("class", "item-content");
    return liName;
  }

  buildAddButton() {
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

  addItems(item) {
    var items = [].concat(item || []);
    var gridItems = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type == "shortcut") {
        var newItem = this.buildShortcut(
          items[i].id,
          items[i].url,
          items[i].name
        );
        gridItems.push(newItem);
      }
      if (items[i].type == "folder") {
        var newItem = this.buildFolder(items[i].id, items[i].name);
        gridItems.push(newItem);
      }
    }
    var ret = this.grid.add(gridItems, { index: 0 });
    return ret;
  }

  selectItem(item) {
    this.selectedItem = this.grid.getItem(item);
  }
  getSelected() {
    return this.selectedItem;
  }
  setAddButtonHandler(action) {
    document
      .getElementById("AddElement")
      .addEventListener("click", function (e) {
        action();
      });
  }
  removeSelected() {
    var id = this.selectedItem.getElement().id;
    this.grid.remove([this.selectedItem], { removeElements: true });
    this.grid.refreshItems(null, true);
    return id;
  }
  gridAddEvent(action) {
    this.grid.on("add", function (items) {
      action(items);
    });
  }
}
