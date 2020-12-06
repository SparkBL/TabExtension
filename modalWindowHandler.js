export class ModalWindowHandler {
  blur = document.getElementById("blur");
  content = document.getElementById("modalContent");
  constructor() {
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function () {
      this.blur.style.display = "none";
      this.content.innerHTML = "";
    }.bind(this);
    window.onclick = function (event) {
      if (event.target == this.modal) {
        this.blur.style.display = "none";
        this.content.innerHTML = "";
      }
    }.bind(this);
  }

  showAddModal(action) {
    this.blur.style.display = "block";
    this.content.innerHTML = "<h1>Add new tab element</h1>";
    var f = document.createElement("form");
    f.setAttribute("method", "post");

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
    s.innerHTML = "Create";
    f.appendChild(namelabel);
    f.appendChild(inname);
    f.appendChild(document.createElement("br"));
    f.appendChild(urllabel);
    f.appendChild(inurl);
    f.appendChild(document.createElement("br"));
    f.appendChild(s);
    this.content.appendChild(f);

    f.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        action(f.elements);
        this.blur.style.display = "none";
        this.content.innerHTML = "";
      }.bind(this)
    );
  }
}
