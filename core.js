export var Storage = (function () {
  //Dir routing
  var currentElements = [];
  var currentLayouts = {};
  var currentParent = "root";

  //Commit change into chrome storage
  function commit() {
    chrome.storage.sync.set(
      { storageElements: currentElements, storageLayouts: currentLayouts },
      function () {
        console.log("Saved elements in storage: ", currentElements);
        console.log("Saved layouts in storage: ", currentLayouts);
      }
    );
  }

  //Random string generator
  function generateId() {
    return "id" + Math.random().toString(16).slice(2);
  }

  return {
    //Add builded tabelement into currentStorage and commit immediately
    addElements: function (elements) {
      var elements = [].concat(elements || []);
      currentElements = currentElements.concat(elements);
      commit();
      return elements;
    },

    //Synchronize all objects from chrome storage to local one. ASYNC - needs callback
    sync: function (callback) {
      chrome.storage.sync.get(
        ["storageElements", "storageLayouts"],
        function (result) {
          if (result.storageElements) {
            currentElements = result.storageElements;
            console.log(
              "Synced elements with storage: \n",
              result.storageElements
            );
          } else console.log("Failed to get elements from storage!");
          if (result.storageLayouts) {
            currentLayouts = result.storageLayouts;
            console.log(
              "Synced layouts with storage: \n",
              result.storageLayouts
            );
          } else console.log("Failed to get layouts from storage!");

          if (callback && typeof callback == "function") callback();
        }
      );
    },

    //Return current local storage tab elements
    getElements: function () {
      return currentElements;
    },

    //Return all items with provided parentId
    getElementsByParentId: function (parentId) {
      return currentElements.filter((x) => x.parentId === parentId);
    },

    //Change current scope of elements
    setCurrentParentId: function (parentId) {
      currentParent = parentId;
    },

    //Change scope to one, that's higher in hierarchy
    setPreviousParent: function () {
      currentParent = currentElements.find((x) => x.id === currentParent)
        .parentId;
    },

    //Is current dir the root dir?
    isInRoot: function () {
      return currentParent === "root";
    },

    //Returns contents of current dir
    getCurrentChildren: function () {
      return currentElements.filter((x) => x.parentId === currentParent);
    },

    //Get current parent tab element
    getCurrentParent: function () {
      var elem = currentElements.find((x) => x.id === currentParent);
      if (elem) return elem;
      else return { name: "Home page" };
    },

    //Replaces editing element with one, which was returned from callback function. Commit immediately.
    editElement: function (id, callback) {
      var toEdit = currentElements.find((x) => x.id === id);
      if (
        action &&
        typeof action == "function" &&
        !typeof action(toEdit) === "undefined"
      ) {
        currentElements.splice(toEdit, 1);
        currentElements.push(callback(toEdit));
        commit();
        return true;
      }
      return false;
    },

    //Remove element from storage recursively. Commit immediately.
    removeElement: function (id) {
      var toRemove = currentElements.find((x) => x.id == id);
      var toRemoveIndex = currentElements.findIndex((x) => x.id == id);
      currentElements.splice(toRemoveIndex, 1);
      if (toRemove.type === "folder") delete currentLayouts[id];
      var children = this.getElementsByParentId(toRemove.id);
      if (children && children.length > 0)
        for (var i = 0; i < children.length; i++)
          this.removeElement(children[i].id);

      commit();
    },

    //Build folder object from name
    buildFolder: function (name) {
      return {
        id: generateId(),
        parentId: currentParent,
        name: name,
        type: "folder",
      };
    },

    //Build shortcut object from name and url
    buildShortcut: function (name, url) {
      return {
        id: generateId(),
        parentId: currentParent,
        name: name,
        url: url,
        type: "shortcut",
      };
    },

    //Store provided grid layout for current dir. Commit immediately.
    saveGridLayout: function (data) {
      currentLayouts[currentParent] = data;
      commit();
    },

    //Return grid layout for current dir
    getCurrentLayout: function () {
      return currentLayouts[currentParent];
    },
  };
})();
