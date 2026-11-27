/* MM Boxe - comportamentos compartilhados: menu hambúrguer, lightbox e formulário. */
(function () {
  'use strict';

  /* TODO: preencher com o número oficial do WhatsApp (somente dígitos, com DDI+DDD).
     Ex.: '5519999999999'. Vazio = o WhatsApp deixa a pessoa escolher o contato. */
  var WHATSAPP_NUMBER = '';

  function whatsappUrl(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* ---------- Menu hambúrguer ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu-principal');
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.classList.toggle('is-open', open);
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
  }

  /* ---------- Links de WhatsApp ---------- */
  document.querySelectorAll('[data-whatsapp]').forEach(function (a) {
    a.href = whatsappUrl(a.getAttribute('data-whatsapp') || 'Olá! Gostaria de saber mais sobre o projeto MM Boxe.');
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  /* ---------- Lightbox da galeria ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.gallery-link'));
  if (links.length) {
    var current = 0;
    var lastFocus = null;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Visualizador de imagens');
    box.innerHTML =
      '<button type="button" class="lightbox__btn lightbox__close" aria-label="Fechar">&times;</button>' +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Imagem anterior">&#8249;</button>' +
      '<figure class="lightbox__figure"><img class="lightbox__img" alt="" /><figcaption class="lightbox__caption"></figcaption></figure>' +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="Próxima imagem">&#8250;</button>';
    document.body.appendChild(box);
    var img = box.querySelector('.lightbox__img');
    var cap = box.querySelector('.lightbox__caption');
    var closeBtn = box.querySelector('.lightbox__close');

    var show = function (i) {
      current = (i + links.length) % links.length;
      var src = links[current].getAttribute('href');
      var alt = links[current].querySelector('img').getAttribute('alt') || '';
      img.src = src;
      img.alt = alt;
      cap.textContent = alt + ' (' + (current + 1) + ' de ' + links.length + ')';
    };
    var open = function (i) {
      lastFocus = document.activeElement;
      show(i);
      box.hidden = false;
      document.body.classList.add('no-scroll');
      closeBtn.focus();
    };
    var close = function () {
      box.hidden = true;
      document.body.classList.remove('no-scroll');
      if (lastFocus) lastFocus.focus();
    };

    links.forEach(function (a, i) {
      a.removeAttribute('target');
      a.setAttribute('aria-label', 'Ampliar imagem ' + (i + 1) + ' de ' + links.length);
      a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    });
    closeBtn.addEventListener('click', close);
    box.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'Tab') {
        var f = box.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Formulário de interesse ---------- */
  var form = document.getElementById('form-interesse');
  if (form) {
    var MIN_AGE = 10, MAX_AGE = 17;
    var PHONE_RE = /^(?:\([1-9]{2}\)|[1-9]{2})\s?9[0-9]{4}-?[0-9]{4}$/;
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var message = document.getElementById('form-message');

    var ageFrom = function (value) {
      var p = value.split('-');
      if (p.length !== 3) return NaN;
      var born = new Date(+p[0], +p[1] - 1, +p[2]);
      if (isNaN(born.getTime()) || born.getFullYear() < 1900) return NaN;
      var now = new Date();
      var age = now.getFullYear() - born.getFullYear();
      var m = now.getMonth() - born.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--;
      return age;
    };

    var validators = {
      responsavel: function (v) { return v.trim().length < 3 ? 'Informe o nome completo do responsável.' : ''; },
      aluno: function (v) { return v.trim().length < 3 ? 'Informe o nome completo do aluno(a).' : ''; },
      nascimento: function (v) {
        if (!v) return 'Informe a data de nascimento do aluno(a).';
        var age = ageFrom(v);
        if (isNaN(age) || age < 0) return 'Data de nascimento inválida.';
        if (age < MIN_AGE || age > MAX_AGE) {
          return 'O projeto atende apenas de ' + MIN_AGE + ' a ' + MAX_AGE + ' anos. O aluno(a) tem ' + age + ' ano' + (age === 1 ? '' : 's') + '.';
        }
        return '';
      },
      email: function (v) { return v.trim() && !EMAIL_RE.test(v.trim()) ? 'Digite um e-mail válido, como nome@email.com.' : ''; },
      telefone: function (v) {
        if (!v.trim()) return 'Informe um telefone ou WhatsApp com DDD.';
        return PHONE_RE.test(v.trim()) ? '' : 'Digite um celular com DDD, como (16) 99999-9999.';
      }
    };

    var showError = function (input, text) {
      var err = document.getElementById(input.id + '-erro');
      if (text) {
        input.setAttribute('aria-invalid', 'true');
        err.textContent = text;
      } else {
        input.removeAttribute('aria-invalid');
        err.textContent = '';
      }
      return !text;
    };
    var check = function (input) { return showError(input, validators[input.name](input.value)); };

    var dob = form.elements.nascimento;
    var today = new Date();
    dob.max = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    Object.keys(validators).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () { check(input); });
      input.addEventListener('input', function () { if (input.hasAttribute('aria-invalid')) check(input); });
      input.addEventListener('change', function () { check(input); });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      message.textContent = '';
      var firstInvalid = null;
      Object.keys(validators).forEach(function (name) {
        var input = form.elements[name];
        if (!check(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      var f = form.elements;
      var born = f.nascimento.value.split('-').reverse().join('/');
      var lines = [
        'Olá! Gostaria de demonstrar interesse nas aulas gratuitas de boxe da MM Boxe.',
        'Responsável: ' + f.responsavel.value.trim(),
        'Aluno(a): ' + f.aluno.value.trim(),
        'Data de nascimento: ' + born,
        'Telefone: ' + f.telefone.value.trim()
      ];
      if (f.email.value.trim()) lines.push('E-mail: ' + f.email.value.trim());
      var url = whatsappUrl(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
      message.innerHTML = 'Abrimos o WhatsApp com os dados preenchidos. Envie a mensagem para a equipe concluir seu interesse. ' +
        'Se não abriu, <a href="' + url.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer">clique aqui</a>.';
    });
  }
})();
