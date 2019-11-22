const logo = document.querySelector('#logo');

logo.addEventListener('click', () => {
  logo.classList.toggle('animate');
  setTimeout(() => {
    // logo.style.display = 'none';
    logo.classList.toggle('animate');
  }, 3000);
});

