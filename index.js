import { Grid, buildAddButton, buildShortcut, buildFolder } from "./grid.js";
import { TabStorage, TabElement, folderType, shortcutType } from "./core.js";
import { ContextMenuHandler } from "./contextMenuHandler.js";
import {
  ModalWindowHandler,
  buildAddShortcutForm,
  buildAddFolderForm,
} from "./modalWindowHandler.js";
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];
    console.log(
      'Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue
    );
  }
});
let strge = new TabStorage();
var grid = new Grid();
var modalwindow = new ModalWindowHandler();
var contextmenu = new ContextMenuHandler();
var dir = null;
import {} from "./node_modules/muuri/dist/muuri.js";

contextmenu.AddOption("delete", "Delete Item", function (target) {
  grid.removeItems(target);
  strge.removeElement(target.id);
  strge.saveElements();
});

contextmenu.AddOption("createShortcut", "Add shortcut", function () {
  modalwindow.InvokeModal(buildAddShortcutForm(), function (TabElementData) {
    var newTabElement = new TabElement(
      shortcutType,
      TabElementData["name"].value,
      TabElementData["url"].value,
      dir
    );
    strge.addElements(newTabElement);
    var item = buildShortcut(
      newTabElement.id,
      newTabElement.url,
      newTabElement.name
    );
    var gridItems = grid.addItems(item);
    console.log(gridItems);
    contextmenu.addListenedItems(gridItems, ["delete"]);
    strge.saveElements();
  });
});

contextmenu.AddOption("createFolder", "Add folder", function () {
  modalwindow.InvokeModal(buildAddFolderForm(), function (TabElementData) {
    var newTabElement = new TabElement(
      folderType,
      TabElementData["name"].value,
      dir
    );
    strge.addElements(newTabElement);
    var item = buildFolder(newTabElement.id, newTabElement.name);
    item.addEventListener("click", function (e) {
      if (grid.getItem(item).isRealising()) e.stopPropagation();
      dir = item.id;
      var addButton = grid.getItemById("AddElement");
      grid.clear();
      var tabs = strge.getElementsByParentId(dir);
      tabs.forEach(function (item) {
        console.log(item.id);
        contextmenu.addListenedItems(
          grid.addItems(buildFolder(item.id, item.name)),
          ["delete"]
        );
      });
      grid.addItems(addButton);
    });
    var gridItems = grid.addItems(item);
    console.log(gridItems);
    contextmenu.addListenedItems(gridItems, ["delete"]);
    strge.saveElements();
  });
});

var addButton = buildAddButton();
addButton.addEventListener("click", function () {
  modalwindow.InvokeModal(buildAddShortcutForm(), function (TabElementData) {
    var newTabElement = new TabElement(
      shortcutType,
      TabElementData["name"].value,
      TabElementData["url"].value,
      dir
    );
    strge.addElements(newTabElement);
    var item = buildShortcut(
      newTabElement.id,
      newTabElement.url,
      newTabElement.name
    );
    var gridItems = grid.addItems(item);
    console.log(gridItems);
    contextmenu.addListenedItems(gridItems, ["delete"]);
    strge.saveElements();
  });
});
contextmenu.addListenedItems(grid.addItems(addButton, { index: -1 }), [
  "createFolder",
  "createShortcut",
]);

strge.loadElements(function (items) {
  items.forEach(function (item) {
    console.log(item.id);
    var newItem;
    if (item.type == folderType) {
      newItem = buildFolder(item.id, item.name);
      newItem.addEventListener("click", function (e) {
        if (grid.getItem(item).isRealising()) e.stopPropagation();
        dir = newItem.id;
        var addButton = grid.getItemById("AddElement");
        grid.clear();
        var tabs = strge.getElementsByParentId(dir);
        tabs.forEach(function (item) {
          console.log(newItem.id);
          contextmenu.addListenedItems(grid.addItems(newItem), ["delete"]);
        });
        grid.addItems(addButton);
      });
    }
    if (item.type == shortcutType)
      newItem = buildShortcut(item.id, item.url, item.name);
    contextmenu.addListenedItems(grid.addItems(newItem), ["delete"]);
  });
});
