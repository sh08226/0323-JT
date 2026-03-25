# 沈阳嘉桐科技有限公司网站部署指南

## 📋 项目概述

- **项目名称**：沈阳嘉桐科技有限公司官方网站
- **域名**：www.jt-education.ltd
- **部署平台**：GitHub Pages + 腾讯云 CloudBase
- **技术栈**：纯静态 HTML/CSS/JS + 腾讯云 CloudBase 云数据库

---

## 🚀 部署步骤

### 第一步：GitHub 仓库准备

1. **创建 GitHub 仓库**
   - 登录 GitHub 账号
   - 点击右上角 `+` → `New repository`
   - 仓库名称：`jt-education-website`（或您喜欢的名称）
   - 选择 `Public`（公开）
   - 勾选 `Add a README file`
   - 点击 `Create repository`

2. **上传网站文件**
   - 将所有网站文件上传到仓库根目录：
     ```
     index.html
     about.html
     services.html
     classes.html
     wishwall.html
     contact.html
     admin.html
     style.css
     main.js
     cloudbase.js
     logo.png
     ```

3. **提交代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 嘉桐科技官网 v1.0"
   git branch -M main
   git remote add origin https://github.com/您的用户名/jt-education-website.git
   git push -u origin main
   ```

---

### 第二步：启用 GitHub Pages

1. 进入仓库页面
2. 点击顶部菜单 `Settings`
3. 左侧菜单选择 `Pages`
4. **Source** 部分：
   - Branch: 选择 `main`
   - Folder: 选择 `/(root)`
   - 点击 `Save`
5. 等待 1-2 分钟，页面会显示访问地址：
   ```
   https://您的用户名.github.io/jt-education-website/
   ```

---

### 第三步：域名配置（www.jt-education.ltd）

#### 3.1 配置 DNS 解析

登录您的域名注册商控制台，添加以下 DNS 记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|---------|--------|-----|
| CNAME | www | 您的用户名.github.io | 600 |
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |

> **注意**：如果您使用 Cloudflare 等 CDN，请直接 CNAME 到 `您的用户名.github.io`

#### 3.2 GitHub Pages 绑定域名

1. 在仓库根目录创建 `CNAME` 文件（无后缀名）
2. 文件内容：
   ```
   www.jt-education.ltd
   ```
3. 提交并推送：
   ```bash
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

4. 或直接在 GitHub Pages 设置中：
   - `Custom domain` 输入：`www.jt-education.ltd`
   - 点击 `Save`
   - 勾选 `Enforce HTTPS`（等待 SSL 证书颁发，约 24 小时）

---

### 第四步：腾讯云 CloudBase 配置

#### 4.1 添加安全域名

1. 登录 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 进入环境：`jt-0323-3gedkxnrd4787354`
3. 左侧菜单 → `安全配置` → `Web 安全域名`
4. 添加以下域名：
   ```
   localhost
   127.0.0.1
   www.jt-education.ltd
   jt-education.ltd
   您的用户名.github.io
   ```

#### 4.2 确认数据库集合

确保以下集合已创建：
- `users` - 用户信息
- `wishes` - 科创心愿墙
- `classes` - 研学班级
- `messages` - 联系留言

#### 4.3 确认数据库权限

每个集合的权限应设置为：
- **所有人可读，创建者可写**

---

### 第五步：管理员账号初始化

由于管理员需要邀请码注册，首次创建管理员需要特殊处理：

#### 方法：直接在 CloudBase 控制台创建

1. 进入 CloudBase 控制台 → 数据库 → `users` 集合
2. 点击 `添加文档`
3. 输入以下数据：
   ```json
   {
     "name": "管理员",
     "email": "admin@jt-education.ltd",
     "role": "admin",
     "createdAt": {
       "$date": "2025-03-25T00:00:00.000Z"
     }
   }
   ```
4. 然后在登录页面使用邮箱密码登录

> **注意**：首次登录后，建议修改密码并记录好管理员账号

---

## 🔧 代码中的关键配置检查

### cloudbase.js 中的环境 ID

确认代码中的环境 ID 正确：
```javascript
const config = {
    env: 'jt-0323-3gedkxnrd4787354'  // 您的环境ID
};
```

### 教师邀请码和管理员邀请码

当前代码中的邀请码：
- **教师邀请码**：`JT2026`
- **管理员邀请码**：`JTADMIN2026`

如需修改，编辑 `main.js` 中的以下部分：
```javascript
const TEACHER_CODE = 'JT2026';
const ADMIN_CODE = 'JTADMIN2026';
```

---

## ✅ 部署验证清单

部署完成后，请逐项验证：

### 基础功能
- [ ] 首页正常访问 https://www.jt-education.ltd
- [ ] 所有页面导航正常
- [ ] Logo 显示正常
- [ ] 企业标语"嘉心筑梦，桐启新章"显示正确
- [ ] 响应式布局（手机/平板/电脑）正常

### 用户系统
- [ ] 学员注册功能正常
- [ ] 学员登录功能正常
- [ ] 教师注册（邀请码 JT2026）正常
- [ ] 管理员登录（邀请码 JTADMIN2026）正常
- [ ] 退出登录功能正常

### 核心功能
- [ ] 科创心愿墙 - 发布心愿正常
- [ ] 科创心愿墙 - 显示已审核心愿正常
- [ ] 研学班级 - 教师申请创建班级正常
- [ ] 研学班级 - 学员加入班级正常
- [ ] 联系表单 - 提交留言正常

### 管理员后台
- [ ] 访问 /admin.html 正常
- [ ] 非管理员访问被拦截
- [ ] 心愿墙审核功能正常
- [ ] 班级审批功能正常
- [ ] 用户管理功能正常
- [ ] 留言查看功能正常

---

## 🐛 常见问题排查

### 1. 页面空白或 404
- 检查 GitHub Pages 设置中的分支是否正确
- 确认 index.html 在仓库根目录
- 等待 1-2 分钟后刷新

### 2. 数据库连接失败
- 检查 `cloudbase.js` 中的环境 ID 是否正确
- 确认安全域名已添加当前访问域名
- 检查浏览器控制台报错信息

### 3. 登录/注册失败
- 确认 CloudBase 认证服务已开启
- 检查邮箱格式是否正确
- 密码至少 6 位

### 4. 域名无法访问
- DNS 解析可能需要 5-48 小时生效
- 检查 CNAME 记录是否正确
- 确认 GitHub Pages 中已填写自定义域名

### 5. HTTPS 证书问题
- 首次绑定域名后，SSL 证书需要 24 小时内颁发
- 不要手动勾选 Enforce HTTPS，等待自动颁发

---

## 📁 文件结构

```
jt-education-website/
├── index.html          # 首页
├── about.html          # 关于我们
├── services.html       # 产品服务
├── classes.html        # 研学班级
├── wishwall.html       # 科创心愿墙
├── contact.html        # 联系我们
├── admin.html          # 管理员后台
├── style.css           # 全局样式
├── main.js             # 主要交互逻辑
├── cloudbase.js        # 云数据库操作
├── logo.png            # 公司Logo
├── CNAME               # 自定义域名配置
└── DEPLOY.md           # 部署指南（本文件）
```

---

## 📞 技术支持

如遇问题，请检查：
1. 浏览器开发者工具（F12）的 Console 报错
2. CloudBase 控制台的日志和监控
3. GitHub Pages 的构建状态

---

## 📝 更新记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2025-03-25 | v1.0 | 初始版本，完整功能上线 |

---

**沈阳嘉桐科技有限公司**
嘉心筑梦，桐启新章
