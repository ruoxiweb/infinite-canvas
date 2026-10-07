# Cloudflare Pages 部署指南(含团队内置 Key)

本仓库是纯前端 SPA(构建产物为 `web/dist`),可以直接托管在 Cloudflare Pages 上,并配合 Cloudflare Access 做团队访问控制。本分支在原版基础上增加了一个定制能力:**通过 Cloudflare Access 登录、邮箱以 `@mithrilhz.com` 结尾的用户,会自动获得一个内置的团队渠道(Base URL + API Key),无需手动配置。**

## 一、创建 Pages 项目

1. Cloudflare 控制台 → **Workers & Pages → Create → Pages → Connect to Git**,选择本 fork(`ruoxiweb/infinite-canvas`)。
2. 构建配置:
   - **Framework preset**: None(Vite)
   - **Build command**: `cd web && npm install --legacy-peer-deps && npm run build`
     (`pro-components@3.0.0-beta` 与 antd 6 存在 peer 声明冲突,需跳过严格 peer 检查;上游平时用 bun 安装)
   - **Build output directory**: `web/dist`
3. SPA 路由回退已通过 `web/public/_redirects`(`/* /index.html 200`)内置,无需额外配置。

## 二、配置团队内置 Key(构建环境变量)

在 Pages 项目的 **Settings → Variables and Secrets** 中添加以下变量(参与构建,修改后需重新部署):

| 变量                     | 必填 | 说明                                                                                             |
| ------------------------ | ---- | ------------------------------------------------------------------------------------------------ |
| `VITE_TEAM_BASE_URL`     | ✅   | 团队渠道的 OpenAI 兼容接口地址                                                                   |
| `VITE_TEAM_API_KEY`      | ✅   | 团队内部 API Key                                                                                 |
| `VITE_TEAM_EMAIL_DOMAIN` | —    | 享有内置 Key 的邮箱域名,默认 `mithrilhz.com`                                                     |
| `VITE_TEAM_CHANNEL_NAME` | —    | 渠道显示名,默认「团队渠道」                                                                      |
| `VITE_TEAM_MODELS`       | —    | 逗号分隔的模型名列表,如 `gpt-image-2,gpt-5.5`;能力(生图/文本等)按名称自动推断,可在渠道编辑里调整 |

行为说明:

- 只有当浏览器中存在 Cloudflare Access 会话(`CF_Authorization` cookie)且解码出的邮箱以配置域名结尾时,团队渠道才会注入。
- 渠道的 **Base URL 和 API Key 始终以构建变量为准**(每次加载自动同步),方便统一换 Key;模型列表可由用户自行增删。
- 用户删除团队渠道即视为 opt-out,之后不会再自动恢复(记录在浏览器本地)。
- 若用户已配置了自己的带 Key 渠道,团队渠道照样提供,但默认模型选择不会被抢占;首次使用(无任何已配置渠道)时,默认模型自动指向团队渠道的模型。

## 三、配置 Cloudflare Access

1. Zero Trust 控制台 → **Access → Applications → Add an application → Self-hosted**。
2. 应用域名填 Pages 站点(如 `canvas.mithrilhz.com` 或 `<project>.pages.dev`)。
3. 添加策略:Action 为 **Allow**,Include 规则选择 **Emails ending in** `@mithrilhz.com`。
4. (推荐)同时在 Zero Trust → Settings → Authentication 中启用 One-time PIN 或对接公司 SSO。

> 访问控制的真正关卡是 Cloudflare 边缘对 Access JWT 的校验;前端解码 cookie 邮箱只用于决定是否注入内置 Key,属于体验层逻辑。

## 四、安全模型须知

- 应用本身无服务端,团队 Key 会**编译进 JS 包**,任何能加载页面的人都可从包中读到。因此务必保证 Pages 站点已置于 Access 之后(包括 `*.pages.dev` 直连域名),不要在未配 Access 前公开分发构建产物。
- 若将来需要更强的隔离(如 Key 不进前端包、按用户校验签名),可以加一层 Cloudflare Worker:校验 `Cf-Access-Jwt-Assertion` 后动态下发 Key。
- 换团队 Key 时:更新 Pages 构建变量 → 重新部署,所有成员浏览器内的团队渠道在下次加载时自动同步。
