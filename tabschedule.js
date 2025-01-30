var tablinks = Array.prototype.slice.call(document.getElementsByClassName("tablinks"));
var tabcontent = Array.prototype.slice.call(document.getElementsByClassName("tabcontent"));

function showTodaysSchedule() {
  var currentDay = new Date().getDay();
  document.getElementById("day-"+currentDay).classList.remove('today');
  document.getElementById("day-"+currentDay).classList.add('today');    
}

function showOnAir() {
  const date = new Date();

  const currentTime = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  const auditions = document.querySelectorAll(".today .schedule");

  if (!auditions.length) return;

  const [currentAudition] = [...auditions].filter((audition) => {
    const auditionStart =
      audition.querySelector(".start").textContent + ":00";
    const auditionEnd =
      audition.querySelector(".end").textContent + ":00";

    return currentTime >= auditionStart && currentTime < auditionEnd;
  });
  currentAudition?.classList.remove("on-air");
  currentAudition?.classList.add("on-air");
}
  
function openDAY(day) {
  var i;
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].className = tabcontent[i].className.replace(" active", "");
  }
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  tabcontent[day].className += " active";
  tablinks[day].className += " active";
}

tablinks.forEach(function (tablink, day) {
  tablink.addEventListener('click', function() {
    openDAY(day)
  })
})

openDAY((new Date().getDay() || 7) - 1)
setInterval(showTodaysSchedule, 60000);
setInterval(showOnAir, 60000);
showTodaysSchedule()
showOnAir()

var show_schedule = function(schedule){
  var no_entry = 'Niestety nie ma transmisji';
  var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  var days_buffer = {mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []}; 
  Array.prototype.slice.call(schedule).forEach(function(schedule_entry) {
    var start_time = schedule_entry.hour;
    if (start_time < 10) { start_time = '0' + start_time }
    start_time = start_time + ':00';
    days_buffer[schedule_entry.day].push('<span style="display: flex; padding-bottom:8px;">' + start_time + ' - ' + schedule_entry.name + '</tr>');
  });
  Array.prototype.slice.call(tabs).forEach(function(tab, index) {
    if (days_buffer[days[index]].length >= 1) {
      tab.innerHTML = days_buffer[days[index]].join('');
    } else {
      tab.innerHTML = no_entry;
    }
  }); 
};
