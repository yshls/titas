import { Helmet } from 'react-helmet-async';

type SeoProps = {
  title?: string;
  description?: string;
  ogImage?: string;
  lang?: string;
  canonicalUrl?: string;
};

const SEO_METADATA = {
  ko: {
    defaultTitle: 'TiTaS - 나만의 스크립트로 완성하는 영어 쉐도잉',
    defaultDescription:
      '내가 공부하고 싶은 문장으로 시작하세요. 직접 입력한 스크립트를 따라 말하고, 실시간 비교로 발음을 개선하세요. 쉐도잉, 따라 말하기, 스크립트 연습까지!',
    siteName: 'TiTaS (티타스)',
    keywords:
      '영어 쉐도잉, 영어 따라말하기, 영어 발음 연습, 영어 스피킹, 영어 회화 연습, 영어 말하기 연습, 스크립트 학습, 영어 듣고 따라하기, OPIc 준비, 토익 스피킹, 영어 독학, 영어 공부 방법, 영어 발음 교정, 영어 실력 향상, 영어 회화 독학, 쉐도잉 사이트, 영어 학습 도구, 영어 문장 연습, 영어 반복 학습, 스피킹 연습 사이트, 무료 영어 학습, 영어 공부 사이트, 영어 연습 프로그램',
  },
  en: {
    defaultTitle: 'TiTaS - Master English Shadowing with Your Own Scripts',
    defaultDescription:
      'Start with the sentences you want to study. Improve your natural English conversation skills by shadowing your own custom scripts with real-time speech comparison.',
    siteName: 'TiTaS',
    keywords:
      'english shadowing, shadowing practice, english speaking practice, pronunciation training, speech practice, script learning, language study, english conversation practice, repeat after me, speaking improvement, english learning tool, self study english, english practice site, free english learning, sentence practice, oral english practice',
  },
};

const SITE_URL = 'https://www.titas.store';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function Seo({
  title,
  description,
  ogImage,
  lang = 'ko',
  canonicalUrl,
}: SeoProps) {
  const metadata = lang === 'en' ? SEO_METADATA.en : SEO_METADATA.ko;

  const pageTitle = title
    ? `${title} | ${metadata.siteName}`
    : metadata.defaultTitle;
  const pageDescription = description || metadata.defaultDescription;
  const pageOgImage = ogImage || DEFAULT_OG_IMAGE;
  const pageCanonicalUrl = canonicalUrl || SITE_URL;

  return (
    <Helmet htmlAttributes={{ lang }}>
      {/* 기본 메타 태그 */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={metadata.keywords} />

      {/* 표준 URL */}
      <link rel="canonical" href={pageCanonicalUrl} />

      {/* 다국어 hreflang 태그 */}
      <link rel="alternate" hrefLang="ko" href={`${SITE_URL}?lang=ko`} />
      <link rel="alternate" hrefLang="en" href={`${SITE_URL}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={SITE_URL} />

      {/* 검색엔진 로봇 */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Open Graph 태그 */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:site_name" content={metadata.siteName} />
      <meta property="og:url" content={pageCanonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'ko_KR'} />

      {/* 트위터 카드 태그 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageOgImage} />

      {/* 추가 메타 태그 */}
      <meta name="theme-color" content="#FF6B35" />
      <meta name="author" content="TiTaS" />

      {/* 모바일 최적화 */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
      />
      <meta name="format-detection" content="telephone=no" />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: metadata.siteName,
          description: pageDescription,
          url: SITE_URL,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'KRW',
          },
          featureList: [
            lang === 'ko' ? '영어 쉐도잉 연습' : 'English Shadowing Practice',
            lang === 'ko' ? '스크립트 작성' : 'Script Writing',
            lang === 'ko' ? '발음 비교' : 'Pronunciation Comparison',
            lang === 'ko' ? '실시간 피드백' : 'Real-time Feedback',
          ],
          inLanguage: lang === 'ko' ? ['ko', 'en'] : ['en', 'ko'],
          author: {
            '@type': 'Organization',
            name: 'TiTaS',
          },
        })}
      </script>
    </Helmet>
  );
}
