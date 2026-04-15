import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index('routes/pages/EditorPage/EditorPage.tsx'),
  route('login', "routes/pages/Auth/Login.tsx"),
  route('register', "routes/pages/Auth/Register.tsx"),
  route('verify-email', "routes/pages/Auth/EmailVerif.tsx"),
  route('password-reset/:token', "routes/pages/Auth/PasswordReset.tsx"),
  // route('profile/:userId', "routes/pages/user/UserPage.tsx"),
  // route('profile/:userId/edit', "routes/pages/editUser/EditUserPage.tsx"),
  route('auth/callback', "routes/pages/Auth/Callback.tsx"),
] satisfies RouteConfig;
