export var Storage = (function () {
  var currentElements = [];
  var currentParent = "root";
  function commit() {
    chrome.storage.sync.set({ storageElements: currentElements }, function () {
      console.log("Saved elements in storage: ", currentElements);
    });
  }

  function generateId() {
    return "id" + Math.random().toString(16).slice(2);
  }

  return {
    addElements: function (elements) {
      var elements = [].concat(elements || []);
      currentElements = currentElements.concat(elements);
      commit();
      return elements;
    },
    //!!! async !!!///
    sync: function (callback) {
      chrome.storage.sync.get("storageElements", function (result) {
        // alert(JSON.stringify(result));
        if (result.storageElements) currentElements = result.storageElements;
        if (!currentElements)
          console.log("Failed to get elements from storage!");
        console.log("Synced elements with storage: \n", result.storageElements);
        if (callback && typeof callback == "function")
          callback(currentElements);
      });
    },
    //!!! async !!!///

    getElements: function () {
      return currentElements;
    },

    getElementsByParentId: function (parentId) {
      return currentElements.filter((x) => x.parentId === parentId);
    },

    setCurrentParent: function (parentId) {
      currentParent = parentId;
    },
    getCurrentChildren: function () {
      return currentElements.filter((x) => x.parentId === currentParent);
    },

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

    removeElement: function (id) {
      var toRemove = currentElements.find((x) => x.id == id);
      var toRemoveIndex = currentElements.findIndex((x) => x.id == id);
      currentElements.splice(toRemoveIndex, 1);
      var children = this.getElementsByParentId(toRemove.id);
      if (children && children.length > 0)
        for (var i = 0; i < children.length; i++)
          this.removeElement(children[i].id);

      commit();
    },
    buildFolder: function (name) {
      return {
        id: generateId(),
        parentId: currentParent,
        name: name,
        type: "folder",
      };
    },
    buildShortcut: function (name, url) {
      return {
        id: generateId(),
        parentId: currentParent,
        name: name,
        url: url,
        type: "shortcut",
      };
    },
  };
})();
