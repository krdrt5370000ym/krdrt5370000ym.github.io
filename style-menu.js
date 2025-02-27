window.onscroll = function() {myFunctionMenu()};

var header = document.getElementById("myHeader");
var sticky = header.offsetTop;

function myFunctionMenu() {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}

function openNav() {
  document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}
