// 嘉桐科技官网 - 主逻辑

// 全局变量
let currentUser = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    checkLoginStatus();
});

// 移动端菜单
function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// 登录弹窗
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

// 注册弹窗
function showRegisterModal() {
    showLoginModal();
    switchTab('register');
}

// 关闭弹窗
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 点击弹窗外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
};

// 切换登录/注册标签
function switchTab(tab) {
    const tabs = document.querySelectorAll('.modal-tab');
    const forms = ['loginForm', 'registerForm', 'teacherForm'];
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => document.getElementById(f).classList.add('hidden'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginForm').classList.remove('hidden');
    } else if (tab === 'register') {
        tabs[1].classList.add('active');
        document.getElementById('registerForm').classList.remove('hidden');
    } else if (tab === 'teacher') {
        tabs[2].classList.add('active');
        document.getElementById('teacherForm').classList.remove('hidden');
    }
}

// 检查登录状态
function checkLoginStatus() {
    const user = localStorage.getItem('jt_user');
    if (user) {
        currentUser = JSON.parse(user);
        updateUserUI(true);
    }
}

// 更新用户UI
function updateUserUI(isLoggedIn) {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (isLoggedIn && currentUser) {
        let roleText = currentUser.role === 'teacher' ? '教师' : 
                       currentUser.role === 'admin' ? '管理员' : '学员';
        
        navActions.innerHTML = `
            <span style="margin-right:10px;font-size:13px;">欢迎 ${currentUser.username}</span>
            <button class="btn btn-secondary btn-sm" onclick="logout()">退出</button>
            ${currentUser.role === 'admin' ? '<a href="admin.html" class="btn btn-primary btn-sm" style="margin-left:10px;">管理</a>' : ''}
        `;
    } else {
        navActions.innerHTML = `
            <button class="btn btn-primary btn-sm" onclick="showLoginModal()">登录</button>
            <button class="btn btn-secondary btn-sm" onclick="showRegisterModal()">注册</button>
        `;
    }
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('请输入邮箱和密码');
        return;
    }
    
    // 管理员登录检查
    if (email === 'admin@jt.com' && password === 'JTADMIN2026') {
        currentUser = { username: 'admin', role: 'admin', _id: 'admin001' };
        localStorage.setItem('jt_admin', JSON.stringify(currentUser));
        window.location.href = 'admin.html';
        return;
    }
    
    // 模拟用户登录
    currentUser = { 
        username: email.split('@')[0], 
        email: email,
        role: 'student', 
        _id: 'user_' + Date.now() 
    };
    
    localStorage.setItem('jt_user', JSON.stringify(currentUser));
    updateUserUI(true);
    closeModal('loginModal');
    showToast('登录成功！', 'success');
    
    document.getElementById('loginForm').reset();
}

// 处理学员注册
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        alert('请填写完整信息');
        return;
    }
    
    if (password.length < 6) {
        alert('密码至少6位');
        return;
    }
    
    // 模拟注册成功
    currentUser = { 
        username: name, 
        email: email, 
        role: 'student', 
        _id: 'user_' + Date.now() 
    };
    
    localStorage.setItem('jt_user', JSON.stringify(currentUser));
    updateUserUI(true);
    closeModal('loginModal');
    showToast('注册成功！', 'success');
    
    document.getElementById('registerForm').reset();
}

// 处理教师注册
function handleTeacherRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('teacherName').value;
    const email = document.getElementById('teacherEmail').value;
    const password = document.getElementById('teacherPassword').value;
    const confirmPassword = document.getElementById('teacherConfirmPassword').value;
    const code = document.getElementById('teacherCode').value;
    
    if (!name || !email || !password || !confirmPassword || !code) {
        alert('请填写完整信息');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次密码不一致');
        return;
    }
    
    if (code !== 'JT2026') {
        alert('教师码错误，请联系管理员获取正确码');
        return;
    }
    
    // 模拟注册成功
    currentUser = { 
        username: name, 
        email: email, 
        role: 'teacher', 
        _id: 'user_' + Date.now() 
    };
    
    localStorage.setItem('jt_user', JSON.stringify(currentUser));
    updateUserUI(true);
    closeModal('loginModal');
    showToast('教师注册成功！', 'success');
    
    document.getElementById('teacherForm').reset();
}

// 退出登录
function logout() {
    localStorage.removeItem('jt_user');
    localStorage.removeItem('jt_admin');
    currentUser = null;
    updateUserUI(false);
    showToast('已退出登录', 'info');
    window.location.href = 'index.html';
}

// Toast 提示
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}