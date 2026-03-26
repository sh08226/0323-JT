// 嘉桐科技官网 - 主逻辑

// 全局变量
let currentUser = null;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initModals();
    checkLoginStatus();
    initAnimations();
});

// ===== 导航栏 =====
function initNavbar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // 滚动时改变导航栏背景
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// ===== 弹窗 =====
function initModals() {
    // 点击弹窗外部关闭
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ===== 登录注册 =====
function showLoginModal() {
    showModal('loginModal');
}

function showRegisterModal() {
    showModal('registerModal');
}

function checkLoginStatus() {
    const user = localStorage.getItem('jt_user');
    if (user) {
        currentUser = JSON.parse(user);
        updateUserUI(true);
    }
}

function updateUserUI(isLoggedIn) {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (isLoggedIn && currentUser) {
        let roleText = currentUser.role === 'teacher' ? '教师' : 
                       currentUser.role === 'admin' ? '管理员' : '学员';
        
        navActions.innerHTML = `
            <span class="user-info">欢迎, ${currentUser.username}</span>
            <span class="user-role">${roleText}</span>
            <button class="btn-logout" onclick="logout()">退出</button>
            ${currentUser.role === 'admin' ? '<a href="admin.html" class="btn-admin">管理后台</a>' : ''}
        `;
    } else {
        navActions.innerHTML = `
            <button class="btn-login" onclick="showLoginModal()">登录</button>
            <button class="btn-register" onclick="showRegisterModal()">注册</button>
        `;
    }
}

function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // 模拟登录验证
    if (username && password) {
        // 检查是否是管理员
        if (username === 'admin' && password === 'JTADMIN2026') {
            currentUser = { username: 'admin', role: 'admin', _id: 'admin001' };
            localStorage.setItem('jt_admin', JSON.stringify(currentUser));
            window.location.href = 'admin.html';
            return;
        }
        
        // 模拟用户登录（实际需要 CloudBase 验证）
        currentUser = { 
            username: username, 
            role: 'student', 
            _id: 'user_' + Date.now() 
        };
        
        localStorage.setItem('jt_user', JSON.stringify(currentUser));
        updateUserUI(true);
        closeModal('loginModal');
        alert('登录成功！');
        
        // 清除表单
        document.getElementById('loginForm').reset();
    }
}

function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const role = document.getElementById('regRole').value;
    const code = document.getElementById('regCode').value;
    
    // 验证
    if (password !== confirmPassword) {
        alert('两次密码输入不一致！');
        return;
    }
    
    // 教师码验证
    if (role === 'teacher' && code !== 'JT2026') {
        alert('教师码错误！');
        return;
    }
    
    // 模拟注册成功
    currentUser = { 
        username: username, 
        email: email, 
        role: role, 
        _id: 'user_' + Date.now() 
    };
    
    localStorage.setItem('jt_user', JSON.stringify(currentUser));
    updateUserUI(true);
    closeModal('registerModal');
    alert('注册成功！');
    
    // 清除表单
    document.getElementById('registerForm').reset();
}

function logout() {
    localStorage.removeItem('jt_user');
    localStorage.removeItem('jt_admin');
    currentUser = null;
    updateUserUI(false);
    window.location.href = 'index.html';
}

// 切换注册角色时显示/隐藏教师码输入
document.addEventListener('DOMContentLoaded', function() {
    const roleSelect = document.getElementById('regRole');
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            const codeGroup = document.getElementById('teacherCodeGroup');
            if (codeGroup) {
                codeGroup.style.display = this.value === 'teacher' ? 'block' : 'none';
            }
        });
    }
});

// ===== 动画 =====
function initAnimations() {
    // 数字动画
    const counters = document.querySelectorAll('.stat-num');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
    });
    
    // 滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function animateCounter(element, target) {
    let count = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    
    const timer = setInterval(() => {
        count += step;
        if (count >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(count);
        }
    }, 16);
}

// ===== 表单提交 =====
function submitWish(event) {
    event.preventDefault();
    alert('心愿已提交，等待审核！');
    closeModal('wishModal');
}

function submitContact(event) {
    event.preventDefault();
    alert('留言已发送，我们会尽快联系您！');
    document.getElementById('contactForm').reset();
}

// ===== 平滑滚动 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});