export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * 登入頁 URL — 直接使用本地路由 /login
 * （已從 Manus OAuth 遷移至 JWT 帳號密碼登入）
 */
export const getLoginUrl = () => "/login";
