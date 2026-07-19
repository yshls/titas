import { test, expect } from '@playwright/test';

test.describe('TiTaS Login & History Flow', () => {

  test('Clicking Sign in initiates OAuth redirect', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // 1. 헤더의 "Sign in" 버튼 찾기 (다국어 지원 고려 'Sign in' 또는 '로그인')
    const loginButton = page.locator('button', { hasText: /(Sign in|로그인)/ }).first();
    
    // 버튼이 렌더링되었는지 확인
    await expect(loginButton).toBeVisible();

    // 2. 로그인 클릭 
    // 로컬 환경에서는 Supabase OAuth 페이지(Google)로 리다이렉트됨
    await loginButton.click();

    // 3. Supabase Auth URL로 리다이렉트되는지 검증 
    // 브라우저가 이동하는지 체크 (Google 로그인 창으로 전환됨)
    await page.waitForURL(/.*supabase\.co\/auth\/.*/, { timeout: 10000 });
  });

});
