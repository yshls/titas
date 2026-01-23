import { Helmet } from 'react-helmet-async';

type SeoProps = {
  title?: string;
  description?: string;
  ogImage?: string;
  lang?: string;
};

const SEO_METADATA = {
  ko: {
    defaultTitle: 'TiTaS - 나만의 스크립트로 완성하는 영어 쉐도잉',
    defaultDescription:
      '내가 공부하고 싶은 문장으로 시작하세요. 직접 입력한 스크립트를 따라 말하며 자연스러운 영어 회화 실력을 키울 수 있습니다.',
    siteName: 'TiTaS (티타스)',
  },
  en: {
    defaultTitle: 'TiTaS - Master English Shadowing with Your Own Scripts',
    defaultDescription:
      'Start with the sentences you want to study. Improve your natural English conversation skills by shadowing your own custom scripts.',
    siteName: 'TiTaS',
  },
};

const SITE_URL = 'https://www.titas.store/';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function Seo({ title, description, ogImage, lang = 'ko' }: SeoProps) {
  const metadata = lang === 'en' ? SEO_METADATA.en : SEO_METADATA.ko;

  const pageTitle = title
    ? `${title} | ${metadata.siteName}`
    : metadata.defaultTitle;
  const pageDescription = description || metadata.defaultDescription;
  const pageOgImage = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      {/* Open Graph Tags for social media */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:site_name" content={metadata.siteName} />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'ko_KR'} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageOgImage} />
    </Helmet>
  );
}
