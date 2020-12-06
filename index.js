import { Grid } from "./grid.js";
import { TabStorage, Shortcut } from "./core.js";
import { ContextMenuHandler } from "./contextMenuHandler.js";
import { ModalWindowHandler } from "./modalWindowHandler.js";
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

var grid = new Grid();
var contextmenu = new ContextMenuHandler();
var modalwindow = new ModalWindowHandler();
let strge = new TabStorage();
contextmenu.setOptions(function () {
  var id = grid.removeSelected();
  strge.removeElement(id);
  strge.saveElements();
});

grid.gridAddEvent(function (items) {
  contextmenu.addListenedItems(items, function (item) {
    grid.selectItem(item);
  });
});

grid.setAddButtonHandler(function () {
  modalwindow.showAddModal(function (newElementData) {
    var newElement = new Shortcut(
      newElementData["name"].value,
      newElementData["url"].value,
      ""
    );
    var item = grid.addItems(strge.addElements(newElement));
    console.log(item);
    strge.saveElements();
  });
});

strge.loadElements(function (items) {
  grid.addItems(items);
});
