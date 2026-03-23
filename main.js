/* ============================================================
   main.js — 沈阳嘉桐科技有限公司
   ============================================================ */

// ---- 导航栏滚动效果 ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- 移动端菜单 ----
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // 点击导航项关闭菜单
  navLinks.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ---- 数字计数动画 ----
function animateNumbers() {
  const nums = document.querySelectorAll('.stat-num[data-target]');
  nums.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, 20);
  });
}

// ---- IntersectionObserver — 滚动入场动画 ----
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // 触发数字动画（仅一次）
      if (entry.target.classList.contains('stats-bar')) {
        animateNumbers();
      }
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// 观察需要动画的元素
document.querySelectorAll(
  '.card, .feature-item, .mvv-card, .tl-item, .team-card, .visual-card, .stats-bar, .sp-mini-card, .ts-item, .ts-tag'
).forEach(el => observer.observe(el));

// 为可观察元素添加初始状态
const style = document.createElement('style');
style.textContent = `
  .card, .feature-item, .mvv-card, .tl-item, .team-card, .visual-card,
  .sp-mini-card, .ts-item, .ts-tag {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .card:nth-child(2), .feature-item:nth-child(2), .mvv-card:nth-child(2),
  .team-card:nth-child(2), .visual-card:nth-child(2) { transition-delay: 0.1s; }
  .card:nth-child(3), .feature-item:nth-child(3), .mvv-card:nth-child(3),
  .team-card:nth-child(3), .visual-card:nth-child(3) { transition-delay: 0.2s; }
  .card:nth-child(4), .feature-item:nth-child(4), .team-card:nth-child(4),
  .visual-card:nth-child(4) { transition-delay: 0.3s; }
  .card:nth-child(5) { transition-delay: 0.4s; }
  .card:nth-child(6) { transition-delay: 0.5s; }
  .tl-left { transition-delay: 0.05s; }
  .tl-right { transition-delay: 0.15s; }
  .visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// ---- 服务 Tab 切换 ----
const tabs = document.querySelectorAll('.stab');
const panels = document.querySelectorAll('.service-panel');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-target');
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const targetPanel = document.getElementById(target);
    if (targetPanel) targetPanel.classList.add('active');
  });
});

// ---- FAQ 展开/折叠 ----
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const isOpen = btn.classList.contains('open');

  // 关闭其他所有
  document.querySelectorAll('.faq-q.open').forEach(q => {
    q.classList.remove('open');
    q.closest('.faq-item').querySelector('.faq-a').style.display = 'none';
  });

  if (!isOpen) {
    btn.classList.add('open');
    answer.style.display = 'block';
  }
}

// ---- 联系表单提交 ----
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const success = document.getElementById('formSuccess');
    btn.disabled = true;
    btn.innerHTML = '<span>提交中...</span>';
    setTimeout(() => {
      btn.style.display = 'none';
      success.style.display = 'block';
      form.reset();
    }, 1200);
  });
}

// ---- 平滑滚动 ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- 初始化触发 Hero 动画后的数字（若在首屏） ----
window.addEventListener('load', () => {
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    const rect = statsBar.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setTimeout(animateNumbers, 500);
    }
  }
});
