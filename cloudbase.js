/* ================================================
   嘉桐科技 - CloudBase 云数据库操作层
   环境ID: jt-0323-3gedkxnrd4787354
   ================================================ */

const ENV_ID = 'jt-0323-3gedkxnrd4787354';

let app = null;
let db = null;
let auth = null;

// 初始化 CloudBase
function initCloudBase() {
    if (typeof tcb === 'undefined') {
        console.error('CloudBase SDK 未加载');
        return false;
    }
    try {
        app = tcb.init({ env: ENV_ID });
        db = app.database();
        auth = app.auth({ persistence: 'local' });
        return true;
    } catch (e) {
        console.error('CloudBase 初始化失败', e);
        return false;
    }
}

// ==================== 用户系统 ====================

// 匿名登录（用于未登录用户浏览）
async function anonymousLogin() {
    try {
        await auth.anonymousAuthProvider().signIn();
        return true;
    } catch (e) {
        console.error('匿名登录失败', e);
        return false;
    }
}

// 注册（邮箱+密码）
async function registerUser(email, password, username, role = 'student') {
    try {
        // 使用邮箱密码注册
        await auth.emailAuthProvider().signUpWithEmailAndPassword(email, password);
        const loginState = await auth.getLoginState();
        const uid = loginState.user.uid;

        // 写入用户信息到数据库
        await db.collection('users').add({
            uid,
            username,
            email,
            role,              // student / teacher / admin
            status: 'active',
            createdAt: db.serverDate(),
            avatar: ''
        });

        return { success: true, uid };
    } catch (e) {
        console.error('注册失败', e);
        let msg = '注册失败，请重试';
        if (e.code === 'AUTH_EMAIL_ALREADY_EXISTS') msg = '该邮箱已被注册';
        if (e.code === 'INVALID_EMAIL') msg = '邮箱格式不正确';
        if (e.code === 'WEAK_PASSWORD') msg = '密码强度不够，至少6位';
        return { success: false, message: msg };
    }
}

// 登录
async function loginUser(email, password) {
    try {
        await auth.emailAuthProvider().signInWithEmailAndPassword(email, password);
        const loginState = await auth.getLoginState();
        const uid = loginState.user.uid;

        // 从数据库获取用户信息
        const res = await db.collection('users').where({ uid }).limit(1).get();
        if (res.data.length > 0) {
            return { success: true, user: res.data[0] };
        }
        return { success: true, user: { uid, email, role: 'student' } };
    } catch (e) {
        console.error('登录失败', e);
        let msg = '邮箱或密码错误';
        if (e.code === 'ACCOUNT_NOT_EXISTS') msg = '账号不存在';
        if (e.code === 'WRONG_PASSWORD') msg = '密码错误';
        return { success: false, message: msg };
    }
}

// 退出登录
async function logoutUser() {
    try {
        await auth.signOut();
        return true;
    } catch (e) {
        console.error('退出失败', e);
        return false;
    }
}

// 获取当前登录状态
async function getLoginState() {
    try {
        const loginState = await auth.getLoginState();
        if (!loginState || loginState.isAnonymous) return null;

        const uid = loginState.user.uid;
        const res = await db.collection('users').where({ uid }).limit(1).get();
        if (res.data.length > 0) return res.data[0];
        return { uid, email: loginState.user.email, role: 'student' };
    } catch (e) {
        return null;
    }
}

// ==================== 心愿墙 ====================

// 发布创意（status: pending，等待管理员审核）
async function addWish(title, content, tags, authorName) {
    try {
        const loginState = await auth.getLoginState();
        if (!loginState || loginState.isAnonymous) throw new Error('请先登录');
        const uid = loginState.user.uid;

        const res = await db.collection('wishes').add({
            title,
            content,
            tags: tags || [],
            authorName,
            authorUid: uid,
            status: 'pending',   // pending / approved / rejected
            likes: 0,
            comments: [],
            createdAt: db.serverDate()
        });
        return { success: true, id: res.id };
    } catch (e) {
        console.error('发布失败', e);
        return { success: false, message: e.message || '发布失败' };
    }
}

// 获取已审核通过的创意列表
async function getApprovedWishes() {
    try {
        const res = await db.collection('wishes')
            .where({ status: 'approved' })
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        return res.data;
    } catch (e) {
        console.error('获取心愿墙失败', e);
        return [];
    }
}

// ==================== 班级系统 ====================

// 申请创建班级（status: pending，等待管理员审批）
async function applyCreateClass(name, description, subject, teacherName) {
    try {
        const loginState = await auth.getLoginState();
        if (!loginState || loginState.isAnonymous) throw new Error('请先登录');
        const uid = loginState.user.uid;

        const classCode = 'JT' + Date.now().toString(36).toUpperCase();

        const res = await db.collection('classes').add({
            name,
            description,
            subject,
            teacherName,
            teacherUid: uid,
            classCode,
            status: 'pending',   // pending / approved / rejected
            members: [],
            homeworks: [],
            createdAt: db.serverDate()
        });
        return { success: true, id: res.id };
    } catch (e) {
        console.error('申请创建班级失败', e);
        return { success: false, message: e.message || '申请失败' };
    }
}

// 获取已批准的班级列表
async function getApprovedClasses() {
    try {
        const res = await db.collection('classes')
            .where({ status: 'approved' })
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        return res.data;
    } catch (e) {
        console.error('获取班级列表失败', e);
        return [];
    }
}

// 加入班级
async function joinClass(classId, classCode) {
    try {
        const loginState = await auth.getLoginState();
        if (!loginState || loginState.isAnonymous) throw new Error('请先登录');
        const uid = loginState.user.uid;

        const res = await db.collection('classes').doc(classId).get();
        const classData = res.data;

        if (classData.classCode !== classCode) {
            return { success: false, message: '班级码不正确' };
        }
        if (classData.members.some(m => m.uid === uid)) {
            return { success: false, message: '你已经在这个班级了' };
        }

        await db.collection('classes').doc(classId).update({
            members: db.command.push({
                uid,
                joinedAt: new Date().toISOString()
            })
        });
        return { success: true };
    } catch (e) {
        console.error('加入班级失败', e);
        return { success: false, message: e.message || '加入失败' };
    }
}

// ==================== 留言/咨询 ====================

// 提交联系留言
async function submitMessage(name, phone, email, type, content) {
    try {
        const res = await db.collection('messages').add({
            name,
            phone,
            email,
            type,
            content,
            status: 'unread',
            createdAt: db.serverDate()
        });
        return { success: true, id: res.id };
    } catch (e) {
        console.error('留言失败', e);
        return { success: false, message: '提交失败，请稍后重试' };
    }
}

// ==================== 管理员操作 ====================

// 审核心愿墙（approve / reject）
async function reviewWish(wishId, action) {
    try {
        await db.collection('wishes').doc(wishId).update({
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewedAt: db.serverDate()
        });
        return { success: true };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

// 删除心愿
async function deleteWish(wishId) {
    try {
        await db.collection('wishes').doc(wishId).remove();
        return { success: true };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

// 审批班级申请
async function reviewClass(classId, action) {
    try {
        await db.collection('classes').doc(classId).update({
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewedAt: db.serverDate()
        });
        return { success: true };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

// 获取待审核的心愿列表
async function getPendingWishes() {
    try {
        const res = await db.collection('wishes')
            .where({ status: 'pending' })
            .orderBy('createdAt', 'desc')
            .get();
        return res.data;
    } catch (e) {
        return [];
    }
}

// 获取待审批班级列表
async function getPendingClasses() {
    try {
        const res = await db.collection('classes')
            .where({ status: 'pending' })
            .orderBy('createdAt', 'desc')
            .get();
        return res.data;
    } catch (e) {
        return [];
    }
}

// 获取所有用户列表（仅管理员）
async function getAllUsers() {
    try {
        const res = await db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();
        return res.data;
    } catch (e) {
        return [];
    }
}

// 获取所有留言（仅管理员）
async function getAllMessages() {
    try {
        const res = await db.collection('messages')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();
        return res.data;
    } catch (e) {
        return [];
    }
}

// 设置用户为管理员
async function setUserAdmin(uid) {
    try {
        const res = await db.collection('users').where({ uid }).limit(1).get();
        if (res.data.length === 0) return { success: false, message: '用户不存在' };
        await db.collection('users').doc(res.data[0]._id).update({ role: 'admin' });
        return { success: true };
    } catch (e) {
        return { success: false, message: e.message };
    }
}
