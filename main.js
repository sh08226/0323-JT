/* ================================================
   沈阳嘉桐科技有限公司 - 主交互逻辑
   嘉心筑梦，桐启新章
   ================================================ */

let currentUser = null; // 当前登录用户

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', async function () {
    const ok = initCloudBase();
    if (!ok) {
        showToast('网络初始化失败，部分功能不可用', 'error');
    }
    initNavbar();
    initMobileMenu();
    initTabs();
    initFAQ();
    await checkAndRestoreLogin();
    initPageSpecific();
});

// 各页面专属初始化
function initPageSpecific() {
    const page = location.pathname.split('/').pop() || 'index.html';
    if (page === 'wishwall.html') loadWishwall();
    if (page === 'classes.html') loadClasses();
    if (page === 'contact.html') initContactForm();
    if (page === 'admin.html') initAdminPage();
    initStatsAnimation();
}

// ==================== 导航栏 ====================

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu   = document.getElementById('navMenu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => menu.classList.toggle('active'));
    }
}

// ==================== 登录状态恢复 ====================

async function checkAndRestoreLogin() {
    try {
        const user = await getLoginState();
        if (user) {
            currentUser = user;
            renderNavUser();
        }
    } catch (e) { /* 未登录 */ }
}

function renderNavUser() {
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const userNameEl = document.getElementById('userName');
    if (!navAuth || !navUser) return;

    if (currentUser) {
        navAuth.style.display = 'none';
        navUser.style.display = 'flex';
        if (userNameEl) {
            const roleTag = currentUser.role === 'admin' ? ' 👑' : currentUser.role === 'teacher' ? ' 🎓' : '';
            userNameEl.textContent = (currentUser.username || currentUser.email) + roleTag;
        }
        // 管理员显示后台入口
        const adminLink = document.getElementById('adminLink');
        if (adminLink) adminLink.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
    } else {
        navAuth.style.display = 'flex';
        navUser.style.display = 'none';
    }
}

// ==================== 登录弹窗 ====================

function showLoginModal() {
    openModal('loginModal');
}
function closeLoginModal() {
    closeModal('loginModal');
}
function showRegisterModal() {
    closeModal('loginModal');
    openModal('registerModal');
}
function closeRegisterModal() {
    closeModal('registerModal');
}
function switchToLogin() {
    closeModal('registerModal');
    closeModal('teacherRegisterModal');
    openModal('loginModal');
}
function switchToRegister() {
    closeModal('loginModal');
    openModal('registerModal');
}
function showTeacherRegisterModal() {
    closeModal('registerModal');
    openModal('teacherRegisterModal');
}
function closeTeacherRegisterModal() {
    closeModal('teacherRegisterModal');
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { showToast('请输入邮箱和密码', 'error'); return; }

    showLoadingBtn('loginSubmitBtn', '登录中...');
    const res = await loginUser(email, password);
    hideLoadingBtn('loginSubmitBtn', '登录');

    if (res.success) {
        currentUser = res.user;
        renderNavUser();
        closeModal('loginModal');
        showToast(`欢迎回来，${currentUser.username || '用户'}！`, 'success');
        // 管理员跳后台
        if (currentUser.role === 'admin') {
            setTimeout(() => { window.location.href = 'admin.html'; }, 800);
        } else {
            setTimeout(() => location.reload(), 500);
        }
    } else {
        showToast(res.message || '登录失败', 'error');
    }
}

// 处理学员注册
async function handleRegister(event) {
    event.preventDefault();
    const username  = document.getElementById('registerUsername').value.trim();
    const email     = document.getElementById('registerEmail').value.trim();
    const password  = document.getElementById('registerPassword').value;
    const password2 = document.getElementById('registerConfirmPassword').value;

    if (!username || !email || !password) { showToast('请填写所有字段', 'error'); return; }
    if (password !== password2) { showToast('两次密码不一致', 'error'); return; }
    if (password.length < 6)   { showToast('密码至少6位', 'error'); return; }

    showLoadingBtn('registerSubmitBtn', '注册中...');
    const res = await registerUser(email, password, username, 'student');
    hideLoadingBtn('registerSubmitBtn', '注册');

    if (res.success) {
        showToast('注册成功！请登录', 'success');
        closeModal('registerModal');
        openModal('loginModal');
    } else {
        showToast(res.message || '注册失败', 'error');
    }
}

// 处理教师注册
async function handleTeacherRegister(event) {
    event.preventDefault();
    const username  = document.getElementById('teacherUsername').value.trim();
    const email     = document.getElementById('teacherEmail').value.trim();
    const password  = document.getElementById('teacherPassword').value;
    const password2 = document.getElementById('teacherConfirmPassword').value;
    const code      = document.getElementById('teacherCode').value.trim();

    if (code !== 'JT2026') { showToast('教师码错误，请联系管理员获取', 'error'); return; }
    if (!username || !email || !password) { showToast('请填写所有字段', 'error'); return; }
    if (password !== password2) { showToast('两次密码不一致', 'error'); return; }
    if (password.length < 6)   { showToast('密码至少6位', 'error'); return; }

    showLoadingBtn('teacherRegisterBtn', '注册中...');
    const res = await registerUser(email, password, username, 'teacher');
    hideLoadingBtn('teacherRegisterBtn', '教师注册');

    if (res.success) {
        showToast('教师账号注册成功！请登录', 'success');
        closeModal('teacherRegisterModal');
        openModal('loginModal');
    } else {
        showToast(res.message || '注册失败', 'error');
    }
}

// 退出登录
async function logout() {
    await logoutUser();
    currentUser = null;
    renderNavUser();
    showToast('已退出登录', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 600);
}

// ==================== 心愿墙 ====================

async function loadWishwall() {
    const grid = document.getElementById('wishwallGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>';

    const wishes = await getApprovedWishes();
    if (wishes.length === 0) {
        grid.innerHTML = '<div class="empty-tip"><i class="fas fa-lightbulb"></i><p>还没有创意，快来第一个发布吧！</p></div>';
        return;
    }

    const icons  = ['fa-rocket','fa-robot','fa-brain','fa-lightbulb','fa-microscope','fa-dna','fa-satellite','fa-microchip'];
    const colors = ['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2'];

    grid.innerHTML = wishes.map((wish, i) => {
        const icon  = icons[i % icons.length];
        const color = colors[i % colors.length];
        const rot   = ((i % 5) - 2) * 1.5;
        const date  = wish.createdAt ? new Date(wish.createdAt).toLocaleDateString('zh-CN') : '';
        const tags  = (wish.tags || []).map(t => `<span class="wish-tag">${t}</span>`).join('');
        return `
        <div class="wish-sticker" style="--rot:${rot}deg" onclick="showWishDetail('${wish._id}')">
            <div class="sticker-icon" style="color:${color}"><i class="fas ${icon}"></i></div>
            <h4 class="sticker-title">${wish.title}</h4>
            <p class="sticker-desc">${wish.content.substring(0, 60)}${wish.content.length > 60 ? '...' : ''}</p>
            <div class="sticker-tags">${tags}</div>
            <div class="sticker-footer">
                <span class="sticker-author"><i class="fas fa-user"></i> ${wish.authorName}</span>
                <span class="sticker-date">${date}</span>
            </div>
        </div>`;
    }).join('');
}

function checkAndPostWish() {
    if (!currentUser) {
        showToast('请先登录后再发布创意', 'warning');
        showLoginModal();
        return;
    }
    openModal('postWishModal');
}

function closePostWishModal() { closeModal('postWishModal'); }

async function handlePostWish(event) {
    event.preventDefault();
    if (!currentUser) { showToast('请先登录', 'error'); return; }

    const title   = document.getElementById('wishTitle').value.trim();
    const content = document.getElementById('wishContent').value.trim();
    const tags    = Array.from(document.querySelectorAll('input[name="tag"]:checked')).map(c => c.value);

    if (!title || !content) { showToast('请填写标题和内容', 'error'); return; }

    showLoadingBtn('wishSubmitBtn', '提交中...');
    const res = await addWish(title, content, tags, currentUser.username || currentUser.email);
    hideLoadingBtn('wishSubmitBtn', '发布创意');

    if (res.success) {
        showToast('创意发布成功！等待管理员审核后将公开展示 🎉', 'success');
        closeModal('postWishModal');
        document.getElementById('postWishForm').reset();
    } else {
        showToast(res.message || '发布失败', 'error');
    }
}

async function showWishDetail(id) {
    // 简单弹窗展示详情
    const res = await db.collection('wishes').doc(id).get();
    if (!res.data) return;
    const w = res.data;
    const tags = (w.tags || []).map(t => `<span class="wish-tag">${t}</span>`).join('');
    document.getElementById('wishDetailTitle').textContent = w.title;
    document.getElementById('wishDetailContent').textContent = w.content;
    document.getElementById('wishDetailTags').innerHTML = tags;
    document.getElementById('wishDetailAuthor').textContent = w.authorName;
    document.getElementById('wishDetailDate').textContent = w.createdAt ? new Date(w.createdAt).toLocaleDateString('zh-CN') : '';
    openModal('wishDetailModal');
}
function closeWishDetailModal() { closeModal('wishDetailModal'); }

// ==================== 班级系统 ====================

async function loadClasses() {
    const container = document.getElementById('classesContainer');
    if (!container) return;

    if (!currentUser) {
        container.innerHTML = `
        <div class="login-required">
            <i class="fas fa-lock"></i>
            <p>请登录后查看研学班级</p>
            <button class="btn btn-primary" onclick="showLoginModal()">立即登录</button>
        </div>`;
        return;
    }

    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>';
    const classes = await getApprovedClasses();

    if (classes.length === 0) {
        container.innerHTML = `
        <div class="empty-tip">
            <i class="fas fa-users"></i>
            <p>暂无开放班级</p>
            ${currentUser.role === 'teacher' ? '<button class="btn btn-primary" onclick="showApplyClassModal()">申请创建班级</button>' : ''}
        </div>`;
        return;
    }

    container.innerHTML = classes.map(cls => `
        <div class="class-card">
            <div class="class-header">
                <div class="class-subject-badge">${cls.subject || '综合'}</div>
                <h3>${cls.name}</h3>
            </div>
            <p class="class-desc">${cls.description || '暂无描述'}</p>
            <div class="class-info">
                <span><i class="fas fa-chalkboard-teacher"></i> ${cls.teacherName}</span>
                <span><i class="fas fa-users"></i> ${(cls.members || []).length} 人</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="showJoinClassModal('${cls._id}')">
                <i class="fas fa-sign-in-alt"></i> 加入班级
            </button>
        </div>
    `).join('');
}

function showApplyClassModal() {
    if (!currentUser) { showToast('请先登录', 'error'); showLoginModal(); return; }
    if (currentUser.role === 'student') {
        showToast('只有教师账号才能申请创建班级', 'warning');
        return;
    }
    openModal('applyClassModal');
}
function closeApplyClassModal() { closeModal('applyClassModal'); }

async function handleApplyClass(event) {
    event.preventDefault();
    const name    = document.getElementById('className').value.trim();
    const subject = document.getElementById('classSubject').value;
    const desc    = document.getElementById('classDesc').value.trim();

    if (!name || !subject) { showToast('请填写班级名称和科目', 'error'); return; }

    showLoadingBtn('applyClassBtn', '提交中...');
    const res = await applyCreateClass(name, desc, subject, currentUser.username || currentUser.email);
    hideLoadingBtn('applyClassBtn', '提交申请');

    if (res.success) {
        showToast('申请已提交！等待管理员审批 🎉', 'success');
        closeModal('applyClassModal');
        document.getElementById('applyClassForm').reset();
    } else {
        showToast(res.message || '申请失败', 'error');
    }
}

function showJoinClassModal(classId) {
    if (!currentUser) { showToast('请先登录', 'error'); showLoginModal(); return; }
    document.getElementById('joinClassId').value = classId;
    openModal('joinClassModal');
}
function closeJoinClassModal() { closeModal('joinClassModal'); }

async function handleJoinClass(event) {
    event.preventDefault();
    const classId   = document.getElementById('joinClassId').value;
    const classCode = document.getElementById('joinClassCode').value.trim();

    if (!classCode) { showToast('请输入班级码', 'error'); return; }

    showLoadingBtn('joinClassBtn', '加入中...');
    const res = await joinClass(classId, classCode);
    hideLoadingBtn('joinClassBtn', '加入班级');

    if (res.success) {
        showToast('加入班级成功！', 'success');
        closeModal('joinClassModal');
        loadClasses();
    } else {
        showToast(res.message || '加入失败', 'error');
    }
}

// ==================== 联系表单 ====================

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name    = form.querySelector('[name="name"]').value.trim();
        const phone   = form.querySelector('[name="phone"]').value.trim();
        const email   = form.querySelector('[name="email"]').value.trim();
        const type    = form.querySelector('[name="type"]').value;
        const content = form.querySelector('[name="message"]').value.trim();

        if (!name || !email || !content) { showToast('请填写必要信息', 'error'); return; }

        showLoadingBtn('contactSubmitBtn', '提交中...');
        const res = await submitMessage(name, phone, email, type, content);
        hideLoadingBtn('contactSubmitBtn', '提交留言');

        if (res.success) {
            showToast('留言提交成功！我们将尽快与您联系 ✉️', 'success');
            form.reset();
        } else {
            showToast('提交失败，请稍后重试', 'error');
        }
    });
}

// ==================== 管理员后台 ====================

async function initAdminPage() {
    if (!currentUser || currentUser.role !== 'admin') {
        document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:1rem;">
            <i class="fas fa-lock" style="font-size:3rem;color:#ef4444;"></i>
            <h2>无权访问</h2>
            <p>请使用管理员账号登录</p>
            <a href="index.html" class="btn btn-primary">返回首页</a>
        </div>`;
        return;
    }
    loadAdminDashboard();
}

async function loadAdminDashboard() {
    const [pendingWishes, pendingClasses, allUsers, allMessages] = await Promise.all([
        getPendingWishes(),
        getPendingClasses(),
        getAllUsers(),
        getAllMessages()
    ]);

    // 统计数据
    setEl('statPendingWishes', pendingWishes.length);
    setEl('statPendingClasses', pendingClasses.length);
    setEl('statTotalUsers', allUsers.length);
    setEl('statTotalMessages', allMessages.length);

    // 渲染待审核心愿
    renderAdminWishes(pendingWishes);
    // 渲染待审批班级
    renderAdminClasses(pendingClasses);
    // 渲染用户列表
    renderAdminUsers(allUsers);
    // 渲染留言列表
    renderAdminMessages(allMessages);
}

function renderAdminWishes(wishes) {
    const tbody = document.getElementById('wishesTableBody');
    if (!tbody) return;
    if (wishes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">暂无待审核创意</td></tr>';
        return;
    }
    tbody.innerHTML = wishes.map(w => `
        <tr>
            <td>${w.title}</td>
            <td>${w.authorName || '-'}</td>
            <td>${w.content ? w.content.substring(0, 40) + '...' : '-'}</td>
            <td>${w.createdAt ? new Date(w.createdAt).toLocaleDateString('zh-CN') : '-'}</td>
            <td class="action-btns">
                <button class="btn btn-success btn-xs" onclick="adminApproveWish('${w._id}')"><i class="fas fa-check"></i> 通过</button>
                <button class="btn btn-danger btn-xs" onclick="adminRejectWish('${w._id}')"><i class="fas fa-times"></i> 拒绝</button>
            </td>
        </tr>`).join('');
}

function renderAdminClasses(classes) {
    const tbody = document.getElementById('classesTableBody');
    if (!tbody) return;
    if (classes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">暂无待审批班级</td></tr>';
        return;
    }
    tbody.innerHTML = classes.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.teacherName || '-'}</td>
            <td>${c.subject || '-'}</td>
            <td>${c.description ? c.description.substring(0, 40) : '-'}</td>
            <td class="action-btns">
                <button class="btn btn-success btn-xs" onclick="adminApproveClass('${c._id}')"><i class="fas fa-check"></i> 批准</button>
                <button class="btn btn-danger btn-xs" onclick="adminRejectClass('${c._id}')"><i class="fas fa-times"></i> 拒绝</button>
            </td>
        </tr>`).join('');
}

function renderAdminUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">暂无用户数据</td></tr>';
        return;
    }
    const roleMap = { admin:'管理员', teacher:'教师', student:'学员' };
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.username || '-'}</td>
            <td>${u.email || '-'}</td>
            <td><span class="role-badge role-${u.role}">${roleMap[u.role] || u.role}</span></td>
            <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString('zh-CN') : '-'}</td>
            <td class="action-btns">
                ${u.role !== 'admin' ? `<button class="btn btn-primary btn-xs" onclick="adminSetAdmin('${u.uid}')">设为管理员</button>` : ''}
            </td>
        </tr>`).join('');
}

function renderAdminMessages(messages) {
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) return;
    if (messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">暂无留言</td></tr>';
        return;
    }
    tbody.innerHTML = messages.map(m => `
        <tr>
            <td>${m.name || '-'}</td>
            <td>${m.phone || '-'}</td>
            <td>${m.type || '-'}</td>
            <td>${m.content ? m.content.substring(0, 40) : '-'}</td>
            <td>${m.createdAt ? new Date(m.createdAt).toLocaleDateString('zh-CN') : '-'}</td>
        </tr>`).join('');
}

async function adminApproveWish(id) {
    await reviewWish(id, 'approve');
    showToast('已通过审核', 'success');
    loadAdminDashboard();
}
async function adminRejectWish(id) {
    if (!confirm('确定拒绝并删除这条创意吗？')) return;
    await reviewWish(id, 'reject');
    showToast('已拒绝', 'success');
    loadAdminDashboard();
}
async function adminApproveClass(id) {
    await reviewClass(id, 'approve');
    showToast('班级已批准', 'success');
    loadAdminDashboard();
}
async function adminRejectClass(id) {
    if (!confirm('确定拒绝这个班级申请吗？')) return;
    await reviewClass(id, 'reject');
    showToast('已拒绝', 'success');
    loadAdminDashboard();
}
async function adminSetAdmin(uid) {
    if (!confirm('确定将该用户设为管理员吗？')) return;
    const res = await setUserAdmin(uid);
    if (res.success) { showToast('已设置为管理员', 'success'); loadAdminDashboard(); }
    else showToast(res.message, 'error');
}

// 切换后台标签页
function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-sidebar-link').forEach(a => a.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    const link = document.querySelector(`[data-tab="${tabId}"]`);
    if (link) link.classList.add('active');
}

// ==================== 工具函数 ====================

function openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
}

function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function showLoadingBtn(id, text) {
    const btn = document.getElementById(id);
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`; }
}
function hideLoadingBtn(id, text) {
    const btn = document.getElementById(id);
    if (btn) { btn.disabled = false; btn.textContent = text; }
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    const icons = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-circle', info:'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    toast.className = `toast toast-${type} show`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// 关闭弹窗点击背景
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Tab 切换
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const group = this.closest('.tab-group') || document;
            group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.dataset.tab;
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(targetId);
            if (panel) panel.classList.add('active');
        });
    });
}

// FAQ
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function () {
            const item = this.closest('.faq-item');
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });
}

// 数字动画
function initStatsAnimation() {
    const nums = document.querySelectorAll('.stat-num[data-target]');
    if (nums.length === 0) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNum(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    nums.forEach(n => observer.observe(n));
}
function animateNum(el) {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + (el.dataset.suffix || '+');
        if (current >= target) clearInterval(timer);
    }, 16);
}
