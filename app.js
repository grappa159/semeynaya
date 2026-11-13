/* =========================================================
   НАСТРОЙКИ — правьте здесь
   ========================================================= */
const CONFIG = {
  whatsapp: '79222417113',          // WhatsApp/Viber из карточки на Яндекс Картах
  showDemoBadge: false,              // плашка «Демо-версия» — убрать после согласования
  devName: 'Разработчик: Иван',
  devLink: '',                      // например 'https://t.me/your_nick'
  // 0 = воскресенье … 6 = суббота (по данным Яндекс Карт; на вывеске указано 10–17 — уточнить)
  hours: [
    null,               // Вс
    ['09:00', '16:00'], // Пн
    ['09:00', '16:00'], // Вт
    ['09:00', '16:00'], // Ср
    ['09:00', '16:00'], // Чт
    ['09:00', '16:00'], // Пт
    null,               // Сб
  ],
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const openWA = text => window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
const fmtDate = v => v ? new Date(v + 'T00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }) : '';
const hm = s => s.replace(/^0/, '');

function renderHours() {
  const names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const rows = [];
  [1, 2, 3, 4, 5, 6, 0].forEach(d => {
    const h = CONFIG.hours[d];
    const key = h ? `${hm(h[0])}–${hm(h[1])}` : 'выходной';
    const last = rows[rows.length - 1];
    if (last && last.key === key) last.to = d; else rows.push({ from: d, to: d, key });
  });
  $('#hoursList').innerHTML = rows.map(r => `${names[r.from]}${r.from !== r.to ? '–' + names[r.to] : ''}: ${r.key}`).join('<br>');

  // статус по пермскому времени (UTC+5)
  const perm = new Date(Date.now() + (5 * 60 + new Date().getTimezoneOffset()) * 60000);
  const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const now = perm.getHours() * 60 + perm.getMinutes();
  const today = CONFIG.hours[perm.getDay()];
  let text, open = false;
  if (today && now >= toMin(today[0]) && now < toMin(today[1])) { open = true; text = `Открыто до ${hm(today[1])} · ждём на обед`; }
  else if (today && now < toMin(today[0])) text = `Откроемся сегодня в ${hm(today[0])}`;
  else {
    let d = (perm.getDay() + 1) % 7, n = 1;
    while (!CONFIG.hours[d] && n < 7) { d = (d + 1) % 7; n++; }
    const day = n === 1 ? 'завтра' : ['в воскресенье', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу'][d];
    text = `Закрыто · откроемся ${day} в ${hm(CONFIG.hours[d][0])}`;
  }
  $('#openText').textContent = text;
  $('#openDot').classList.toggle('is-open', open);
}

function initHeader() {
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-solid', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  });
}

function initForms() {
  const today = new Date().toISOString().slice(0, 10);
  $$('input[type=date]').forEach(i => { i.min = today; });
  $('#askMenu').addEventListener('click', () => openWA('Здравствуйте! Подскажите, пожалуйста, что сегодня в меню?'));
  $$('[data-order]').forEach(b => b.addEventListener('click', () => {
    $('#events').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('#orderForm select').focus({ preventScroll: true }), 700);
  }));
  $('#orderForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target.elements;
    openWA(`Здравствуйте! Хочу заказать: ${f.type.value}.\nДата: ${fmtDate(f.date.value)}\nГостей: ${f.guests.value}\nИмя: ${f.name.value}\nТелефон: ${f.phone.value}`);
  });
}

function initLightbox() {
  const lb = $('#lightbox'), img = $('img', lb);
  $('#masonry').addEventListener('click', e => {
    if (e.target.tagName !== 'IMG') return;
    img.src = e.target.src; img.alt = e.target.alt; lb.hidden = false;
  });
  lb.addEventListener('click', () => { lb.hidden = true; });
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });
}

function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  const els = $$('.head, .card, .board, .today__text, .ev, .order, .steps li, .contacts__card, .map');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
}

function initDemoBadge() {
  const badge = $('#demoBadge');
  if (!CONFIG.showDemoBadge) { badge.remove(); return; }
  const a = $('#devLink');
  a.textContent = CONFIG.devName;
  if (CONFIG.devLink) a.href = CONFIG.devLink;
  $('#demoClose').addEventListener('click', () => { badge.hidden = true; });
}

renderHours();
initHeader();
initForms();
initLightbox();
initReveal();
initDemoBadge();
