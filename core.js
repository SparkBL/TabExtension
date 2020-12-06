export const folderType = "folder";
export const shortcutType = "shortcut"; // Abstract element, storing tab info
export class TabElement {
  id;
  parentId;
  name;
  index = 0;
  type;
  url;
  #generateId() {
    return "id" + Math.random().toString(16).slice(2);
  }

  constructor(type, name, url, parentId) {
    if (type === shortcutType) {
      this.id = this.#generateId();
      this.name = name;
      this.parentId = parentId;
      this.url = url;
      this.type = shortcutType;
    }
    if (type === folderType) {
      this.id = this.#generateId();
      this.name = name;
      this.parentId = parentId;
      this.url = null;
      this.type = folderType;
    }
  }

  /* get id() {
    return this.id;
  }

  get type() {
    return this.type;
  }*/
}

// Stores user defined info about tab

//Provides storing TabElements in chrom storage and loading from it
export class TabStorage {
  elements = [];
  constructor() {}
  addElements(element) {
    var elements = [].concat(element || []);
    this.elements = this.elements.concat(elements);
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
        console.log("Load elements: \n", result.storageElements);
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

  get elements() {
    return this.elements;
  }

  editElement(id, action) {
    var element = this.elements.find((x) => x.id === id);
    action(element);
  }
}
