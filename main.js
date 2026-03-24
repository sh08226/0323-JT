/* ========================================
   沈阳嘉桐科技有限公司 - 官网交互逻辑
   ======================================== */

// 全局变量
let currentUser = null;
let db = null;
let auth = null;

// 腾讯云配置
const CLOUD_CONFIG = {
    env: 'jt-0323-3gedkxnrd4787354'
};

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // 初始化导航栏滚动效果
    initNavbar();
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 初始化 Tab 切换
    initTabs();
    
    // 初始化 FAQ
    initFAQ();
    
    // 初始化数字动画
    initStatsAnimation();
    
    // 初始化班级 Tab
    initClassTabs();
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
async function checkLoginStatus() {
    // 模拟登录检查 - 实际项目中应该连接腾讯云
    const savedUser = localStorage.getItem('jiatong_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedIn();
    }
    
    // 尝试连接腾讯云 CloudBase
    try {
        if (typeof tcb !== 'undefined') {
            const app = tcb.init(CLOUD_CONFIG);
            auth = app.auth({ persistence: 'local' });
            
            // 检查当前用户
            const loginState = await auth.getLoginState();
            if (loginState) {
                currentUser = {
                    uid: loginState.user.uid,
                    nickname: loginState.user.nickname || loginState.user.email
                };
                updateUIForLoggedIn();
            }
        }
    } catch (e) {
        console.log('CloudBase 初始化失败，使用本地存储');
    }
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
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        // 尝试腾讯云登录
        if (auth) {
            await auth.signInWithEmailAndPassword(username, password);
            showToast('登录成功！', 'success');
            closeLoginModal();
            checkLoginStatus();
            return;
        }
        
        // 本地模拟登录
        const users = JSON.parse(localStorage.getItem('jiatong_users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = { username: user.username, email: user.email };
            localStorage.setItem('jiatong_user', JSON.stringify(currentUser));
            showToast('登录成功！', 'success');
            closeLoginModal();
            updateUIForLoggedIn();
            
            // 刷新当前页面
            location.reload();
        } else {
            showToast('用户名或密码错误', 'error');
        }
    } catch (error) {
        console.error('登录失败:', error);
        showToast('登录失败，请重试', 'error');
    }
}

// 处理注册
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showToast('两次密码输入不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('密码长度至少6位', 'error');
        return;
    }
    
    try {
        // 尝试腾讯云注册
        if (auth) {
            await auth.createUserWithEmailAndPassword(email, password, { nickname: username });
            showToast('注册成功！', 'success');
            closeRegisterModal();
            checkLoginStatus();
            return;
        }
        
        // 本地模拟注册
        const users = JSON.parse(localStorage.getItem('jiatong_users') || '[]');
        
        if (users.find(u => u.username === username)) {
            showToast('用户名已存在', 'error');
            return;
        }
        
        users.push({ username, email, password });
        localStorage.setItem('jiatong_users', JSON.stringify(users));
        
        showToast('注册成功，请登录！', 'success');
        closeRegisterModal();
        switchToLogin();
    } catch (error) {
        console.error('注册失败:', error);
        showToast('注册失败，请重试', 'error');
    }
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
    
    // 刷新页面
    location.reload();
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
            
            // 更新按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新内容显示
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
            // 关闭其他打开的项
            faqItems.forEach(i => {
                if (i !== item) {
                    i.classList.remove('active');
                }
            });
            // 切换当前项
            item.classList.toggle('active');
        });
    });
}

// ==================== 数字动画 ====================

function initStatsAnimation() {
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

// 检查并发布心愿
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

// 关闭发布心愿弹窗
function closePostWishModal() {
    const modal = document.getElementById('postWishModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 处理发布心愿
async function handlePostWish(event) {
    event.preventDefault();
    
    const title = document.getElementById('wishTitle').value;
    const description = document.getElementById('wishDescription').value;
    const tags = Array.from(document.querySelectorAll('input[name="tag"]:checked')).map(cb => cb.value);
    
    const wish = {
        title,
        description,
        tags,
        author: currentUser.username,
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString(),
        investments: []
    };
    
    try {
        // 保存到本地存储（实际项目中应存到腾讯云数据库）
        const wishes = JSON.parse(localStorage.getItem('jiatong_wishes') || '[]');
        wishes.unshift(wish);
        localStorage.setItem('jiatong_wishes', JSON.stringify(wishes));
        
        showToast('创意已提交，等待审核！', 'success');
        closePostWishModal();
        
        // 清空表单
        document.getElementById('postWishForm').reset();
        
        // 刷新心愿墙
        loadWishes();
    } catch (error) {
        console.error('发布失败:', error);
        showToast('发布失败，请重试', 'error');
    }
}

// 加载心愿列表
function loadWishes() {
    const grid = document.getElementById('wishwallGrid');
    if (!grid) return;
    
    // 从本地存储加载（实际项目中应从腾讯云数据库加载）
    const wishes = JSON.parse(localStorage.getItem('jiatong_wishes') || '[]');
    const approvedWishes = wishes.filter(w => w.status === 'approved');
    
    // 如果没有已审核的心愿，显示示例
    if (approvedWishes.length === 0) {
        // 使用页面中已有的示例内容
        return;
    }
    
    // 渲染心愿贴纸
    grid.innerHTML = approvedWishes.map((wish, index) => {
        const icons = ['fa-rocket', 'fa-robot', 'fa-brain', 'fa-lightbulb', 'fa-microscope', 'fa-heartbeat'];
        const colors = ['#ff6b35', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4', '#ff9800'];
        const icon = icons[index % icons.length];
        const color = colors[index % colors.length];
        
        return `
            <div class="wish-sticker" style="transform: rotate(${(Math.random() - 0.5) * 6}deg);" onclick="showWishDetail('${wish.title}', '${wish.description}', '${wish.author}', '${wish.createdAt}')">
                <div class="sticker-content">
                    <i class="fas ${icon}" style="color: ${color};"></i>
                    <h4>${wish.title}</h4>
                    <p>${wish.description.substring(0, 50)}...</p>
                    <span class="sticker-author">${wish.author}</span>
                </div>
            </div>
        `;
    }).join('');
}

// 显示心愿详情
function showWishDetail(title, description, author, time) {
    const modal = document.getElementById('wishDetailModal');
    if (!modal) return;
    
    document.getElementById('wishDetailTitle').textContent = title;
    document.getElementById('wishDetailDesc').textContent = description;
    document.getElementById('wishDetailAuthor').textContent = author;
    document.getElementById('wishDetailTime').textContent = new Date(time).toLocaleDateString();
    
    modal.classList.add('active');
}

// 关闭心愿详情弹窗
function closeWishDetailModal() {
    const modal = document.getElementById('wishDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 提交投资意向
async function submitInvest(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('请先登录', 'error');
        showLoginModal();
        return;
    }
    
    const message = document.getElementById('investMessage').value;
    if (!message.trim()) {
        showToast('请输入留言内容', 'error');
        return;
    }
    
    const invest = {
        author: currentUser.username,
        message: message,
        createdAt: new Date().toISOString()
    };
    
    // 保存到本地存储
    const investList = document.getElementById('investList');
    const investItem = document.createElement('div');
    investItem.className = 'invest-item';
    investItem.innerHTML = `
        <strong>${invest.author}</strong>: ${invest.message}
        <br><small style="color: #999;">${new Date().toLocaleString()}</small>
    `;
    investList.appendChild(investItem);
    
    document.getElementById('investForm').reset();
    showToast('留言提交成功！', 'success');
}

// ==================== 班级管理 ====================

// 加载班级列表
function loadClasses() {
    if (!currentUser) {
        // 未登录，显示提示
        const loginTip = document.getElementById('classesLoginTip');
        const container = document.getElementById('classesContainer');
        
        if (loginTip && container) {
            loginTip.style.display = 'block';
            container.style.display = 'none';
        }
        return;
    }
    
    // 显示班级容器
    const loginTip = document.getElementById('classesLoginTip');
    const container = document.getElementById('classesContainer');
    
    if (loginTip && container) {
        loginTip.style.display = 'none';
        container.style.display = 'block';
    }
    
    // 加载教师/学生视图
    // 实际项目中应判断用户角色
    loadUserClasses();
}

// 加载用户班级
function loadUserClasses() {
    const teacherPanel = document.getElementById('teacherPanel');
    const studentPanel = document.getElementById('studentPanel');
    
    // 模拟教师视图
    if (teacherPanel) {
        teacherPanel.style.display = 'block';
        loadTeacherClasses();
    }
    
    if (studentPanel) {
        studentPanel.style.display = 'none';
    }
}

// 加载教师管理的班级
function loadTeacherClasses() {
    const container = document.getElementById('teacherClasses');
    if (!container) return;
    
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    const myClasses = classes.filter(c => c.teacher === currentUser?.username);
    
    if (myClasses.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px; color: #999;">
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

// 初始化班级 Tab
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

// 显示创建班级弹窗
function showCreateClassModal() {
    const modal = document.getElementById('createClassModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// 关闭创建班级弹窗
function closeCreateClassModal() {
    const modal = document.getElementById('createClassModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 处理创建班级
function handleCreateClass(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    
    const name = document.getElementById('className').value;
    const description = document.getElementById('classDesc').value;
    const password = document.getElementById('classPassword').value;
    
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

// 显示加入班级弹窗
function showJoinClassModal() {
    const modal = document.getElementById('joinClassModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// 关闭加入班级弹窗
function closeJoinClassModal() {
    const modal = document.getElementById('joinClassModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 处理加入班级
function handleJoinClass(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('请先登录', 'error');
        return;
    }
    
    const code = document.getElementById('joinClassCode').value;
    const password = document.getElementById('joinClassPassword').value;
    
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    const classItem = classes.find(c => c.id === code);
    
    if (!classItem) {
        showToast('班级编号不存在', 'error');
        return;
    }
    
    if (classItem.password && classItem.password !== password) {
        showToast('密码错误', 'error');
        return;
    }
    
    // 添加成员
    if (!classItem.members) {
        classItem.members = [];
    }
    
    if (classItem.members.includes(currentUser.username)) {
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
    
    document.getElementById('joinClassForm').reset();
}

// 打开班级详情
function openClassDetail(classId) {
    const modal = document.getElementById('classDetailModal');
    if (!modal) return;
    
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    const classItem = classes.find(c => c.id === classId);
    
    if (!classItem) {
        showToast('班级不存在', 'error');
        return;
    }
    
    document.getElementById('classDetailName').textContent = classItem.name;
    document.getElementById('classDetailDesc').textContent = classItem.description || '暂无描述';
    
    modal.classList.add('active');
    
    // 加载作业列表
    loadHomeworkList(classItem);
    
    // 加载成员列表
    loadMembersList(classItem);
}

// 关闭班级详情弹窗
function closeClassDetailModal() {
    const modal = document.getElementById('classDetailModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 加载作业列表
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
            <small style="color: #999;">提交人: ${hw.author} | ${new Date(hw.createdAt).toLocaleString()}</small>
        </div>
    `).join('');
}

// 加载成员列表
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

// 提交作业
function submitHomework(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('请先登录', 'error');
        showLoginModal();
        return;
    }
    
    const title = document.getElementById('homeworkTitle').value;
    const description = document.getElementById('homeworkDesc').value;
    const fileInput = document.getElementById('homeworkFile');
    
    const homework = {
        id: 'hw_' + Date.now(),
        title,
        description,
        author: currentUser.username,
        files: [], // 文件URL列表
        aiComment: null,
        createdAt: new Date().toISOString()
    };
    
    // 保存到本地存储
    const classes = JSON.parse(localStorage.getItem('jiatong_classes') || '[]');
    // 简化处理，实际应找到具体班级
    if (classes.length > 0) {
        if (!classes[0].homeworks) {
            classes[0].homeworks = [];
        }
        classes[0].homeworks.push(homework);
        localStorage.setItem('jiatong_classes', JSON.stringify(classes));
    }
    
    showToast('作业提交成功！', 'success');
    
    document.getElementById('homeworkForm').reset();
    loadHomeworkList(classes[0]);
}

// AI 对话
function sendAIMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('aiMessage');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chat = document.getElementById('aiChat');
    
    // 添加用户消息
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
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message';
        aiMsg.innerHTML = `
            <div class="ai-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-content">
                <p>感谢你的提问！让我来分析一下...</p>
                <p style="margin-top: 10px;">根据你提交的作业内容，我可以给出以下建议：</p>
                <ul style="margin: 10px 0 0 20px;">
                    <li>整体结构清晰，继续保持</li>
                    <li>建议增加具体案例来说明观点</li>
                    <li>可以尝试用图表更直观地展示数据</li>
                </ul>
                <p style="margin-top: 10px;">如果你需要更详细的分析，请继续提问！</p>
            </div>
        `;
        chat.appendChild(aiMsg);
        
        // 滚动到底部
        chat.scrollTop = chat.scrollHeight;
    }, 1000);
    
    input.value = '';
    
    // 滚动到底部
    setTimeout(() => {
        chat.scrollTop = chat.scrollHeight;
    }, 100);
}

// ==================== URL 参数处理 ====================

// 处理页面 URL 参数
function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    
    if (service) {
        // 如果有 service 参数，切换到对应服务 Tab
        const tabBtn = document.querySelector(`[data-tab="${service}"]`);
        if (tabBtn) {
            tabBtn.click();
        }
    }
}

// 初始化时处理 URL 参数
if (document.readyState === 'complete') {
    handleURLParams();
} else {
    window.addEventListener('load', handleURLParams);
}
