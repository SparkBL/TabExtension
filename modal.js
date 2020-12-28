export var Modal = (function () {
  var blur = document.querySelector(".blur");
  var modal = document.querySelector(".modal");
  var body = document.querySelector(".modal-body");
  var close = document.querySelector(".close");
  var autocompletionUrls;
  chrome.history.search({ text: "", maxResults: 50 }, function (data) {
    var urls = [];
    data.forEach(function (page) {
      urls.push(page.url);
    });
    autocompletionUrls = urls;
  });
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

  function autocomplete(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", mainLoop);
    inp.addEventListener("focus", mainLoop);
    function mainLoop() {
      var box,
        b,
        i,
        val = this.value;
      closeAllLists();
      if (!val) {
        return false;
      }
      currentFocus = -1;
      box = document.createElement("DIV");
      box.setAttribute("id", this.id + "autocomplete-list");
      box.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(box);
      for (i = 0; i < arr.length; i++) {
        if (arr[i].toUpperCase().includes(val.toUpperCase())) {
          b = document.createElement("DIV");
          var reg = new RegExp(val, "i");
          var inclusions = arr[i].split(reg);
          b.innerHTML = inclusions[0];
          for (var j = 1; j < inclusions.length; j++) {
            b.innerHTML += "<strong>" + val + "</strong>" + inclusions[j];
          }
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          b.addEventListener("click", function (e) {
            inp.value = this.getElementsByTagName("input")[0].value;
            closeAllLists();
          });
          box.appendChild(b);
        }
      }
    }
    inp.addEventListener("keydown", function (e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) {
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = x.length - 1;
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    document.addEventListener("click", function (e) {
      closeAllLists(e.target);
    });
  }

  function buildShortcutForm(name, url, edit) {
    var f = document.createElement("form");
    var title = document.createElement("h1");
    title.className = "title-modal";
    var inname = document.createElement("input");
    inname.setAttribute("type", "text");
    inname.setAttribute("name", "name");
    inname.setAttribute("class", "input-modal");
    inname.autocomplete = "off";
    inname.maxLength = 60;
    if (name) inname.value = name;
    var namelabel = document.createElement("label");

    namelabel.htmlFor = "name";
    namelabel.innerHTML = "Shortcut name";

    var inurl = document.createElement("input");
    inurl.autocomplete = "off";
    autocomplete(inurl, autocompletionUrls);
    inurl.setAttribute("type", "text");
    inurl.setAttribute("name", "url");
    inurl.setAttribute("class", "input-modal");
    inurl.defaultValue = "https://";
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

  function buildFolderForm(name, edit) {
    var f = document.createElement("form");
    var title = document.createElement("h1");
    title.className = "title-modal";
    var inname = document.createElement("input");
    inname.setAttribute("type", "text");
    inname.setAttribute("name", "name");
    inname.setAttribute("class", "input-modal");
    inname.autocomplete = "off";
    inname.maxLength = 60;
    if (name) inname.value = name;
    var namelabel = document.createElement("label");

    namelabel.htmlFor = "name";
    namelabel.innerHTML = "Folder name";
    var s = document.createElement("button");
    s.setAttribute("type", "submit");
    s.setAttribute("class", "button-modal");
    if (!edit) {
      title.textContent = "Add New Folder";
      s.innerHTML = "Create Folder";
    } else {
      title.textContent = "Edit Folder";
      s.innerHTML = "Ok";
    }

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

    ShowFolderModal: function (callback, name, edit) {
      var form = buildFolderForm(name, edit);
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
