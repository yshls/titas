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
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={metadata.keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={pageCanonicalUrl} />

      {/* Robots */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:site_name" content={metadata.siteName} />
      <meta property="og:url" content={pageCanonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'ko_KR'} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageOgImage} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#FF6B35" />
      <meta name="author" content="TiTaS" />

      {/* Mobile Optimization */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
      />
      <meta name="format-detection" content="telephone=no" />
    </Helmet>
  );
}
