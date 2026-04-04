document.querySelectorAll('.has-submenu > a').forEach(parentLink => {
  parentLink.addEventListener('click', function(e) {
    // Działaj tylko na mobile
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const parentLi = this.parentElement;
      
      // Przełączanie klasy open na rodzicu (otwórz/zamknij)
      parentLi.classList.toggle('open');
      
      // Zamknij inne otwarte podmenu, jeśli istnieją
      document.querySelectorAll('.has-submenu').forEach(other => {
        if (other !== parentLi) other.classList.remove('open');
      });
    }
  });
});

// DODATKOWO: Zamknij submenu po kliknięciu w konkretny link wewnątrz niego
document.querySelectorAll('.submenu a').forEach(subLink => {
  subLink.addEventListener('click', () => {
    document.querySelectorAll('.has-submenu').forEach(el => {
      el.classList.remove('open');
    });
  });
});
