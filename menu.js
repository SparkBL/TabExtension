export var Menu = (function () {
  var menu;
  var outClick;
  var nowSelected;
  var options = [];
  var allowedOptions = {};

  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  menu = document.body.appendChild(document.createElement("ul"));
  menu.id = "menu";
  outClick = document.body.appendChild(document.createElement("div"));
  outClick.id = "outClick";

  outClick.addEventListener("click", (e) => {
    menu.classList.remove("show");
    outClick.style.display = "none";
    options.forEach(function (elem) {
      elem.style.display = "none";
      nowSelected = null;
    });
  });

  window.addEventListener("click", () => {
    menu.classList.remove("show");
    outClick.style.display = "none";
    options.forEach(function (elem) {
      elem.style.display = "none";
      nowSelected = null;
    });
  });

  return {
    addOption: function (id, name, action) {
      var newOption = document.createElement("li");
      newOption.setAttribute("class", "menu-item");
      newOption.id = id;
      newOption.innerHTML = name;
      options.push(newOption);
      newOption.style.display = "none";

      newOption.addEventListener("click", function () {
        action(nowSelected);
      });
      menu.appendChild(newOption);
    },

    addListenedItems: function (items, opts) {
      var items = [].concat(items || []);

      items.forEach(function (elem) {
        var elemId = elem.getAttribute("data-id");
        allowedOptions[elemId] = opts;
        elem.addEventListener("contextmenu", function (e) {
          e.preventDefault();
          nowSelected = e.currentTarget;
          menu.style.top = `${e.clientY}px`;
          menu.style.left = `${e.clientX}px`;
          menu.classList.add("show");
          var storedOpts = allowedOptions[elemId];
          options.forEach(function (elem) {
            if (storedOpts.includes(elem.id)) elem.style.display = "block";
          });
          console.log(e.currentTarget.outerHTML);
          outClick.style.display = "block";
        });
      });
    },
  };
})();
