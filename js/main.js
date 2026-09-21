/**
 * МАЙСТЕР-СЕРВІС | ОСНОВНА КЛІЄНТСЬКА ЛОГІКА
 * Акордеони, мобільне меню, перемикання категорій, віджет зв'язку та форми
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCategoryTabs();
  initFaqAccordion();
  initScrollTopButton();
  initModals();
  initForms();
  initSmoothScroll();
  initScrollReveal();
});

/* --------------------------------------------------------------------------
   1. Мобільна навігація
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const nav = document.querySelector('.header-nav');

  if (!toggleBtn || !nav) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = nav.classList.toggle('mobile-active');
    toggleBtn.setAttribute('aria-expanded', isActive);
  });

  // Закриття при кліку на посилання
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Закриття при кліку поза меню
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggleBtn.contains(e.target)) {
      nav.classList.remove('mobile-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* --------------------------------------------------------------------------
   2. Перемикання вкладок категорій (Всі / Велика / Дрібна побутова техніка)
   -------------------------------------------------------------------------- */
function initCategoryTabs() {
  const tabBtns = document.querySelectorAll('.category-tab-btn');
  const blocks = document.querySelectorAll('.category-block, [data-category-item]');

  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCat = btn.getAttribute('data-category');

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      blocks.forEach(block => {
        const itemCat = block.getAttribute('data-category') || block.getAttribute('data-category-item');
        if (targetCat === 'all' || itemCat === targetCat) {
          block.style.display = '';
        } else {
          block.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   3. FAQ-акордеон
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Закриваємо інші елементи у тій самій секції
      const parentList = item.parentElement;
      if (parentList) {
        parentList.querySelectorAll('.faq-item').forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherBtn = otherItem.querySelector('.faq-question-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      // Перемикаємо поточний
      item.classList.toggle('active', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });
}



/* --------------------------------------------------------------------------
   4.1 Кнопка швидкого скролу вгору (над плаваючим чатом)
   -------------------------------------------------------------------------- */
function initScrollTopButton() {
  let scrollBtn = document.querySelector('.scroll-top-btn');
  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.type = 'button';
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.setAttribute('aria-label', 'Вгору сторінки');
    scrollBtn.setAttribute('title', 'Вгору');
    scrollBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    `;
    document.body.appendChild(scrollBtn);
  }

  const toggleVisibility = () => {
    if (window.scrollY > 280) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* --------------------------------------------------------------------------
   5. Модальні вікна (Виклик інженера)
   -------------------------------------------------------------------------- */
function initModals() {
  const openButtons = document.querySelectorAll('[data-open-modal]');
  const closeButtons = document.querySelectorAll('[data-close-modal]');
  const modals = document.querySelectorAll('.modal-backdrop');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-open-modal');
      const targetModal = document.getElementById(modalId);
      const prefillDevice = btn.getAttribute('data-device');

      if (targetModal) {
        if (prefillDevice) {
          const deviceSelect = targetModal.querySelector('select[name="device"], input[name="device"]');
          if (deviceSelect) {
            deviceSelect.value = prefillDevice;
          }
        }

        targetModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = (modal) => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) closeModal(modal);
    });
  });

  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('active')) {
          closeModal(modal);
        }
      });
    }
  });
}

/* --------------------------------------------------------------------------
   6. Обробка відправки форм (через серверний PHP обробник send.php)
   -------------------------------------------------------------------------- */
function initForms() {
  const forms = document.querySelectorAll('.ajax-repair-form');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 1. Honeypot захист від спам-ботів
      const honeypot = form.querySelector('input[name="website_hp"]');
      if (honeypot && honeypot.value.trim() !== '') {
        console.warn('Spam bot blocked.');
        form.reset();
        return;
      }

      // 2. Збір та валідація даних
      const nameInput = form.querySelector('input[name="name"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      const deviceInput = form.querySelector('select[name="device"], input[name="device"]');
      const messageInput = form.querySelector('textarea[name="message"], input[name="message"]');
      const statusToast = form.querySelector('.status-toast');

      const name = nameInput ? nameInput.value.trim() : 'Клієнт';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const device = deviceInput ? deviceInput.value.trim() : 'Не вказано';
      const userMessage = messageInput ? messageInput.value.trim() : '—';
      const formSource = form.getAttribute('data-form-source') || document.title || 'Форма на сайті';

      // Перевірка коректності номера (мінімум 9 цифр)
      const digitsOnly = phone.replace(/\D/g, '');
      if (!phone || digitsOnly.length < 9) {
        showFormStatus(statusToast, 'Будь ласка, введіть коректний номер телефону (наприклад, 068 824 95 27).', 'error');
        if (phoneInput) phoneInput.focus();
        return;
      }

      // Індикація відправки
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Надіслати заявку';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
          </svg> Відправка...`;
      }

      try {
        const response = await fetch('send.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name,
            phone,
            device,
            message: userMessage,
            source: formSource,
            website_hp: honeypot ? honeypot.value : ''
          })
        });

        const result = await response.json();

        if (response.ok && result.ok) {
          form.reset();
          if (statusToast) statusToast.style.display = 'none';

          // Закриваємо модалку виклику, якщо відкрита
          const parentModal = form.closest('.modal-backdrop');
          if (parentModal) {
            parentModal.classList.remove('active');
            document.body.style.overflow = '';
          }

          // Показуємо красиве модальне вікно успішної заявки
          showSuccessModal({
            name,
            phone
          });
        } else {
          showFormStatus(
            statusToast,
            result.error || 'Виникла технічна заминка при відправці. Будь ласка, зателефонуйте нам прямо зараз за номером у шапці сайту.',
            'error'
          );
        }
      } catch (err) {
        console.error('Form submission error:', err);
        showFormStatus(
          statusToast,
          'Не вдалося зʼєднатися з сервером. Зателефонуйте черговому інженеру напряму.',
          'error'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  });
}

/**
 * Відображає модальне вікно про успішно прийняту заявку
 */
function showSuccessModal({ name, phone }) {
  let successModal = document.getElementById('order-success-modal');
  if (!successModal) {
    successModal = document.createElement('div');
    successModal.id = 'order-success-modal';
    successModal.className = 'modal-backdrop';
    successModal.setAttribute('role', 'dialog');
    successModal.setAttribute('aria-modal', 'true');
    successModal.setAttribute('aria-labelledby', 'success-modal-title');
    successModal.innerHTML = `
      <div class="modal-dialog modal-window" style="text-align: center; max-width: 440px;">
        <button type="button" class="modal-close-btn" data-close-modal aria-label="Закрити">&times;</button>
        <div style="width: 64px; height: 64px; background: #DCFCE7; color: #16A34A; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 18px;">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 class="modal-title" id="success-modal-title" style="margin-bottom: 10px; font-size: 1.4rem;">Заявку прийнято!</h3>
        <p style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.55; margin-bottom: 24px;">
          Дякуємо! Ваше звернення передано черговому інженеру. Ми зателефонуємо вам для уточнення деталей та погодження часу візиту майстра.
        </p>
        <button type="button" class="btn btn-primary" data-close-modal style="width: 100%;">
          <span>Зрозуміло</span>
        </button>
      </div>
    `;
    document.body.appendChild(successModal);

    // Додаємо слухачі на закриття
    successModal.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  successModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function showFormStatus(toastElement, message, type) {
  if (!toastElement) {
    alert(message);
    return;
  }
  toastElement.style.display = 'flex';
  toastElement.className = `status-toast ${type}`;
  const iconSvg = type === 'success'
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  toastElement.innerHTML = `<span class="toast-icon-wrap" style="display:inline-flex;align-items:center;flex-shrink:0;margin-top:2px;">${iconSvg}</span><div>${message}</div>`;
  toastElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* --------------------------------------------------------------------------
   7. Плавне прокручування для якорів
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. Анімація появи елементів при скролі (Scroll Reveal)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Каскадна затримка для карток в однакових контейнерах (stagger-ефект)
  const containers = document.querySelectorAll(
    '.services-grid, .advantages-grid, .review-grid, .pricing-grid, .faq-accordion, .process-steps, .contacts-grid'
  );
  containers.forEach(container => {
    const items = container.querySelectorAll(
      '.card, .service-card, .advantage-card, .review-card, .faq-item, .process-step, .category-block'
    );
    items.forEach((item, idx) => {
      item.style.transitionDelay = `${(idx % 4) * 0.08}s`;
    });
  });

  const targets = document.querySelectorAll(`
    .section-header,
    .category-block,
    .service-card,
    .advantage-card,
    .process-step,
    .faq-item,
    .review-card,
    .pricing-table-wrap,
    .contact-card,
    .form-card,
    .card:not(.hero-floating-card):not(.modal-window):not(.modal-dialog),
    [data-reveal]
  `);

  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.05
  });

  targets.forEach(el => {
    const rect = el.getBoundingClientRect();
    // Якщо елемент уже знаходиться в зоні видимості при завантаженні сторінки
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('reveal-on-scroll', 'is-revealed');
    } else {
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    }
  });
}