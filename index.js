import { Grid, buildAddButton, buildShortcut } from "./grid.js";
import { TabStorage, TabElement, folderType, shortcutType } from "./core.js";
import { ContextMenuHandler } from "./contextMenuHandler.js";
import {
  ModalWindowHandler,
  buildAddShortcutForm,
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

contextmenu.AddOption("delete", "Delete Item", function (target) {
  grid.removeItems(target);
  strge.removeElement(target.id);
  strge.saveElements();
});

var addButton = buildAddButton();
addButton.addEventListener("click", function () {
  modalwindow.InvokeModal(buildAddShortcutForm(), function (TabElementData) {
    var newTabElement = new TabElement(
      shortcutType,
      TabElementData["name"].value,
      TabElementData["url"].value,
      null
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
grid.addItems(addButton, { index: -1 });

strge.loadElements(function (items) {
  items.forEach(function (item) {
    console.log(item.id);
    contextmenu.addListenedItems(
      grid.addItems(buildShortcut(item.id, item.url, item.name)),
      ["delete"]
    );
  });
});
