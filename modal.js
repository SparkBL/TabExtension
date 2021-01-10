export var Modal = (function () {
  var blur = document.querySelector(".blur");
  var modal = document.querySelector(".modal");
  var body = document.querySelector(".modal-body");
  var close = document.querySelector(".close");
  var autocompletionUrls;
  const templateContainer = document.getElementById("template");
  chrome.history.search({ text: "", maxResults: 100 }, function (data) {
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
      inp.value = inp.value.replace(/\s/g, "");
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
      x[currentFocus].scrollIntoView({ block: "nearest", behavior: "auto" });
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

  function buildShortcutForm(name, url, viewType, edit) {
    var f = document.createElement("form");
    var title = document.createElement("h1");
    title.className = "title-modal";
    var inname = document.createElement("input");
    inname.setAttribute("type", "text");
    inname.setAttribute("name", "name");
    inname.setAttribute("class", "input-modal");
    inname.autocomplete = "off";
    inname.maxLength = 48;
    // inname.placeholder = "Shortcut Name";
    if (name) inname.value = name;
    var namelabel = document.createElement("label");

    namelabel.htmlFor = "name";
    namelabel.innerHTML = "Shortcut name";

    var inurl = document.createElement("input");
    inurl.autocomplete = "off";
    autocomplete(inurl, autocompletionUrls);
    inurl.setAttribute("type", "text");
    inurl.setAttribute("name", "url");
    /*inurl.min="1";
    inurl.setCustomValidity("Please, specify URL for shortcut");
  */
    inurl.setAttribute("class", "input-modal");
    inurl.required = true;
    //inurl.defaultValue = "https://";
    if (url) inurl.value = url;
    var urllabel = document.createElement("label");

    urllabel.htmlFor = "url";
    urllabel.innerHTML = "Shortcut URL";

    var viewTypeSelect = document.createElement("select");
    viewTypeSelect.size = 2;
    var a = document.createElement("option");
    a.text = "Icon";
    a.value = "icon";
    var b = document.createElement("option");
    b.text = "Thumbnail";
    b.value = "thumbnail";
    viewTypeSelect.appendChild(a);
    viewTypeSelect.appendChild(b);
    if (viewType) viewTypeSelect.value = viewType;
    else viewTypeSelect.value = "icon";
    viewTypeSelect.name = "viewType";

    var viewTypeLabel = document.createElement("label");

    viewTypeLabel.htmlFor = "viewType";
    viewTypeLabel.innerHTML = "Display type";

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
    namewrapper.className = "modal-item";
    namewrapper.appendChild(namelabel);
    namewrapper.appendChild(inname);
    var urlwrapper = document.createElement("div");
    urlwrapper.className = "modal-item";
    urlwrapper.appendChild(urllabel);
    urlwrapper.appendChild(inurl);
    var viewTypeWrapper = document.createElement("div");
    viewTypeWrapper.className = "modal-item";
    viewTypeWrapper.appendChild(viewTypeLabel);
    viewTypeWrapper.appendChild(viewTypeSelect);
    f.appendChild(title);
    f.appendChild(namewrapper);
    f.appendChild(document.createElement("br"));
    f.appendChild(urlwrapper);
    f.appendChild(document.createElement("br"));
    f.appendChild(viewTypeWrapper);
    f.appendChild(s);
    inname.autofocus = true;
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
    // inname.placeholder = "Folder Name";
    inname.maxLength = 48;
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
    namewrapper.className = "modal-item";
    namewrapper.appendChild(namelabel);
    namewrapper.appendChild(inname);
    f.appendChild(title);
    f.appendChild(namewrapper);
    f.appendChild(document.createElement("br"));
    f.appendChild(s);
    inname.autofocus = true;
    return f;
  }

  function buildMoveForm(items, parent) {
    var f = document.createElement("form");
    var title = document.createElement("h1");
    title.className = "title-modal";
    title.textContent = "Move element";
    var selection = document.createElement("ul");
    selection.className = "hierarchy";
    selection.name = "dists";
    function iterateOverChildren(itemsCh, nest) {
      itemsCh.forEach(function (item) {
        var li = document.createElement("li");
        var d = document.createElement("div");
        d.innerHTML = item.name;
        d.setAttribute("data-id", item.id);
        li.appendChild(d);
        nest.appendChild(li);
        if (item.children.length != 0) {
          var spanCaret = document.createElement("span");
          spanCaret.className = "caret";
          spanCaret.addEventListener("click", function () {
            this.parentElement.parentElement
              .querySelector(".nested")
              .classList.toggle("active");
            this.classList.toggle("caret-down");
          });
          d.prepend(spanCaret);
          var ul = document.createElement("ul");
          ul.data;
          ul.className = "nested";
          li.appendChild(ul);
          iterateOverChildren(item.children, ul);
        }
      });
    }
    iterateOverChildren(items, selection);

    var label = document.createElement("label");
    label.innerHTML = "Select destination folder:";
    label.setAttribute("for", selection.name);

    var s = document.createElement("button");
    s.setAttribute("type", "submit");
    s.setAttribute("class", "button-modal");

    s.innerHTML = "Move";
    s.disabled = true;
    selection
      .querySelector("[data-id=" + parent + "]")
      .classList.add("current");
    selection.addEventListener("click", function (e) {
      var divs = selection.querySelectorAll("div");
      divs.forEach(function (item) {
        item.classList.remove("active");
      });
      if (
        e.target.closest("div").getAttribute("data-id") &&
        e.target.closest("div").getAttribute("data-id") != parent
      ) {
        f.setAttribute(
          "data-active",
          e.target.closest("div").getAttribute("data-id")
        );
        e.target.closest("div").classList.add("active");
        s.disabled = false;
      } else s.disabled = true;
    });

    f.appendChild(title);
    f.appendChild(label);
    f.appendChild(selection);
    f.appendChild(document.createElement("br"));
    f.appendChild(s);
    return f;
  }

  function buildSettingsForm(settings) {
    var f = document.createElement("form");
    var title = document.createElement("h1");
    title.className = "title-modal";
    title.textContent = "Settings";
    f.appendChild(title);
    f.appendChild(
      document.importNode(templateContainer.content.children[1], true)
    );
    var minusButton = f.querySelector("#minus");
    var plusButton = f.querySelector("#plus");
    var dayInput = f.querySelector("#refreshRate");
    f.querySelector("#topSites").checked = settings.topSites;
    f.querySelector("#newTab").checked = settings.tabOpenMode;
    dayInput.value = settings.refreshRate;

    var timeout, interval;
    function clearTimers() {
      clearTimeout(timeout);
      clearInterval(interval);
    }
    plusButton.addEventListener("mousedown", function () {
      if (dayInput.value < 99) dayInput.value++;
      timeout = setTimeout(function () {
        interval = setInterval(function () {
          if (dayInput.value < 99) dayInput.value++;
        }, 100);
      }, 300);
    });
    plusButton.addEventListener("mouseup", clearTimers);
    plusButton.addEventListener("mouseleave", clearTimers);
    minusButton.addEventListener("mousedown", function () {
      if (dayInput.value > 1) dayInput.value--;
      timeout = setTimeout(function () {
        interval = setInterval(function () {
          if (dayInput.value > 1) dayInput.value--;
        }, 100);
      }, 300);
    });
    minusButton.addEventListener("mouseup", clearTimers);
    minusButton.addEventListener("mouseleave", clearTimers);
    var s = document.createElement("button");
    s.setAttribute("type", "submit");
    s.setAttribute("class", "button-modal");

    s.innerHTML = "Save";
    f.appendChild(s);
    return f;
  }

  return {
    ShowShortcutModal: function (callback, name, url, viewType, edit) {
      var form = buildShortcutForm(name, url, viewType, edit);
      body.appendChild(form);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (callback && typeof callback == "function") {
          var enteredData = {
            name: form.elements.namedItem("name").value,
            url: form.elements.namedItem("url").value,
            viewType: form.elements.namedItem("viewType").value,
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
    ShowMoveModal: function (callback, items, parentId) {
      var form = buildMoveForm(items, parentId);
      body.appendChild(form);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (callback && typeof callback == "function") {
          var enteredData = {
            newParentId: form.getAttribute("data-active"),
          };
          console.log("calling callback");
          callback(enteredData);
          hideModal();
        }
      });
      showModal();
    },
    ShowSettingsModal: function (callback, settings) {
      var form = buildSettingsForm(settings);
      body.appendChild(form);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (callback && typeof callback == "function") {
          var enteredData = {
            topSites: form.querySelector("#topSites").checked,
            tabOpenMode: form.querySelector("#newTab").checked,
            refreshRate: form.querySelector("#refreshRate").value,
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
