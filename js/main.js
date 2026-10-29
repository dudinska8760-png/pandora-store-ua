(function () {
  'use strict';

  // Поточний рік у футері
  var year = document.getElementById('year');
  if (year) { year.textContent = new Date().getFullYear(); }

  // Демонстраційні форми: сервера немає, тому показуємо повідомлення на сторінці
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    var status = form.querySelector('.status');

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // тут має бути надсилання на сервер (fetch/POST)
      if (status) {
        status.classList.remove('error');
        status.textContent = form.dataset.message || 'Дякуємо! Дані прийнято (демонстраційна форма).';
      }
      if (!form.hasAttribute('data-no-reset')) { form.reset(); }
    });

    form.addEventListener('reset', function () {
      if (status) { status.textContent = ''; }
    });
  });

  // Кнопка «Додати в кошик» (демо)
  var addBtn = document.querySelector('[data-add-to-cart]');
  var cartStatus = document.getElementById('cart-status');
  if (addBtn && cartStatus) {
    addBtn.addEventListener('click', function () {
      cartStatus.textContent = addBtn.dataset.message || 'Товар додано в кошик (демо).';
    });
  }

  // Кнопки-заглушки (пагінація, «Показати ще»): повідомлення у блоці статусу
  var pageStatus = document.getElementById('page-status');
  document.querySelectorAll('[data-toast]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (pageStatus) { pageStatus.textContent = btn.dataset.toast; }
    });
  });
})();
