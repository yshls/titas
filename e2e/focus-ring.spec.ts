import { test, expect } from '@playwright/test';

/**
 * 포커스 링 회귀 방지 테스트.
 *
 * index.css를 삭제한 2ba9073에서 `*:focus-visible` 규칙이 통째로 유실돼
 * 키보드 사용자가 현재 위치를 볼 수 없는 상태로 배포된 적이 있다.
 * 같은 일이 다시 일어나면 여기서 잡는다.
 */

const BASE = process.env.E2E_BASE_URL ?? 'https://localhost:5175';
const RING = 'rgb(75, 169, 95)'; // theme.colors.success (#4BA95F)

const ROUTES = ['/', '/create', '/scripts', '/mistakes', '/history', '/saved', '/review'];

type Probe = {
  tag: string;
  label: string;
  outlineStyle: string;
  outlineWidth: string;
  outlineColor: string;
  focusVisible: boolean;
};

/** 현재 포커스된 요소의 렌더링된 아웃라인을 읽는다. */
async function probeActive(page: import('@playwright/test').Page): Promise<Probe | null> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body || el === document.documentElement) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      label: (
        el.getAttribute('aria-label') ||
        (el as HTMLInputElement).placeholder ||
        el.textContent ||
        ''
      )
        .trim()
        .slice(0, 30),
      outlineStyle: cs.outlineStyle,
      outlineWidth: cs.outlineWidth,
      outlineColor: cs.outlineColor,
      focusVisible: el.matches(':focus-visible'),
    };
  });
}

test.use({ ignoreHTTPSErrors: true });

for (const route of ROUTES) {
  test(`키보드 포커스 링이 보인다: ${route}`, async ({ page }) => {
    await page.goto(BASE + route, { waitUntil: 'networkidle' });

    const seen: Probe[] = [];
    const broken: Probe[] = [];

    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      // transition: all 이 걸린 요소가 있어서 링이 다 그려질 때까지 기다린다.
      await page.waitForTimeout(260);

      const p = await probeActive(page);
      if (!p) continue;
      seen.push(p);

      const visible = p.outlineStyle !== 'none' && parseFloat(p.outlineWidth) > 0;
      if (!visible || p.outlineColor !== RING) broken.push(p);
    }

    // 페이지에 포커스 가능한 요소가 하나도 없으면 테스트가 무의미하다.
    expect(seen.length, `${route}: 포커스 가능한 요소를 찾지 못함`).toBeGreaterThan(0);

    expect(
      broken,
      `${route}: 포커스 링이 없거나 색이 다른 요소\n` +
        broken
          .map(
            (b) =>
              `  <${b.tag}> "${b.label}" → ${b.outlineStyle} ${b.outlineWidth} ${b.outlineColor}`
          )
          .join('\n')
    ).toEqual([]);
  });
}
