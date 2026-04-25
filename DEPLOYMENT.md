# 网站发布与部署指南 (Vercel)

由于我们已经移除了对后端 AI 的依赖，现在这个项目是一个**纯静态的 React 前端网站**。这意味着部署它极其简单且完全免费。

强烈建议使用 **Vercel** 进行公开发布：

## 第一步：准备代码库

1. 在项目根目录下，确保有 `package.json` 文件。
2. 我们已经配置好了 `npm run build` 命令。
3. 请确保您已经将 `public/wechat-pay.png` 和 `public/alipay.png` 放好。

## 第二步：上传到代码托管平台

1. 如果您还没有账号，请在 [GitHub](https://github.com/) 或 [Gitee](https://gitee.com/) 上注册一个账号。
2. 创建一个新的私人（Private）或公开（Public）仓库。
3. 将项目根目录的代码提交并推送到这个仓库中。

## 第三步：在 Vercel 极速部署

1. 访问 [Vercel 官网](https://vercel.com/)，使用您的 GitHub 账号登录。
2. 在控制台点击 **"Add New" -> "Project"**。
3. 在弹出的列表中找到您刚才上传的那个 GitHub 仓库，点击 **"Import"**。
4. Vercel 会自动识别出这是一个 Vite/React 项目：
   - Build Command 会自动识别为 `npm run build` 或 `vite build`
   - Output Directory 会自动识别为 `dist`
5. 直接点击下方的 **"Deploy"** 按钮。
6. 等待约 1 分钟，您的网站就成功发布到公网了！

## 第四步：后续维护与更新

Vercel 会监听您的 GitHub 仓库。以后当您在本地修改了代码（比如补充了新的条款内容），只需要执行 `git push` 把代码推送到 GitHub，Vercel 就会**自动重新打包并更新**线上的网站，无需人工干预。

测试结果分析
AI 辅助测试执行结果
测试文件名: test_App.tsx
AI 执行命令: npm run test
AI 生成测试用例: 已在 test_App.tsx 中生成
