import { test, expect } from '@playwright/test';

test.describe('TiTaS Core Flows', () => {
  
  test('Creator Flow: Create a new shadowing script and save', async ({ page }) => {
    // 1. Vite 기본 포트(5173)를 기준으로 Creator 페이지 접속
    await page.goto('http://localhost:5173/create');

    // 2. 제목 입력
    // CreatorPage.tsx 에서 aria-label="Script Title" 인 input
    await page.fill('input[aria-label="Script Title"]', 'Playwright Test Script');

    // 3. 첫 번째 대사 입력
    await page.fill('input[aria-label="Dialogue text input"]', 'Hello! Can I get a large iced americano?');
    await page.click('button[aria-label="Add dialogue line"]');

    // 대사가 화면에 추가되었는지 확인
    await expect(page.locator('text=Hello! Can I get a large iced americano?')).toBeVisible();

    // 4. 발화자 2로 변경 후 두 번째 대사 입력
    // RoleSelection이나 Avatar 클릭으로 가정 (이름 클릭)
    await page.click('text=Speaker 2');
    await page.fill('input[aria-label="Dialogue text input"]', 'Sure, that will be 4 dollars.');
    await page.click('button[aria-label="Add dialogue line"]');

    // 두 번째 대사 확인
    await expect(page.locator('text=Sure, that will be 4 dollars.')).toBeVisible();

    // 5. 저장 버튼 클릭
    // "Save Script" 는 아이콘 + 텍스트를 포함하는 버튼
    await page.click('button:has-text("Save Script")');

    // 6. 성공 토스트 메시지가 뜨는지 확인
    await expect(page.locator('text=Script saved successfully!')).toBeVisible();
  });

});
