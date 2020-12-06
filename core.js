// Abstract element, storing tab info
export class TabElement {
  id;
  parentId;
  name;
  index = 0;
  type;
  static generateId() {
    return "id" + Math.random().toString(16).slice(2);
  }
  constructor(name, parentId) {
    this.id = TabElement.generateId();
    this.name = name;
    this.parentId = parentId;
  }

  setParent(id) {
    this.parentId = id;
  }
}
// Stores user defined info about tab
export class Shortcut extends TabElement {
  url;
  icon;
  constructor(name, url, icon) {
    super(name);
    this.url = url;
    this.type = "shortcut";
    this.icon = icon;
  }
}
//Aggregates TabElements
export class Folder extends TabElement {
  constructor(name) {
    super(name);
    this.type = "folder";
  }
}
//Provides storing TabElements in chrom storage and loading from it
export class TabStorage {
  elements = [];
  constructor() {}
  addElements(element) {
    var elements = [].concat(element || []);
    for (var i = 0; i < elements.length; i++)
      if (elements[i].type != "shortcut" && elements[i].type != "folder")
        console.log("Wrong element type on storage insertion!");
      else {
        this.elements.push(elements[i]);
      }
    return elements;
  }
  removeElement(id) {
    var toRemove = this.elements.findIndex((x) => x.id === id);
    this.elements.splice(toRemove, 1);
  }
  loadElements(callback) {
    chrome.storage.sync.get(
      "storageElements",
      function (result) {
        // alert(JSON.stringify(result));
        this.elements = result.storageElements;
        if (!this.elements) console.log("Failed to get elements from storage!");
        console.log("Load elements: \n", this.elements);
        callback(this.elements);
      }.bind(this)
    );
  }

  saveElements(callback) {
    chrome.storage.sync.set(
      { storageElements: this.elements },
      function () {
        console.log("Save elements: ", this.elements);
        if (callback) callback();
      }.bind(this)
    );
  }

  getElements() {
    console.log("Get elements: \n", this.elements);
    return this.elements;
  }

  editElement(id, action) {
    var element = this.elements.find((x) => x.id === id);
    action(element);
  }
}
