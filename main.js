(function () {
  'use strict';

  /* ---------- Поточний рік у футері ---------- */
  var year = document.getElementById('year');
  if (year) { year.textContent = new Date().getFullYear(); }

  /* ---------- Адаптивне меню (бургер) ----------
     Без JS меню просто видиме (клас .js додається інлайн-скриптом у <head>). */
  var header = document.querySelector('header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    var setOpen = function (open) {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    // при переході на широкий екран закриваємо мобільну панель
    var wide = window.matchMedia('(min-width: 769px)');
    var onWide = function (e) { if (e.matches) { setOpen(false); } };
    if (wide.addEventListener) { wide.addEventListener('change', onWide); }
    else if (wide.addListener) { wide.addListener(onWide); }   // старі Safari
  }

  /* ---------- Клієнтська валідація форм ----------
     Основа — HTML5-атрибути (required, type, minlength, pattern).
     JS лише показує зрозумілі повідомлення українською та стани полів
     (aria-invalid + клас .touched). Без JS працює стандартна валідація браузера. */
  var SKIP_TYPES = ['submit', 'button', 'reset', 'hidden', 'radio'];

  function errorText(f) {
    var v = f.validity;
    if (v.valueMissing) {
      if (f.type === 'checkbox') { return 'Підтвердіть згоду, щоб продовжити.'; }
      if (f.tagName === 'SELECT') { return 'Оберіть варіант зі списку.'; }
      return 'Це поле обов’язкове.';
    }
    if (v.typeMismatch && f.type === 'email') {
      return 'Вкажіть коректну адресу e-mail, наприклад name@example.com.';
    }
    if (v.tooShort) {
      return 'Введіть щонайменше ' + f.minLength + ' симв. (зараз ' + f.value.length + ').';
    }
    if (v.patternMismatch) { return f.title || 'Невірний формат.'; }
    return f.validationMessage || 'Перевірте значення.';
  }

  function fieldsOf(form) {
    return Array.prototype.filter.call(form.elements, function (el) {
      return el.name && SKIP_TYPES.indexOf(el.type) === -1;
    });
  }

  function statusOf(form) {
    var s = form.querySelector('.status');
    if (!s && form.nextElementSibling && form.nextElementSibling.classList.contains('status')) {
      s = form.nextElementSibling;
    }
    return s;
  }

  function setStatus(el, text, type) {
    if (!el) { return; }
    el.className = 'status' + (type ? ' ' + type : '');
    el.textContent = text;
  }

  // елемент з текстом помилки під полем (створюємо при потребі)
  function errorEl(f) {
    if (!f.id) { return null; }
    var id = f.id + '-error';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('p');
      el.className = 'field-error';
      el.id = id;
      el.hidden = true;
      var anchor = f.type === 'checkbox' ? (f.closest('label') || f) : f;
      anchor.insertAdjacentElement('afterend', el);
    }
    return el;
  }

  function validate(f, form) {
    var ok = f.checkValidity();
    var compact = form.classList.contains('subscribe') || form.classList.contains('filters');
    var err = compact ? null : errorEl(f);
    if (ok) {
      f.removeAttribute('aria-invalid');
      if (err) { err.hidden = true; err.textContent = ''; f.removeAttribute('aria-describedby'); }
    } else {
      f.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = errorText(f); err.hidden = false; f.setAttribute('aria-describedby', err.id); }
      else { setStatus(statusOf(form), errorText(f), 'error'); }
    }
    return ok;
  }

  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.noValidate = true;   // показуємо власні повідомлення замість спливаючих підказок браузера

    // після першої взаємодії поле вважається «touched» і перевіряється
    form.addEventListener('focusout', function (e) {
      var f = e.target;
      if (fieldsOf(form).indexOf(f) === -1) { return; }
      if (e.relatedTarget && e.relatedTarget.type === 'reset') { return; }  // не лякаємо помилками при «Очистити»
      f.classList.add('touched');
      validate(f, form);
    });
    ['input', 'change'].forEach(function (evt) {
      form.addEventListener(evt, function (e) {
        var f = e.target;
        if (f.classList && f.classList.contains('touched')) {
          validate(f, form);
          if (form.classList.contains('subscribe') && f.checkValidity()) { setStatus(statusOf(form), '', ''); }
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();  // тут має бути надсилання на сервер (fetch/POST)
      var status = statusOf(form);
      var firstBad = null;
      fieldsOf(form).forEach(function (f) {
        f.classList.add('touched');
        if (!validate(f, form) && !firstBad) { firstBad = f; }
      });
      if (firstBad) {
        if (!form.classList.contains('subscribe')) {
          setStatus(status, 'Перевірте поля, виділені червоним.', 'error');
        }
        firstBad.focus();
        return;
      }
      setStatus(status, form.dataset.message || 'Дякуємо! Дані прийнято (демонстраційна форма).', 'success');
      if (!form.hasAttribute('data-no-reset')) {
        var msg = status ? status.textContent : '';
        form.reset();
        setStatus(status, msg, 'success');  // reset очищає статус — повертаємо повідомлення
      }
    });

    form.addEventListener('reset', function () {
      fieldsOf(form).forEach(function (f) {
        f.classList.remove('touched');
        f.removeAttribute('aria-invalid');
        f.removeAttribute('aria-describedby');
        var err = f.id && document.getElementById(f.id + '-error');
        if (err) { err.hidden = true; err.textContent = ''; }
      });
      setStatus(statusOf(form), '', '');
    });
  });

  /* ---------- Кнопка «Додати в кошик» (демо) ---------- */
  var addBtn = document.querySelector('[data-add-to-cart]');
  var cartStatus = document.getElementById('cart-status');
  if (addBtn && cartStatus) {
    addBtn.addEventListener('click', function () {
      cartStatus.textContent = addBtn.dataset.message || 'Товар додано в кошик (демо).';
    });
  }

  /* ---------- Кнопки-заглушки (пагінація, «Показати ще») ---------- */
  var pageStatus = document.getElementById('page-status');
  document.querySelectorAll('[data-toast]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (pageStatus) { pageStatus.textContent = btn.dataset.toast; }
    });
  });
})();
