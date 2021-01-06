export var Storage = (function () {
  //Dir routing
  var currentElements = [];
  var currentLayouts = {};
  var currentParent = "root";
  var currentElementSize = 2;
  var currentViewType = "icon";

  //Commit change into chrome storage
  function commit() {
    chrome.storage.local.set(
      {
        storageElements: currentElements,
        storageLayouts: currentLayouts,
        elementSize: currentElementSize,
        viewType: currentViewType,
      },
      function () {
        console.log("Saved elements in storage: ", currentElements);
        console.log("Saved layouts in storage: ", currentLayouts);
        console.log("Saved element size in storage: ", currentElementSize);
        console.log("Saved view type in storage: ", currentViewType);
      }
    );
  }

  function list_to_tree(list) {
    var map = {}, node, roots = [], i;
    for (i = 0; i < list.length; i += 1) {
      map[list[i].id] = i; // initialize the map
      list[i].children = []; // initialize the children
    }
    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.parentId !== "root") {
        list[map[node.parentId]].children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  //Random string generator
  function generateId() {
    return "id" + Math.random().toString(16).slice(2);
  }

  function getChildren(parentId){
    return currentElements.filter((x) => x.parentId === parentId);
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
      chrome.storage.local.get(
        ["storageElements", "storageLayouts", "elementSize","viewType"],
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
          if (result.elementSize) {
            currentElementSize = result.elementSize;
            console.log(
              "Synced element size with storage: \n",
              result.elementSize
            );
          } else console.log("Failed to get layouts from storage!");
          if (result.viewType) {
            currentViewType = result.viewType;
            console.log(
              "Synced view type with storage: \n",
              result.viewType
            );
          } else console.log("Failed to get view type from storage!");
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
      return getChildren(currentParent);
    },

    //Get current parent tab element
    getCurrentParent: function () {
      var elem = currentElements.find((x) => x.id === currentParent);
      if (elem) return elem;
      else return { id:"root" ,name: "Home page" };
    },

    //Replaces editing element with one, which was returned from callback function. Commit immediately.
    editElement: function (id, callback) {
      var toEdit = currentElements.find((x) => x.id === id);
      console.log(typeof callback(toEdit));
      if (callback) {
        currentElements.splice(
          currentElements.findIndex((x) => x.id === id),
          1
        );
        currentElements.push(callback(toEdit));
        commit();
      }
    },

    //Remove element from storage recursively. Commit immediately.
    removeElement: function (id) {
      var toRemove = currentElements.find((x) => x.id === id);
      var toRemoveIndex = currentElements.findIndex((x) => x.id === id);
      currentElements.splice(toRemoveIndex, 1);
      var toRemoveLayoutIndex = currentLayouts[currentParent].findIndex(
        (x) => x === id
      );
      currentLayouts[currentParent].splice(toRemoveLayoutIndex, 1);
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

    getCurrentElementSize: function () {
      return currentElementSize;
    },
    setElementSize: function (sizeFactor) {
      currentElementSize = sizeFactor;
      commit();
    },
    getCurrentViewType: function () {
      return currentViewType;
    },
    setViewType: function (type) {
    if (type === "icon" || type === "thumbnail")
    {
      currentViewType = type;
      commit();
    }
    },
    buildHierarchy: function(exceptions){
      var except = currentElements.filter(x=> [].concat(exceptions || []).includes(x.id));
      var store = [];
      function iterate(es){
        es.forEach(element => {
          store.push(element.id);
          iterate(getChildren(element.id));
        });
      }
      iterate(except);
      var folders = currentElements.filter(x => x.type === "folder" && !store.includes(x.id)) ;
      var tree = list_to_tree(folders);
      tree = [{name:"Home page",id:"root",children:tree}];
      return tree;
      
    }
  };
})();




