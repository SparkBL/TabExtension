export class ModalWindowHandler {
  _blur;
  _content;
  constructor() {
    this._blur = document.body.appendChild(document.createElement("div"));
    this._blur.id = "blur";
    var modal = this._blur.appendChild(document.createElement("div"));
    modal.setAttribute("class", "modal");
    var span = document.createElement("span");
    span.className = "close";
    span.innerHTML = "&times;";
    modal.appendChild(span);
    this._content = modal.appendChild(document.createElement("div"));
    this._content.id = "modalContent";

    span.onclick = function () {
      this._blur.style.display = "none";
      this._content.innerHTML = "";
    }.bind(this);
    window.onclick = function (event) {
      if (event.target == modal) {
        this._blur.style.display = "none";
        this._content.innerHTML = "";
      }
    }.bind(this);
  }

  InvokeModal(formContent, submitAction) {
    this._blur.style.display = "block";
    this._content.appendChild(formContent);

    this._content.appendChild(formContent);
    if (submitAction)
      formContent.addEventListener(
        "submit",
        function (event) {
          event.preventDefault();
          submitAction(formContent.elements);
          this._blur.style.display = "none";
          this._content.innerHTML = "";
        }.bind(this)
      );
  }
}

export function buildAddShortcutForm() {
  var f = document.createElement("form");
  f.setAttribute("method", "post");
  var title = document.createElement("h1");
  title.textContent = "Add new shortcut";
  var inname = document.createElement("input");
  inname.setAttribute("type", "text");
  inname.setAttribute("name", "name");
  inname.setAttribute("class", "input_modal");
  var namelabel = document.createElement("label");

  namelabel.htmlFor = "name";
  namelabel.innerHTML = "Shortcut name";

  var inurl = document.createElement("input");
  inurl.setAttribute("type", "text");
  inurl.setAttribute("name", "url");
  inurl.setAttribute("class", "input_modal");
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

export function buildAddFolderForm() {
  var f = document.createElement("form");
  f.setAttribute("method", "post");
  var title = document.createElement("h1");
  title.textContent = "Add new folder";
  var inname = document.createElement("input");
  inname.setAttribute("type", "text");
  inname.setAttribute("name", "name");
  inname.setAttribute("class", "input_modal");
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
