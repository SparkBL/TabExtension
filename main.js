import { Storage } from "./core.js";
import { Grid } from "./grid.js";
import { Modal } from "./modal.js";
import { Menu } from "./menu.js";
import { Pubsub } from "./pubsub.js";
export var Main = (function () {
  const addButton = document.querySelector(".grid-button.add-more-items");
  Menu.addOption("delete", "Delete Item", function (target) {
    Pubsub.publish("menuDelete", target);
  });
  Menu.addOption("edit", "Edit Item", function (target) {
    Pubsub.publish("menuEdit", target);
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
  Menu.addListenedItems(addButton, ["createShortcut", "createFolder"]);

  Pubsub.subscribe("menuDelete", function (target) {
    var targetId = Grid.remove(target);
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
      Pubsub.publish(
        "addedShortcutToGrid",
        Grid.addShortcut(newTab.id, newTab.url, newTab.name, newTab.parentId)
      );
    });
  });

  Pubsub.subscribe("addedFolderToGrid", function (target) {
    Menu.addListenedItems(target, ["delete", "edit", "move"]);

    target.onmouseup = function (e) {
      if (!Grid.isDragging(target)) {
        Storage.setCurrentParent(target.getAttribute("data-id"));
        Grid.clear();
        Pubsub.publish("needGridLoad", null);
      }
    };
  });

  Pubsub.subscribe("needGridLoad", function (targets) {
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
  });

  Pubsub.subscribe("createFolder", function () {
    Modal.ShowFolderModal(function (data) {
      console.log(enteredData);
      var enteredData = data;
      var newTab = Storage.buildFolder(enteredData.name);
      Storage.addElements(newTab);
      Pubsub.publish(
        "addedFolderToGrid",
        Grid.addFolder(newTab.id, newTab.name, newTab.parentId)
      );
    });
  });

  return {
    init: function () {
      Storage.sync(function () {
        Pubsub.publish("needGridLoad");
      });
    },
  };
})();
