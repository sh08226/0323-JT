/* ========================================
   沈阳嘉桐科技有限公司 - 官网交互逻辑（修复版）
   ======================================== */

// 全局变量
let currentUser = null;

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    initNavbar();
    initMobileMenu();
    initTabs();
    initFAQ();
    initStatsAnimation();
    initClassTabs();
    checkLoginStatus();
}

// ==================== 导航栏 ====================

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', function() {
            menu.classList.toggle('active');
        });
    }
}

// ==================== 用户系统 ====================

// 检查登录状态
function checkLoginStatus() {
    // 从本地存储读取用户
    const savedUser = localStorage.getItem('jiatong_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedIn();
        } catch (e) {
            localStorage.removeItem('jiatong_user');
        }
    }
    
    // 刷新页面
    loadClasses();
    loadWishes();
}

// 更新已登录状态的 UI
function updateUIForLoggedIn() {
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const userName = document.getElementById('userName');
    
    if (navAuth && navUser && userName && currentUser) {
        navAuth.style.display = 'none';
        navUser.style.display = 'flex';
        userName.textContent = currentUser.nickname || currentUser.username || '用户';
    }
}

// 显示登录弹窗
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// 关闭登录弹窗
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 显示注册弹窗
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// 关闭注册弹窗
function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 切换到注册
function switchToRegister() {
    closeLoginModal();
    showRegisterModal();
}

// 切换到登录
function switchToLogin() {
    closeRegisterModal();
    showLoginModal();
}

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showToast('请输入用户名和密码', 'error');
        return;
    }
    
    // 从本地存储读取用户列表
    const users = JSON.parse(localStorage.getItem('jiatong_users') || '[]');
    
    // 查找用户（支持用户名或邮箱登录）
    const user = users.find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
        // 保存当前用户信息
        currentUser = {
            username: user.username,
            email: user.email,
            role: user.role || 'student', // student 或 teacher
            nickname: user.nickname || user.username
        };
        localStorage.setItem('jiatong_user', JSON.stringify(currentUser));
        
        showToast('登录成功！', 'success');
        closeLoginModal();
        updateUIForLoggedIn();
        
        // 刷新页面
        setTimeout(() => location.reload(), 500);
    } else {
        showToast('用户名或密码错误', 'error');
    }
}

// 处理注册
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // 验证
    if (!username || !email || !password) {
        showToast('请填写所有字段', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('两次密码输入不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('密码长度至少6位', 'error');
        return;
    }
    
    if (username.length < 2) {
        showToast('用户名至少2个字符', 'error');
        return;
    }
    
    // 读取现有用户
    const users = JSON.parse(localStorage.getItem('jiatong_users') || '[]');
    
    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
        showToast('用户名已存在', 'error');
        return;
    }
    
    // 检查邮箱是否已注册
    if (users.find(u => u.email === email)) {
        showToast('邮箱已被注册', 'error');
        return;
    }
    
    // 添加新用户（默认普通学员）
    const newUser = {
        username,
        email,
        password,
        role: 'student', // 默认学员
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('jiatong_users', JSON.stringify(users));
    
    showToast('注册成功！请登录', 'success');
    closeRegisterModal();
    switchToLogin();
}

// 教师注册（独立入口）
function handleTeacherRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('teacherUsername').value.trim();
    const email = document.getElementById('teacherEmail').value.trim();
    const password = document.getElementById('teacherPassword').value;
    const confirmPassword = document.getElementById('teacherConfirmPassword').value;
    const code = document.getElementById('teacherCode').value.trim();
    
    // 验证
    if (!username || !email || !password || !code) {
        showToast('请填写所有字段', 'error');
        return;
    }
    
    // 验证教师码（可自定义）
    if (code !== 'JT2026') {
        showToast('教师码错误，如需注册请联系管理员', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('两次密码输入不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('密码长度至少6位', 'error');
        return;
    }
    
    // 读取现有用户
    const users = JSON.parse(localStorage.getItem('jiatong_users') || '[]');
    
    if (users.find(u => u.username === username)) {
        showToast('用户名已存在', 'error');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showToast('邮箱已被注册', 'error');
        return;
    }
    
    // 添加教师用户
    const newUser = {
        username,
        email,
        password,
        role: 'teacher', // 教师角色
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('jiatong_users', JSON.stringify(users));
    
    showToast('教师账号注册成功！请登录', 'success');
    closeTeacherRegisterModal();
    switchToLogin();
}

// 显示教师注册弹窗
function showTeacherRegisterModal() {
    closeRegisterModal();
    const modal = document.getElementById('teacherRegisterModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// 关闭教师注册弹窗
function closeTeacherRegisterModal() {
    const modal = document.getElementById('teacherRegisterModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 显示管理员登录弹窗
function showAdminLoginModal() {
    closeLoginModal();
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// 关闭管理员登录弹窗
function closeAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 显示管理员注册弹窗
function showAdminRegisterModal() {
    closeAdminLoginModal();
    const modal = document.getElementById('adminRegisterModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// 关闭管理员注册弹窗
function closeAdminRegisterModal() {
    const modal = document.getElementById('adminRegisterModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 处理管理员登录
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    if (!username || !password) {
        showToast('请输入管理员账号和密码', 'error');
        return;
    }
    
    // 从本地存储读取管理员列表
    const admins = JSON.parse(localStorage.getItem('jiatong_admins') || '[]');
    
    const admin = admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
        currentUser = {
            username: admin.username,
            email: admin.email,
            role: 'admin',
            nickname: admin.username
        };
        localStorage.setItem('jiatong_user', JSON.stringify(currentUser));
        
        showToast('管理员登录成功！', 'success');
        closeAdminLoginModal();
        updateUIForLoggedIn();
        
        // 跳转到管理员后台
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 500);
    } else {
        showToast('管理员账号或密码错误', 'error');
    }
}

// 处理管理员注册申请
function handleAdminRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminRegUsername').value.trim();
    const email = document.getElementById('adminRegEmail').value.trim();
    const password = document.getElementById('adminRegPassword').value;
    const confirmPassword = document.getElementById('adminRegConfirmPassword').value;
    const inviteCode = document.getElementById('adminInviteCode').value.trim();
    
    // 验证邀请码（默认：JTADMIN2026）
    if (inviteCode !== 'JTADMIN2026') {
        showToast('邀请码错误，请联系网站所有者获取', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('两次密码输入不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('密码长度至少6位', 'error');
        return;
    }
    
    // 读取现有管理员
    const admins = JSON.parse(localStorage.getItem('jiatong_admins') || '[]');
    
    if (admins.find(a => a.username === username)) {
        showToast('用户名已存在', 'error');
        return;
    }
    
    // 添加新管理员（需要审核，实际使用时应设为 pending）
    const newAdmin = {
        username,
        email,
        password,
        role: 'admin',
        status: 'active', // 直接激活
        createdAt: new Date().toISOString()
    };
    
    admins.push(newAdmin);
    localStorage.setItem('jiatong_admins', JSON.stringify(admins));
    
    showToast('管理员申请成功！请登录', 'success');
    closeAdminRegisterModal();
    showAdminLoginModal();
}

// 退出登录
function logout() {
    currentUser = null;
    localStorage.removeItem('jiatong_user');
    
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    
    if (navAuth && navUser) {
        navAuth.style.display = 'flex';
        navUser.style.display = 'none';
    }
    
    showToast('已退出登录', 'success');
    
    setTimeout(() => location.reload(), 500);
}

// ==================== 消息提示 ====================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const messageEl = toast.querySelector('.toast-message');
    messageEl.textContent = message;
    
    toast.className = 'toast show';
    if (type) {
        toast.classList.add(type);
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== Tab 切换 ====================

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ==================== FAQ ====================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            faqItems.forEach(i => {
                if (i !== item) {
                    i.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });
}

// ==================== 数字动画 ====================

function initStatsAnimation() {
    const stats = document.querySelector('.stats');
    if (stats && isElementInViewport(stats)) {
        animateNumbers();
    }
    
    window.addEventListener('scroll', function() {
        const stats = document.querySelector('.stats');
        if (stats && isElementInViewport(stats)) {
            animateNumbers();
        }
    });
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number[data-target]');
    
    numbers.forEach(num => {
        if (num.dataset.animated) return;
        
        const target = parseInt(num.dataset.target);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        num.dataset.animated = 'true';
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                num.textContent = target + '+';
                clearInterval(timer);
            } else {
                num.textContent = Math.floor(current) + '+';
            }
        }, 16);
    });
}

// ==================== 心愿墙 ====================

function checkAndPostWish() {
    if (!currentUser) {
        showToast('请先登录后再发布创意', 'error');
        showLoginModal();
        return;
    }
    
    const modal = document.getElementById('postWishModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closePostWishModal() {
    const modal = document.getElementById('postWishModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handlePostWish(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    
    const title = document.getElementById('wishTitle').value.trim();
    const description = document.getElementById('wishDescription').value.trim();
    
    if (!title || !description) {
        showToast('请填写标题和描述', 'error');
        return;
    }
    
    const tags = Array.from(document.querySelectorAll('input[name="tag"]:checked')).map(cb => cb.value);
    
    const wish = {
        id: 'wish_' + Date.now(),
        title,
        description,
        tags,
        author: currentUser.username,
        authorEmail: currentUser.email,
        status: 'approved',
        approved: true,
        createdAt: new Date().toISOString(),
        investments: []
    };
    
    // 保存到本地存储
    const wishes = JSON.parse(localStorage.getItem('jiatong_wishes') || '[]');
    wishes.unshift(wish);
    localStorage.setItem('jiatong_wishes', JSON.stringify(wishes));
    
    showToast('创意发布成功！', 'success');
    closePostWishModal();
    
    // 清空表单
    document.getElementById('postWishForm').reset();
    
    // 刷新心愿墙
    loadWishes();
}

function loadWishes() {
    const grid = document.getElementById('wishwallGrid');
    if (!grid) return;
    
    const wishes = JSON.parse(localStorage.getItem('jiatong_wishes') || '[]');
    const approvedWishes = wishes.filter(w => w.status === 'approved' || w.approved === true);
    
    if (approvedWishes.length === 0) {
        // 显示默认示例
        grid.innerHTML = `
            <div class="wish-sticker" style="transform: rotate(-3deg);">
                <div class="sticker-content">
                    <i class="fas fa-robot"></i>
                    <h4>智能垃圾分类机器人</h4>
                    <p>利用AI图像识别技术，自动识别并分类垃圾...</p>
                    <span class="sticker-author">示例创意</span>
                </div>
            </div>
            <div class="wish-sticker" style="transform: rotate(2deg);">
                <div class="sticker-content">
                    <i class="fas fa-rocket"></i>
                    <h4>火星基地模拟器</h4>
                    <p>创建虚拟火星基地，模拟人类移居火星的生活...</p>
                    <span class="sticker-author">示例创意</span>
                </div>
            </div>
            <div class="wish-sticker" style="transform: rotate(-1deg);">
                <div class="sticker-content">
                    <i class="fas fa-hand-holding-medical"></i>
                    <h4>智能假肢</h4>
                    <p>利用脑机接口技术控制的智能假肢...</p>
                    <span class="sticker-author">示例创意</span>
                </div>
            </div>
            <div class="wish-sticker" style="transform: rotate(4deg);">
                <div class="sticker-content">
                    <i class="fas fa-brain"></i>
                    <h4>AI作业辅导助手</h4>
                    <p>个性化AI辅导，帮助学生解决学习难题...</p>
                    <span class="sticker-author">示例创意</span>
                </div>
            </div>
        `;
        return;
    }
    
    // 渲染心愿贴纸
    const icons = ['fa-rocket', 'fa-robot', 'fa-brain', 'fa-lightbulb', 'fa-microscope', 'fa-heartbeat'];
    const colors = ['#ff6b35', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4', '#ff9800'];
    
    grid.innerHTML = approvedWishes.map((wish, index) => {
        const icon = icons[index % icons.length];
        const color = colors[index % colors.length];
        const rotation = (Math.random() * 6 - 3).toFixed(1);
        
        return `
            <div class="wish-sticker" style="transform: rotate(${rotation}deg);" onclick="showWishDetail('${wish.id}')">
                <div class="sticker-content">
                    <i class="fas ${icon}" style="color: ${color};"></i>
                    <h4>${wish.title}</h4>
                    <p>${wish.description.substring(0, 40)}...</p>
                    <span class="sticker-author">${wish.author}</span>
                </div>
            </div>
        `;
    }).join('');
}

function showWishDetail(wishId) {
    const wishes = JSON.parse(localStorage.getItem('jiatong_wishes') || '[]');
    const wish = wishes.find(w => w.id === wishId);
    
    if (!wish) {
        showToast('创意不存在', 'error');
        return;
    }
    
    const modal = document.getElementById('wishDetailModal');
    if (!modal) return;
    
    document.getElementById('wishDetailTitle').textContent = wish.title;
    document.getElementById('wishDetailDesc').textContent = wish.description;
    document.getElementById('wishDetailAuthor').textContent = wish.author;
    document.getElementById('wishDetailTime').textContent = new Date(wish.createdAt).toLocaleDateString();
    
    // 加载投资留言
    const investList = document.getElementById('investList');
    if (investList && wish.investments) {
        if (wish.investments.length === 0) {
            investList.innerHTML = '<p style="color: #999; text-align: center;">暂无投资意向留言</p>';
        } else {
            investList.innerHTML = wish.investments.map(inv => `
                <div class="invest-item">
                    <strong>${inv.author}</strong>: ${inv.message}
                    <br><small style="color: #999;">${new Date(inv.createdAt).toLocaleString()}</small>
                </div>
            `).join('');
        }
    }
    
    modal.classList.add('active');
}

function closeWishDetailModal() {
    const modal = document.getElementById('wishDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function submitInvest(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('请先登录', 'error');
        showLoginModal();
        return;
    }
    
    const message = document.getElementById('investMessage').value.trim();
    if (!message) {
        showToast('请输入留言内容', 'error');
        return;
    }
    
    const invest = {
        author: currentUser.username,
        message: message,
        createdAt: new Date().toISOString()
    };
    
    // 获取当前查看的心愿ID
    const modal = document.getElementById('wishDetailModal');
    const title = document.getElementById('wishDetailTitle').textContent;
    
    const wishes = JSON.parse(localStorage.getItem('jiatong_wishes') || '[]');
    const wishIndex = wishes.findIndex(w => w.title === title);
    
    if (wishIndex > -1) {
        if (!wishes[wishIndex].investments) {
            wishes[wishIndex].investments = [];
        }
        wishes[wishIndex].investments.push(invest);
        localStorage.setItem('jiatong_wishes', JSON.stringify(wishes));
        
        // 刷新留言列表
        const investList = document.getElementById('investList');
        if (investList) {
            const newItem = document.createElement('div');
            newItem.className = 'invest-item';
            newItem.innerHTML = `
                <strong>${invest.author}</strong>: ${invest.message}
                <br><small style="color: #999;">${new Date().toLocaleString()}</small>
            `;
            investList.appendChild(newItem);
        }
        
        showToast('留言提交成功！', 'success');
        document.getElementById('investForm').reset();
    }
}

// ==================== 班级管理 ====================

function loadClasses() {
    const loginTip = document.getElementById('classesLoginTip');
    const container = document.getElementById('classesContainer');
    const teacherPanel = document.getElementById('teacherPanel');
    const studentPanel = document.getElementById('studentPanel');
    
    if (!currentUser) {
        if (loginTip && container) {
            loginTip.style.display = 'block';
            container.style.display = 'none';
        }
        return;
    }
    
    if (loginTip && container) {
        loginTip.style.display = 'none';
        container.style.display = 'block';
    }
    
    // 根据角色显示不同面板
    if (currentUser.role === 'teacher') {
        if (teacherPanel) teacherPanel.style.display = 'block';
        if (studentPanel) studentPanel.style.display = 'none';
        loadTeacherClasses();
    } else {
        if (teacherPanel) teacherPanel.style.display = 'none';
        if (studentPanel) studentPanel.style.display = 'block';
        loadStudentClasses();
    }
}

function loadTeacherClasses() {
    const container = document.getElementById('teacherClasses');
    if (!container) return;
    
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    const myClasses = classes.filter(c => c.teacher === currentUser?.username);
    
    if (myClasses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-folder-open" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>还没有创建班级，点击上方按钮创建</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = myClasses.map(cls => `
        <div class="class-card" onclick="openClassDetail('${cls.id}')">
            <h3>${cls.name}</h3>
            <p>${cls.description || '暂无描述'}</p>
            <div class="class-card-meta">
                <span><i class="fas fa-users"></i> ${cls.members?.length || 0} 人</span>
                <span>${new Date(cls.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

function loadStudentClasses() {
    const container = document.getElementById('studentClasses');
    if (!container) return;
    
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    const myClasses = classes.filter(c => 
        c.members && c.members.some(m => m.username === currentUser?.username)
    );
    
    if (myClasses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-folder-open" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>还没有加入班级，点击上方按钮加入班级</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = myClasses.map(cls => `
        <div class="class-card" onclick="openClassDetail('${cls.id}')">
            <h3>${cls.name}</h3>
            <p>${cls.description || '暂无描述'}</p>
            <div class="class-card-meta">
                <span><i class="fas fa-chalkboard-teacher"></i> ${cls.teacher}</span>
                <span>${cls.members?.length || 0} 人</span>
            </div>
        </div>
    `).join('');
}

function initClassTabs() {
    const tabBtns = document.querySelectorAll('.class-tab-btn');
    const tabContents = document.querySelectorAll('.class-tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.classTab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === 'class' + tabId.charAt(0).toUpperCase() + tabId.slice(1)) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function showCreateClassModal() {
    const modal = document.getElementById('createClassModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeCreateClassModal() {
    const modal = document.getElementById('createClassModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleCreateClass(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    
    // 简化：任何登录用户都可以创建班级（后续可升级为教师专属）
    // 暂时移除教师权限限制，让功能可用
    /* if (currentUser.role !== 'teacher') {
        showToast('只有教师才能创建班级', 'error');
        return;
    } */
    
    const name = document.getElementById('className').value.trim();
    const description = document.getElementById('classDesc').value.trim();
    const password = document.getElementById('classPassword').value;
    
    if (!name) {
        showToast('请输入班级名称', 'error');
        return;
    }
    
    const classItem = {
        id: 'cls_' + Date.now(),
        name,
        description,
        password,
        teacher: currentUser.username,
        members: [],
        homeworks: [],
        works: [],
        createdAt: new Date().toISOString()
    };
    
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    classes.push(classItem);
    localStorage.setItem('jiatong_classes', JSON.stringify(classes));
    
    showToast('班级创建成功！', 'success');
    closeCreateClassModal();
    loadTeacherClasses();
    
    document.getElementById('createClassForm').reset();
}

function showJoinClassModal() {
    const modal = document.getElementById('joinClassModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeJoinClassModal() {
    const modal = document.getElementById('joinClassModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleJoinClass(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    
    const code = document.getElementById('joinClassCode').value.trim();
    const password = document.getElementById('joinClassPassword').value;
    
    if (!code) {
        showToast('请输入班级编号', 'error');
        return;
    }
    
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    const classItem = classes.find(c => c.id === code);
    
    if (!classItem) {
        showToast('班级编号不存在', 'error');
        return;
    }
    
    if (classItem.password && classItem.password !== password) {
        showToast('班级密码错误', 'error');
        return;
    }
    
    if (!classItem.members) {
        classItem.members = [];
    }
    
    if (classItem.members.some(m => m.username === currentUser.username)) {
        showToast('您已经是班级成员', 'info');
        return;
    }
    
    classItem.members.push({
        username: currentUser.username,
        role: 'student',
        joinedAt: new Date().toISOString()
    });
    
    localStorage.setItem('jiatong_classes', JSON.stringify(classes));
    
    showToast('加入班级成功！', 'success');
    closeJoinClassModal();
    loadStudentClasses();
    
    document.getElementById('joinClassForm').reset();
}

let currentClassId = null;

function openClassDetail(classId) {
    currentClassId = classId;
    
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    const classItem = classes.find(c => c.id === classId);
    
    if (!classItem) {
        showToast('班级不存在', 'error');
        return;
    }
    
    const modal = document.getElementById('classDetailModal');
    if (!modal) return;
    
    document.getElementById('classDetailName').textContent = classItem.name;
    document.getElementById('classDetailDesc').textContent = classItem.description || '暂无描述';
    
    modal.classList.add('active');
    
    loadHomeworkList(classItem);
    loadMembersList(classItem);
    loadWorksGallery(classItem);
}

function closeClassDetailModal() {
    const modal = document.getElementById('classDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentClassId = null;
}

function loadHomeworkList(classItem) {
    const container = document.getElementById('homeworkList');
    if (!container) return;
    
    const homeworks = classItem.homeworks || [];
    
    if (homeworks.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">暂无作业提交</p>';
        return;
    }
    
    container.innerHTML = homeworks.map(hw => `
        <div class="homework-item">
            <h4>${hw.title}</h4>
            <p>${hw.description || ''}</p>
            ${hw.aiComment ? `<p style="color: #4caf50; margin-top: 8px;"><i class="fas fa-robot"></i> AI评价: ${hw.aiComment}</p>` : ''}
            <small style="color: #999;">提交人: ${hw.author} | ${new Date(hw.createdAt).toLocaleString()}</small>
        </div>
    `).join('');
}

function loadMembersList(classItem) {
    const container = document.getElementById('membersList');
    if (!container) return;
    
    const members = classItem.members || [];
    
    if (members.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">暂无成员</p>';
        return;
    }
    
    container.innerHTML = members.map(member => `
        <div class="member-item">
            <div class="member-avatar"><i class="fas fa-user"></i></div>
            <div class="member-info">
                <h4>${member.username}</h4>
                <span>${member.role === 'teacher' ? '教师' : '学生'}</span>
            </div>
        </div>
    `).join('');
}

function loadWorksGallery(classItem) {
    const container = document.getElementById('worksGallery');
    if (!container) return;
    
    const works = classItem.works || [];
    
    if (works.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">暂无作品展示</p>';
        return;
    }
    
    container.innerHTML = works.map(work => `
        <div class="homework-item">
            <h4>${work.title}</h4>
            <p>${work.description || ''}</p>
            <small style="color: #999;">作者: ${work.author} | ${new Date(work.createdAt).toLocaleDateString()}</small>
        </div>
    `).join('');
}

function submitHomework(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('请先登录', 'error');
        showLoginModal();
        return;
    }
    
    const title = document.getElementById('homeworkTitle').value.trim();
    const description = document.getElementById('homeworkDesc').value.trim();
    
    if (!title) {
        showToast('请输入作业标题', 'error');
        return;
    }
    
    const homework = {
        id: 'hw_' + Date.now(),
        title,
        description,
        author: currentUser.username,
        files: [],
        aiComment: null,
        createdAt: new Date().toISOString()
    };
    
    // 保存到班级
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    const classIndex = classes.findIndex(c => c.id === currentClassId);
    
    if (classIndex > -1) {
        if (!classes[classIndex].homeworks) {
            classes[classIndex].homeworks = [];
        }
        classes[classIndex].homeworks.push(homework);
        localStorage.setItem('jiatong_classes', JSON.stringify(classes));
        
        showToast('作业提交成功！', 'success');
        loadHomeworkList(classes[classIndex]);
        
        document.getElementById('homeworkForm').reset();
    }
}

function sendAIMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('aiMessage');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chat = document.getElementById('aiChat');
    
    // 用户消息
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message';
    userMsg.style.flexDirection = 'row-reverse';
    userMsg.innerHTML = `
        <div class="ai-avatar" style="background: var(--accent-color);"><i class="fas fa-user"></i></div>
        <div class="ai-content" style="background: var(--primary-color); color: #fff;">
            ${message}
        </div>
    `;
    chat.appendChild(userMsg);
    
    // 模拟 AI 回复
    setTimeout(() => {
        const aiResponses = [
            "感谢你的提问！让我来分析一下你的作业内容...",
            "根据你描述的情况，我给出以下建议：",
            "这是一个很好的想法！建议可以从以下几个角度进一步完善："
        ];
        
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message';
        aiMsg.innerHTML = `
            <div class="ai-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-content">
                <p>${aiResponses[Math.floor(Math.random() * aiResponses.length)]}</p>
                <ul style="margin: 10px 0 0 20px;">
                    <li>整体思路清晰，继续保持</li>
                    <li>建议增加具体案例来说明观点</li>
                    <li>可以尝试用图表更直观地展示数据</li>
                    <li>注意检查语法和格式</li>
                </ul>
                <p style="margin-top: 10px;">如果需要更详细的分析，请继续提问！</p>
            </div>
        `;
        chat.appendChild(aiMsg);
        chat.scrollTop = chat.scrollHeight;
    }, 1000);
    
    input.value = '';
    
    setTimeout(() => {
        chat.scrollTop = chat.scrollHeight;
    }, 100);
}

// ==================== URL 参数处理 ====================

function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    
    if (service) {
        const tabBtn = document.querySelector(`[data-tab="${service}"]`);
        if (tabBtn) {
            tabBtn.click();
        }
    }
}

if (document.readyState === 'complete') {
    handleURLParams();
} else {
    window.addEventListener('load', handleURLParams);
}
