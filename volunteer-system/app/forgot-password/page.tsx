import ForgotPasswordForm from './ForgotPasswordForm'

interface Props {
  searchParams: Promise<{ sent?: string }>
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = await searchParams
  return <ForgotPasswordForm sent={params.sent === 'true'} />
}
