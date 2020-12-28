export var Modal = (function () {
  var blur = document.querySelector(".blur");
  var modal = document.querySelector(".modal");
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

  function buildShortcutForm(name, url, edit) {
    var f = document.createElement("form");
    var title = document.createElement("h1");
    title.className = "title-modal";
    var inname = document.createElement("input");
    inname.setAttribute("type", "text");
    inname.setAttribute("name", "name");
    inname.setAttribute("class", "input-modal");
    inname.maxLength = 60;
    if (name) inname.value = name;
    var namelabel = document.createElement("label");

    namelabel.htmlFor = "name";
    namelabel.innerHTML = "Shortcut name";

    var inurl = document.createElement("input");
    inurl.setAttribute("type", "text");
    inurl.setAttribute("name", "url");
    inurl.setAttribute("class", "input-modal");
    inurl.oninput = function (e) {};
    if (url) inurl.value = url;
    var urllabel = document.createElement("label");

    urllabel.htmlFor = "url";
    urllabel.innerHTML = "Shortcut URL";
    var s = document.createElement("button");
    s.setAttribute("type", "submit");
    s.setAttribute("class", "button-modal");

    if (!edit) {
      title.textContent = "Add New Shortcut";
      s.innerHTML = "Create Shortcut";
    } else {
      title.textContent = "Edit Shortcut";
      s.innerHTML = "Ok";
    }
    var namewrapper = document.createElement("div");
    namewrapper.appendChild(namelabel);
    namewrapper.appendChild(inname);
    var urlwrapper = document.createElement("div");
    urlwrapper.appendChild(urllabel);
    urlwrapper.appendChild(inurl);
    f.appendChild(title);
    f.appendChild(namewrapper);

    f.appendChild(document.createElement("br"));
    f.appendChild(urlwrapper);
    f.appendChild(document.createElement("br"));
    f.appendChild(s);
    return f;
  }

  function buildFolderForm(name) {
    var f = document.createElement("form");
    var title = document.createElement("h1");
    title.textContent = "Add new folder";
    title.className = "title-modal";
    var inname = document.createElement("input");
    inname.setAttribute("type", "text");
    inname.setAttribute("name", "name");
    inname.setAttribute("class", "input-modal");
    inname.maxLength = 60;
    if (name) inname.value = name;
    var namelabel = document.createElement("label");

    namelabel.htmlFor = "name";
    namelabel.innerHTML = "Folder name";
    var s = document.createElement("button");
    s.setAttribute("type", "submit");
    s.setAttribute("class", "button-modal");
    s.innerHTML = "Create folder";
    var namewrapper = document.createElement("div");
    namewrapper.appendChild(namelabel);
    namewrapper.appendChild(inname);
    f.appendChild(title);
    f.appendChild(namewrapper);

    f.appendChild(document.createElement("br"));
    f.appendChild(s);
    return f;
  }

  return {
    ShowShortcutModal: function (callback, name, url, edit) {
      var form = buildShortcutForm(name, url, edit);
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
