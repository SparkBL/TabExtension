export var Modal = (function () {
  var blur = document.querySelector(".blur");
  var modal = document.querySelector(".modal");
  var header = document.querySelector(".modal-header");
  var footer = document.querySelector(".modal-footer");
  var body = document.querySelector(".modal-body");
  var close = document.querySelector(".close");
  function showModal() {
    blur.style.display = "block";
  }
  function hideModal() {
    blur.style.display = "none";
    body.innerHTML = "";
  }
  close.onclick = function () {
    hideModal();
  };
  window.onclick = function (event) {
    if (event.target == blur) hideModal();
  };

  function buildShortcutForm(name, url) {
    var f = document.createElement("form");
    // f.setAttribute("method", "post");
    var title = document.createElement("h1");
    title.textContent = "Add new shortcut";
    var inname = document.createElement("input");
    inname.setAttribute("type", "text");
    inname.setAttribute("name", "name");
    inname.setAttribute("class", "input_modal");
    if (name) inname.value = name;
    var namelabel = document.createElement("label");

    namelabel.htmlFor = "name";
    namelabel.innerHTML = "Shortcut name";

    var inurl = document.createElement("input");
    inurl.setAttribute("type", "text");
    inurl.setAttribute("name", "url");
    inurl.setAttribute("class", "input_modal");
    if (url) inurl.value = url;
    var urllabel = document.createElement("label");

    urllabel.htmlFor = "url";
    urllabel.innerHTML = "Shortcut URL";
    var s = document.createElement("button");
    s.setAttribute("type", "submit");
    s.setAttribute("class", "button_modal");
    s.innerHTML = "Create shortcut";
    f.appendChild(title);
    f.appendChild(namelabel);
    f.appendChild(inname);
    f.appendChild(document.createElement("br"));
    f.appendChild(urllabel);
    f.appendChild(inurl);
    f.appendChild(document.createElement("br"));
    f.appendChild(s);
    return f;
  }

  function buildFolderForm(name) {
    var f = document.createElement("form");
    // f.setAttribute("method", "post");
    var title = document.createElement("h1");
    title.textContent = "Add new folder";
    var inname = document.createElement("input");
    inname.setAttribute("type", "text");
    inname.setAttribute("name", "name");
    inname.setAttribute("class", "input_modal");
    if (name) inname.value = name;
    var namelabel = document.createElement("label");

    namelabel.htmlFor = "name";
    namelabel.innerHTML = "Folder name";
    var s = document.createElement("button");
    s.setAttribute("type", "submit");
    s.setAttribute("class", "button_modal");
    s.innerHTML = "Create folder";
    f.appendChild(title);
    f.appendChild(namelabel);
    f.appendChild(inname);
    f.appendChild(document.createElement("br"));
    f.appendChild(s);
    return f;
  }

  return {
    ShowShortcutModal: function (callback, name, url) {
      var form = buildShortcutForm(name, url);
      body.appendChild(form);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (callback && typeof callback == "function") {
          var enteredData = {
            name: form.elements.namedItem("name").value,
            url: form.elements.namedItem("url").value,
          };
          console.log("calling callback");
          callback(enteredData);
          hideModal();
        }
      });
      showModal();
    },

    ShowFolderModal: function (callback, name) {
      var form = buildFolderForm(name);
      body.appendChild(form);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (callback && typeof callback == "function") {
          var enteredData = {
            name: form.elements.namedItem("name").value,
          };
          console.log("calling callback");
          callback(enteredData);
          hideModal();
        }
      });
      showModal();
    },
  };
})();
