# Moja Strona na GitHub Pages

Używam parametru z adresu URL!

<div id="wynik">Czekam na dane...</div>

<script>
  // 1. Pobieramy parametry z aktualnego adresu (np. ?url=Tomek)
  const params = new URLSearchParams(window.location.search);
  const nazwa = params.get('url');

  // 2. Wyświetlamy wynik na stronie
  const element = document.getElementById('wynik');
  
  if (nazwa) {
    element.innerHTML = "Wartość parametru url to: <strong>" + nazwa + "</strong>";
  } else {
    element.innerHTML = "Nie podano parametru ?url= w adresie.";
  }
</script>
