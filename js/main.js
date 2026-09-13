/**
 * МАЙСТЕР-СЕРВІС | ОСНОВНА КЛІЄНТСЬКА ЛОГІКА
 * Акордеони, мобільне меню, перемикання категорій, віджет зв'язку та форми
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCategoryTabs();
  initFaqAccordion();
  initStickyChatWidget();
  initModals();
  initForms();
  initSmoothScroll();
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
   4. Плаваючий віджет чату
   -------------------------------------------------------------------------- */
function initStickyChatWidget() {
  const widget = document.querySelector('.sticky-chat-widget');
  if (!widget) return;

  const toggleBtn = widget.querySelector('.chat-toggle-btn');
  const popupMenu = widget.querySelector('.chat-popup-menu');

  if (!toggleBtn || !popupMenu) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popupMenu.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      popupMenu.classList.remove('active');
    }
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
   6. Обробка відправки форм (через window.sendTelegramLead)
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

      // Перевірка коректності номера
      if (!phone || phone.length < 8) {
        showFormStatus(statusToast, 'Будь ласка, введіть коректний номер телефону.', 'error');
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
        let result = { ok: true };
        if (typeof window.sendTelegramLead === 'function') {
          result = await window.sendTelegramLead({
            name,
            phone,
            device,
            message: userMessage,
            source: formSource
          });
        }

        if (result.ok) {
          showFormStatus(
            statusToast,
            'Дякуємо! Вашу заявку успішно прийнято. Черговий спеціаліст зв’яжеться з вами для уточнення деталей та узгодження часу візиту.',
            'success'
          );
          form.reset();

          // Якщо це модалка — плавно закриваємо через 3.5 секунди
          const parentModal = form.closest('.modal-backdrop');
          if (parentModal) {
            setTimeout(() => {
              parentModal.classList.remove('active');
              document.body.style.overflow = '';
              if (statusToast) statusToast.style.display = 'none';
            }, 3500);
          }
        } else {
          showFormStatus(
            statusToast,
            'Виникла технічна заминка при відправці. Будь ласка, зателефонуйте нам прямо зараз за номером у шапці сайту.',
            'error'
          );
        }
      } catch (err) {
        console.error('Form submission error:', err);
        showFormStatus(
          statusToast,
          'Не вдалося зв’язатися з сервером. Зателефонуйте черговому інженеру напряму.',
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