import { Main } from "./main.js";
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
document.addEventListener("DOMContentLoaded", function () {
  Main.init();
});
//import { tingle } from "./node_modules/tingle.js/dist/tingle.min.js";

/*document.addEventListener("DOMContentLoaded", function () {
  const dragContainer = document.querySelector(".drag-container");
  const gridElement = document.querySelector(".grid");
  const filterField = document.querySelector(
    ".grid-control-field.filter-field"
  );
  const searchField = document.querySelector(
    ".grid-control-field.search-field"
  );
  const sortField = document.querySelector(".grid-control-field.sort-field");
  const layoutField = document.querySelector(
    ".grid-control-field.layout-field"
  );
  const addButton = document.querySelector(".grid-button.add-more-items");
  const itemTemplate = document.querySelector(".grid-item-template");
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const colors = ["red", "blue", "green"];
  const modal = new tingle.modal({
    footer: true,
    stickyFooter: false,
    closeMethods: ["overlay", "button", "escape"],
    closeLabel: "Close",
    cssClass: ["modal"],
    onOpen: function () {
      console.log("modal open");
    },
    onClose: function () {
      console.log("modal closed");
    },
    beforeClose: function () {
      // here's goes some logic
      // e.g. save content before closing the modal
      return true; // close the modal
      return false; // nothing happens
    },
  });

  // add a button
  modal.addFooterBtn("Create shortcut", "input_modal", function () {
    // here goes some logic
    modal.close();
  });

  // add another button
  modal.addFooterBtn("Cancel", "input_modal tingle-btn--danger", function () {
    // here goes some logic
    modal.close();
  });
  let dragOrder = [];
  let sortFieldValue;
  let searchFieldValue;

  //
  // GRID
  //

  const grid = new Muuri(gridElement, {
    items: createItemElements(1),
    showDuration: 400,
    showEasing: "ease",
    hideDuration: 400,
    hideEasing: "ease",
    layoutDuration: 400,
    layoutEasing: "cubic-bezier(0.625, 0.225, 0.100, 0.890)",
    sortData: {
      title(item, element) {
        return element.getAttribute("data-title") || "";
      },
      color(item, element) {
        return element.getAttribute("data-color") || "";
      },
    },
    dragEnabled: true,
    dragHandle: null,
    dragContainer: dragContainer,
    dragRelease: {
      duration: 400,
      easing: "cubic-bezier(0.625, 0.225, 0.100, 0.890)",
      useDragContainer: true,
    },
    dragPlaceholder: {
      enabled: true,
      createElement(item) {
        return item.getElement().cloneNode(true);
      },
    },
    dragAutoScroll: {
      targets: [window],
      sortDuringScroll: false,
      syncAfterScroll: false,
    },
  });

  window.grid = grid;

  //
  // Grid helper functions
  //

  function initDemo() {
    // Reset field values.
    searchField.value = "";
    [sortField, filterField, layoutField].forEach((field) => {
      field.value = field.querySelectorAll("option")[0].value;
    });

    // Set inital search query, active filter, active sort value and active layout.
    searchFieldValue = searchField.value.toLowerCase();
    sortFieldValue = sortField.value;

    updateDragState();

    // Search field binding.
    searchField.addEventListener("keyup", function () {
      var newSearch = searchField.value.toLowerCase();
      if (searchFieldValue !== newSearch) {
        searchFieldValue = newSearch;
        filter();
      }
    });

    // Filter, sort and layout bindings.
    filterField.addEventListener("change", filter);
    sortField.addEventListener("change", sort);
    layoutField.addEventListener("change", updateLayout);

    // Add/remove items bindings.
    addButton.addEventListener("click", addItems);
    gridElement.addEventListener("click", (e) => {
      if (e.target.matches(".grid-card-remove")) {
        removeItem(grid.getItem(e.target.closest(".grid-item")));
      }
    });
  }

  function filter(onFinish = null) {
    const filterFieldValue = filterField.value;
    grid.filter(
      (item) => {
        const element = item.getElement();
        const isSearchMatch =
          !searchFieldValue ||
          (element.getAttribute("data-title") || "")
            .toLowerCase()
            .indexOf(searchFieldValue) > -1;
        const isFilterMatch =
          !filterFieldValue ||
          filterFieldValue === element.getAttribute("data-color");
        return isSearchMatch && isFilterMatch;
      },
      { onFinish: onFinish }
    );
  }

  function sort() {
    var currentSort = sortField.value;
    if (sortFieldValue === currentSort) return;

    updateDragState();

    // If we are changing from "order" sorting to something else
    // let's store the drag order.
    if (sortFieldValue === "order") {
      dragOrder = grid.getItems();
    }

    // Sort the items.
    grid.sort(
      currentSort === "title"
        ? "title"
        : currentSort === "color"
        ? "color title"
        : dragOrder
    );

    // Update active sort value.
    sortFieldValue = currentSort;
  }

  let addEffectTimeout = null;

  function addItems() {
    addButton.classList.add("processing");
    var form = buildAddShortcutForm();
    modal.setContent(form);
    modal.open();
    modal.opts.onClose = function () {
      console.log(form.elements[0].value);
      console.log(form.elements[1].value);
      const item = grid.add(
        createItemElement(form.elements[0].value, form.elements[1].value),
        {
          layout: false,
          active: false,
        }
      );

      if (sortFieldValue !== "order") {
        grid.sort(sortFieldValue === "title" ? "title" : "color title", {
          layout: false,
        });
        dragOrder = dragOrder.concat(item);
      }

      filter();

      if (addEffectTimeout) clearTimeout(addEffectTimeout);
      addEffectTimeout = setTimeout(() => {
        addEffectTimeout = null;
        addButton.classList.remove("processing");
      }, 250);
    };
  }

  function removeItem(item) {
    if (!item) return;

    grid.hide([item], {
      onFinish: () => {
        grid.remove(item, { removeElements: true });
        if (sortFieldValue !== "order") {
          const itemIndex = dragOrder.indexOf(item);
          if (itemIndex > -1) dragOrder.splice(itemIndex, 1);
        }
      },
    });
  }

  function updateLayout() {
    const { layout } = grid._settings;
    const val = layoutField.value;
    layout.alignRight = val.indexOf("right") > -1;
    layout.alignBottom = val.indexOf("bottom") > -1;
    layout.fillGaps = val.indexOf("fillgaps") > -1;
    grid.layout();
  }

  function updateDragState() {
    if (sortField.value === "order") {
      gridElement.classList.add("drag-enabled");
    } else {
      gridElement.classList.remove("drag-enabled");
    }
  }

  //
  // Generic helper functions
  //

  function createItemElements(amount) {
    const elements = [];
    for (let i = 0; i < amount; i++) {
      elements.push(createItemElement());
    }
    return elements;
  }

  function createItemElement(name, url) {
    const title = name;
    const color = getRandomItem(colors);
    const width = 2; //getRandomInt(1, 2);
    const height = 2; //getRandomInt(1, 2);
    const itemElem = document.importNode(
      itemTemplate.content.children[0],
      true
    );

    itemElem.classList.add("h" + height, "w" + width, color);
    itemElem.setAttribute("data-color", color);
    itemElem.setAttribute("data-title", title);
    itemElem.querySelector(".grid-card-title").innerHTML = title;
    itemElem.href = url;

    return itemElem;
  }

  function getRandomItem(collection) {
    return collection[Math.floor(Math.random() * collection.length)];
  }

  // https://stackoverflow.com/a/7228322
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function getRandomWord(length) {
    var ret = "";
    for (var i = 0; i < length; i++) {
      ret += getRandomItem(characters);
    }
    return ret;
  }

  //
  // Fire it up!
  //

  initDemo();
});
*/
