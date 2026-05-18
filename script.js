const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuBtn = document.getElementById('menuBtn');
const closeSidebar = document.getElementById('closeSidebar');
const themeToggle = document.getElementById('themeToggle');

menuBtn.addEventListener('click', () => {
  sidebar.classList.add('active');
  overlay.classList.add('active');
});

closeSidebar.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

function closeMenu() {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}

const savedTheme = localStorage.getItem('theme');

if(savedTheme === 'light') {
  document.body.classList.add('light');
  themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');

  if(document.body.classList.contains('light')) {
    localStorage.setItem('theme', 'light');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    localStorage.setItem('theme', 'dark');
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
});

const links = document.querySelectorAll('.nav-menu a');

links.forEach(link => {
  link.addEventListener('click', () => {
    links.forEach(item => item.classList.remove('active'));
    link.classList.add('active');

    if(window.innerWidth < 900) {
      closeMenu();
    }
  });
});
