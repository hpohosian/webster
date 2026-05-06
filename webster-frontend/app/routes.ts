import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index('routes/WelcomePage/WelcomePage.tsx'),
  layout('routes/Auth/HomePagelayout.tsx', [
    route('login', "routes/Auth/Login.tsx"),
    route('register', "routes/Auth/Register.tsx"),
    route('verify-email', "routes/Auth/EmailVerif.tsx"),
    route('auth/callback', "routes/Auth/Callback.tsx"),
    route('password-reset/:token', "routes/Auth/PasswordReset.tsx"),
    route('profile/:userId', "routes/UserPage/UserPage.tsx"),
    route('profile/:userId/edit', "routes/UserEditPage/EditUserPage.tsx"),
    route('projects/:userId', "routes/ProjectPage/ProjectPage.tsx"),
  ]),
  // route('logo-maker', "routes/LogoMaker/LogoMakerPage.tsx"),
  // route('edit-page', "routes/EditorPage/EditorPage.tsx"),
  route('logo-maker', "routes/LogoMakerPage.tsx"),
  route('edit-page/:projectId', "routes/EditorPage.tsx"),
] satisfies RouteConfig;
