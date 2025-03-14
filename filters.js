function myFunction() {
   var input, filter, ul, li, a, i, txtValue;
   input = document.getElementById("myInput");
   filter = input.value.toUpperCase();
   ul = document.getElementById("myUL");
   li = ul.getElementsByTagName("li");
   for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("a")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
         li[i].style.display = "";
      } else {
         li[i].style.display = "none";
      }
   }
}

filterSelection("all")

function filterSelection(c) {
   var x, i;
   x = document.getElementsByClassName("filterDiv");
   document.getElementById('myInput').value = '';
   myFunction();
   if (c == "all") c = "";
   for (i = 0; i < x.length; i++) {
      w3RemoveClass(x[i], "show");
      if (x[i].className.indexOf(c) > -1) w3AddClass(x[i], "show");
   }
}

function w3AddClass(element, name) {
   var i, arr1, arr2;
   arr1 = element.className.split(" ");
   arr2 = name.split(" ");
   for (i = 0; i < arr2.length; i++) {
      if (arr1.indexOf(arr2[i]) == -1) {
         element.className += " " + arr2[i];
      }
   }
}

function w3RemoveClass(element, name) {
   var i, arr1, arr2;
   arr1 = element.className.split(" ");
   arr2 = name.split(" ");
   for (i = 0; i < arr2.length; i++) {
      while (arr1.indexOf(arr2[i]) > -1) {
         arr1.splice(arr1.indexOf(arr2[i]), 1);
      }
   }
   element.className = arr1.join(" ");
}

// Add active class to the current button (highlight it)
var btnContainer = document.getElementById("myBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
   btns[i].addEventListener("click", function () {
      var current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
   });
}

function sortList() {
   var list, d, switching, b, shouldSwitch;
   list = document.getElementById("myUL");
   switching = true;
   /* Make a loop that will continue until
   no switching has been done: */
   while (switching) {
      // start by saying: no switching is done:
      switching = false;
      b = list.getElementsByTagName("LI");
      // Loop through all list-items:
      for (d = 0; d < (b.length - 1); d++) {
         // start by saying there should be no switching:
         shouldSwitch = false;
         /* check if the next item should
         switch place with the current item: */
         if (b[d].textContent.toLowerCase() > b[d + 1].textContent.toLowerCase()) {
            /* if next item is alphabetically
            lower than current item, mark as a switch
            and break the loop: */
            shouldSwitch = true;
            break;
         }
      }
      if (shouldSwitch) {
         /* If a switch has been marked, make the switch
         and mark the switch as done: */
         b[d].parentNode.insertBefore(b[d + 1], b[d]);
         switching = true;
      }
   }
}

function myFunctionShow() {
   var x = document.getElementById("myBtnContainer");
   if (x.style.display === "none") {
      x.style.display = "block";
   } else {
      x.style.display = "none";
   }
}
