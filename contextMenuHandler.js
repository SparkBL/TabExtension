export class ContextMenuHandler {
  _menu;
  _outClick;
  _nowSelected;
  _options = [];
  _allowedOptions = {};
  constructor() {
    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
    this._menu = document.body.appendChild(document.createElement("ul"));
    this._menu.id = "menu";
    this._outClick = document.body.appendChild(document.createElement("div"));
    this._outClick.id = "outClick";

    this._outClick.addEventListener("click", (e) => {
      this._menu.classList.remove("show");
      this._outClick.style.display = "none";
      this._options.forEach(function (elem) {
        elem.style.display = "none";
      });
    });

    window.addEventListener("click", () => {
      this._menu.classList.remove("show");
      this._outClick.style.display = "none";
      this._options.forEach(function (elem) {
        elem.style.display = "none";
      });
    });
  }
  AddOption(id, name, action) {
    var newOption = document.createElement("li");
    newOption.setAttribute("class", "menu-item");
    newOption.id = id;
    newOption.innerHTML = name;
    this._options.push(newOption);
    var t = this;
    newOption.addEventListener("click", function (sel) {
      sel = t._nowSelected;
      action(sel);
    });
    this._menu.appendChild(newOption);
  }

  addListenedItems(items, allowedOptions) {
    var items = [].concat(items || []);
    var t = this;
    items.forEach(function (elem) {
      t._allowedOptions[elem.getElement().id] = allowedOptions;
      elem.getElement().addEventListener("contextmenu", function (e) {
        e.preventDefault();
        t._nowSelected = e.currentTarget;
        t._menu.style.top = `${e.clientY}px`;
        t._menu.style.left = `${e.clientX}px`;
        t._menu.classList.add("show");
        var allowedOptions = t._allowedOptions[elem.getElement().id];
        t._options.forEach(function (elem) {
          if (allowedOptions.includes(elem.id)) elem.style.display = "block";
        });

        console.log(e.currentTarget.outerHTML);
        t._outClick.style.display = "block";
      });
    });
  }
}
