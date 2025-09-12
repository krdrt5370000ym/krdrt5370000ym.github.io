function changeFontFamily() {
  var fontFamily = document.querySelector(".fontFamily").value;
  document.querySelector("body,h1,h2,h3,h4,h5,h6").style.fontFamily = fontFamily;
}
