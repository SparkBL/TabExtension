import { Storage } from "./core.js";
import { Grid } from "./grid.js";
import { Modal } from "./modal.js";
import { Menu } from "./menu.js";
import { Pubsub } from "./pubsub.js";
import { ThumbFetcher } from "./thumbfetcher.js";
export var Main = (function () {
  const path = document.querySelector(".path-title");
  const addShortcutButton = document.querySelector('[data-add="shortcut"]');
  const addFolderButton = document.querySelector('[data-add="folder"]');
  const backButton = document.getElementById("backButton");
  const sizeSelector = document.querySelector("#sizeSelector");
  const settingsButton = document.querySelector(".settings-button");
  Menu.addOption("delete", "Delete Item", function (target) {
    Pubsub.publish("delete", target);
  });
  Menu.addOption("editShortcut", "Edit Item", function (target) {
    Pubsub.publish("editShortcut", target);
  });
  Menu.addOption("editFolder", "Edit Item", function (target) {
    Pubsub.publish("editFolder", target);
  });
  Menu.addOption("move", "Move Item", function (target) {
    Pubsub.publish("menuMove", target);
  });

  Menu.addOption("createShortcut", "Add shortcut", function (target) {
    Pubsub.publish("createShortcut", target);
  });

  Menu.addOption("createFolder", "Add folder", function (target) {
    Pubsub.publish("createFolder", target);
  });

  addShortcutButton.addEventListener("click", function () {
    if (!Storage.isInTopSites()) Pubsub.publish("createShortcut", null);
  });
  addFolderButton.addEventListener("click", function () {
    if (!Storage.isInTopSites()) Pubsub.publish("createFolder", null);
  });

  backButton.addEventListener("click", function (e) {
    if (!Storage.isInRoot()) {
      Storage.setPreviousParent();
      Pubsub.publish("needGridLoad", true);
    }
  });

  settingsButton.addEventListener("click", function (e) {
    Modal.ShowSettingsModal(function (data) {
      Storage.setSettings(data);
      Pubsub.publish("needGridLoad", true);
    }, Storage.getSettings());
  });
  //Menu.addListenedItems(addShortcutButton, ["createShortcut", "createFolder"]);

  sizeSelector.addEventListener("change", function (ev) {
    Storage.setElementSize(sizeSelector.value);
    Pubsub.publish("needGridLoad", true);
  });

  Pubsub.subscribe("delete", function (target) {
    var targetId = Grid.remove(target);
    //  Storage.saveGridLayout(Grid.getLayout());
    Storage.removeElement(targetId);
    ThumbFetcher.removeThumbnail(targetId);
  });

  Pubsub.subscribe("menuMove", function (target) {
    Modal.ShowMoveModal(
      function (data) {
        console.log("Move modal opened");
        var targetId = Grid.remove(target);
        Storage.editElement(targetId, function (elem) {
          elem.parentId = data.newParentId;
          return elem;
        });
        ////?
      },
      Storage.buildHierarchy(target.getAttribute("data-id")),
      target.getAttribute("data-parent")
    );
  });

  Pubsub.subscribe("droppedIntoFolder", function (data) {
    if (
      !Storage.isTopSitesItem(data.folder.getAttribute("data-id")) &&
      !Storage.isTopSitesItem(data.target.getAttribute("data-id"))
    ) {
      var targetId = Grid.remove(data.target);
      Storage.editElement(targetId, function (elem) {
        elem.parentId = data.folder.getAttribute("data-id");
        return elem;
      });
    }
  });

  Pubsub.subscribe("editShortcut", function (target) {
    Modal.ShowShortcutModal(
      function (enteredData) {
        var el;
        Storage.editElement(target.getAttribute("data-id"), function (element) {
          element.name = enteredData["name"];
          element.url = enteredData["url"];
          element.viewType = enteredData["viewType"];
          el = element;
          return element;
        });
        Grid.editShortcut(el.id, el.url, el.name, el.viewType);
      },
      target.getAttribute("data-name"),
      target.getAttribute("data-url"),
      target.getAttribute("data-viewType"),
      true
    );
  });

  Pubsub.subscribe("editFolder", function (target) {
    Modal.ShowFolderModal(
      function (enteredData) {
        var el;
        Storage.editElement(target.getAttribute("data-id"), function (element) {
          element.name = enteredData["name"];
          el = element;
          return element;
        });
        Grid.editFolder(el.id, el.name, el.parentId);
      },
      target.getAttribute("data-name"),
      true
    );
  });

  Pubsub.subscribe("addedShortcutToGrid", function (target) {
    if (!Storage.isTopSitesItem(target.getAttribute("data-id")))
      Menu.addListenedItems(target, ["delete", "editShortcut", "move"]);
  });

  Pubsub.subscribe("addedFolderToGrid", function (target) {
    if (!Storage.isTopSitesItem(target.getAttribute("data-id")))
      Menu.addListenedItems(target, ["delete", "editFolder", "move"]);

    target.onclick = function (e) {
      if (!Grid.isDragging(target) && e.button != 2) {
        Storage.setCurrentParentId(target.getAttribute("data-id"));
        Pubsub.publish("needGridLoad", true);
      }
    };
  });

  Pubsub.subscribe("createShortcut", function () {
    Modal.ShowShortcutModal(function (data) {
      console.log(enteredData);
      var enteredData = data;
      var newTab = Storage.buildShortcut(
        enteredData.name,
        enteredData.url,
        enteredData.viewType
      );
      Storage.addElements(newTab);

      var newItem = Grid.addShortcut(
        newTab.id,
        newTab.url,
        newTab.name,
        newTab.parentId,
        newTab.viewType
      );
      Storage.saveGridLayout(Grid.getLayout());
      Pubsub.publish("addedShortcutToGrid", newItem);
    });
  });

  Pubsub.subscribe("createFolder", function () {
    Modal.ShowFolderModal(function (data) {
      console.log(enteredData);
      var enteredData = data;
      var newTab = Storage.buildFolder(enteredData.name);
      Storage.addElements(newTab);
      var newItem = Grid.addFolder(newTab.id, newTab.name, newTab.parentId);
      Storage.saveGridLayout(Grid.getLayout());
      Pubsub.publish("addedFolderToGrid", newItem);
    });
  });

  Pubsub.subscribe("needGridLoad", function (instantRemove) {
    var setts = Storage.getSettings();
    var dirContent = Storage.getCurrentChildren();
    Grid.setItemSize(Storage.getCurrentElementSize());
    ThumbFetcher.setRefreshRate(setts.refreshRate);
    Grid.setTabOpenMode(setts.tabOpenMode);

    Grid.clear(instantRemove);

    dirContent.forEach(function (item) {
      if (item.type === "folder") {
        Pubsub.publish(
          "addedFolderToGrid",
          Grid.addFolder(item.id, item.name, item.parentId)
        );
      }
      if (item.type === "shortcut") {
        Pubsub.publish(
          "addedShortcutToGrid",
          Grid.addShortcut(
            item.id,
            item.url,
            item.name,
            item.parentId,
            item.viewType
          )
        );
      }
    });
    Grid.applyLayout(Storage.getCurrentLayout());
    path.innerHTML = Storage.getCurrentParent().name;
  });

  Grid.onMove(function () {
    Storage.saveGridLayout(Grid.getLayout());
  });

  return {
    init: function () {
      Storage.sync(function () {
        ThumbFetcher.init(function () {
          Pubsub.publish("needGridLoad");
          sizeSelector.value = Storage.getCurrentElementSize();
        });
      });
    },
  };
})();
