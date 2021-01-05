import { Storage } from "./core.js";
import { Grid } from "./grid.js";
import { Modal } from "./modal.js";
import { Menu } from "./menu.js";
import { Pubsub } from "./pubsub.js";
import {ThumbFetcher} from "./thumbfetcher.js"
export var Main = (function () {
  const path = document.querySelector(".path-title");
  const addButton = document.querySelector(".grid-button.add-more-items");
  const backButton = document.getElementById("backButton");
  const sizeSelector = document.querySelector("#sizeSelector");
  const viewSelector = document.querySelector("#viewSelector");
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

  sizeSelector.addEventListener("change", function (ev) {
    Storage.setElementSize(sizeSelector.value);
    Pubsub.publish("needGridLoad", true);
  });

  viewSelector.addEventListener("change", function (ev) {
    Storage.setViewType(viewSelector.value);
    Pubsub.publish("needGridLoad", true);
  });

  Pubsub.subscribe("delete", function (target) {
    var targetId = Grid.remove(target);
    Storage.saveGridLayout(Grid.getLayout());
    Storage.removeElement(targetId);
    ThumbFetcher.removeThumbnail(targetId);
  });

  Pubsub.subscribe("menuMove", function (target) {});

  Pubsub.subscribe("editShortcut", function (target) {
    Modal.ShowShortcutModal(
      function (enteredData) {
        var el;
        Storage.editElement(target.getAttribute("data-id"), function (element) {
          element.name = enteredData["name"];
          element.url = enteredData["url"];
          el = element;
          return element;
        });
        Grid.editShortcut(el.id, el.url, el.name, el.parentId);
      },
      target.getAttribute("data-name"),
      target.getAttribute("data-url"),
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
    Menu.addListenedItems(target, ["delete", "editShortcut", "move"]);
  });

  Pubsub.subscribe("addedFolderToGrid", function (target) {
    Menu.addListenedItems(target, ["delete", "editFolder", "move"]);

    target.onclick = function (e) {
      if (!Grid.isDragging(target) && e.button != 2) {
        Storage.setCurrentParentId(target.getAttribute("data-id"));
        Pubsub.publish("needGridLoad", null);
      }
    };
  });

  Pubsub.subscribe("createShortcut", function () {
    Modal.ShowShortcutModal(function (data) {
      console.log(enteredData);
      var enteredData = data;
      var newTab = Storage.buildShortcut(enteredData.name, enteredData.url);
      Storage.addElements(newTab);

      var newItem = Grid.addShortcut(
        newTab.id,
        newTab.url,
        newTab.name,
        newTab.parentId
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
    Grid.clear(instantRemove);
    var dirContent = Storage.getCurrentChildren();
    Grid.setItemSize(Storage.getCurrentElementSize());
    Grid.setViewType(Storage.getCurrentViewType());
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
    Grid.applyLayout(Storage.getCurrentLayout());
    path.innerHTML = Storage.getCurrentParent().name;
  });

  Grid.onMove(function () {
    Storage.saveGridLayout(Grid.getLayout());
  });

  return {
    init: function () {
      Storage.sync(function () {
        ThumbFetcher.init(function(){
          Pubsub.publish("needGridLoad");
          sizeSelector.value = Storage.getCurrentElementSize();
          viewSelector.value = Storage.getCurrentViewType();
        })
        
      });
    },
  };
})();
