import type { Metadata } from 'next'
import RegisterIntlContent from './RegisterIntlContent'

const SITE_URL = 'https://volunteer.natadecoco.org'
const PAGE_URL = `${SITE_URL}/register-intl`
const OG_IMAGE = `${SITE_URL}/register-intl/og.jpg`
const TITLE = 'NPO NataDeCoco | Become an International Supporter'
const DESCRIPTION =
  'Share your culture with children across Japan. No experience, no language skills, and no cost to you. Sign up as an international supporter with Nata de Coco.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'NPO NataDeCoco',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 600,
        alt: 'Join as International Supporters — NPO NataDeCoco',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function RegisterIntlPage() {
  return <RegisterIntlContent />
}
