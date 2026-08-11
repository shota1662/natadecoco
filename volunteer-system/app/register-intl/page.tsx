import type { Metadata } from 'next'
import RegisterIntlContent from './RegisterIntlContent'

export const metadata: Metadata = {
  title: 'Become an International Supporter | Nata de Coco',
  description:
    'Share your culture with children across Japan. No experience, no language skills, and no cost to you. Sign up as an international supporter with Nata de Coco.',
}

export default function RegisterIntlPage() {
  return <RegisterIntlContent />
}
