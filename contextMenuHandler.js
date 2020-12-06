export class ContextMenuHandler {
  static menu = document.getElementById("menu");
  static outClick = document.getElementById("out-click");

  constructor() {
    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    ContextMenuHandler.outClick.addEventListener("click", (e) => {
      ContextMenuHandler.menu.classList.remove("show");
      ContextMenuHandler.outClick.style.display = "none";
    });

    ContextMenuHandler.outClick.addEventListener("contextmenu", () => {
      ContextMenuHandler.menu.classList.remove("show");
      ContextMenuHandler.outClick.style.display = "none";
    });
  }

  setOptions(removeAction) {
    [].slice
      .call(document.querySelectorAll(".menu-item"))
      .forEach(function (element) {
        element.addEventListener("click", function (e) {
          if (element.id == "delete" && removeAction) {
            removeAction();
          }

          ContextMenuHandler.menu.classList.remove("show");
        });
      });
  }

  addListenedItems(items, action) {
    items.forEach(function (elem) {
      elem.getElement().addEventListener("click", function (e) {
        e.preventDefault();
      });
      elem.getElement().addEventListener("contextmenu", function (e) {
        e.preventDefault();
        if (action) action(e.currentTarget);
        ContextMenuHandler.menu.style.top = `${e.clientY}px`;
        ContextMenuHandler.menu.style.left = `${e.clientX}px`;
        ContextMenuHandler.menu.classList.add("show");
        console.log(e.currentTarget.outerHTML);
        ContextMenuHandler.outClick.style.display = "block";
      });
    });
  }
}
