import { Storage } from "./core.js";
import { Grid } from "./grid.js";
import { Modal } from "./modal.js";
import { Menu } from "./menu.js";
import { Pubsub } from "./pubsub.js";
export var Main = (function () {
  const path = document.querySelector(".path-title");
  const addButton = document.querySelector(".grid-button.add-more-items");
  const backButton = document.getElementById("backButton");
  Menu.addOption("delete", "Delete Item", function (target) {
    Pubsub.publish("delete", target);
  });
  Menu.addOption("edit", "Edit Item", function (target) {
    Pubsub.publish("edit", target);
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

  addButton.addEventListener("click", function () {
    Pubsub.publish("createShortcut", null);
  });

  backButton.addEventListener("click", function (e) {
    if (!Storage.isInRoot()) {
      Storage.setPreviousParent();
      Pubsub.publish("needGridLoad");
    }
  });
  Menu.addListenedItems(addButton, ["createShortcut", "createFolder"]);

  Pubsub.subscribe("delete", function (target) {
    var targetId = Grid.remove(target);
    Storage.saveGridLayout(Grid.getLayout());
    Storage.removeElement(targetId);
  });

  Pubsub.subscribe("addedShortcutToGrid", function (target) {
    Menu.addListenedItems(target, ["delete", "edit", "move"]);
  });

  Pubsub.subscribe("createShortcut", function () {
    Modal.ShowShortcutModal(function (data) {
      console.log(enteredData);
      var enteredData = data;
      var newTab = Storage.buildShortcut(enteredData.name, enteredData.url);
      Storage.addElements(newTab);
      Storage.saveGridLayout(Grid.getLayout());
      var newItem = Grid.addShortcut(
        newTab.id,
        newTab.url,
        newTab.name,
        newTab.parentId
      );

      Pubsub.publish("addedShortcutToGrid", newItem);
    });
  });

  Pubsub.subscribe("addedFolderToGrid", function (target) {
    Menu.addListenedItems(target, ["delete", "edit", "move"]);

    target.onclick = function (e) {
      if (!Grid.isDragging(target) && e.button != 2) {
        Storage.setCurrentParentId(target.getAttribute("data-id"));
        Pubsub.publish("needGridLoad", null);
      }
    };
  });

  Pubsub.subscribe("needGridLoad", function (targets) {
    Grid.clear();
    var dirContent = Storage.getCurrentChildren();
    if (Array.isArray(targets)) dirContent = targets;
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
          Grid.addShortcut(item.id, item.url, item.name, item.parentId)
        );
      }
    });
    path.innerHTML = Storage.getCurrentParent().name;
    Grid.applyLayout(Storage.getCurrentLayout());
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

  Grid.onMove(function () {
    Storage.saveGridLayout(Grid.getLayout());
  });

  return {
    init: function () {
      Storage.sync(function () {
        Pubsub.publish("needGridLoad");
      });
    },
  };
})();
