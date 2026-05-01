import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // index('routes/pages/EditorPage/EditorPage.tsx'),
  index('routes/pages/HomePage/HomePage.tsx'),
  route('login', "routes/pages/Auth/Login.tsx"),
  route('register', "routes/pages/Auth/Register.tsx"),
  route('verify-email', "routes/pages/Auth/EmailVerif.tsx"),
  route('password-reset/:token', "routes/pages/Auth/PasswordReset.tsx"),
  route('profile/:userId', "routes/pages/UserPage/UserPage.tsx"),
  route('profile/:userId/edit', "routes/pages/UserEditPage/EditUserPage.tsx"),
  route('logo-maker/:projectId', "routes/pages/LogoMaker/LogoMakerPage.tsx"),
  route('edit-page/:projectId', "routes/pages/EditorPage/EditorPage.tsx"),
  route('new/:type', "routes/pages/HomePage/NewProject.tsx"),
  route('auth/callback', "routes/pages/Auth/Callback.tsx"),
] satisfies RouteConfig;
