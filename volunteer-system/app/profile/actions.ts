'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ProfileState = {
  error?: string
} | null

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const fullName = (formData.get('full_name') as string)?.trim() || ''
  const phone = (formData.get('phone') as string)?.trim() || null
  const nationality = (formData.get('nationality') as string) || null
  const birthday = (formData.get('birthday') as string) || null
  const japaneseLevelStr = formData.get('japanese_level') as string
  const englishLevelStr = formData.get('english_level') as string
  const japaneseLevel = japaneseLevelStr ? parseInt(japaneseLevelStr, 10) : null
  const englishLevel = englishLevelStr ? parseInt(englishLevelStr, 10) : null

  const bankName = (formData.get('bank_name') as string)?.trim() || null
  const bankBranch = (formData.get('bank_branch') as string)?.trim() || null
  const bankAccountNumber = (formData.get('bank_account_number') as string)?.trim() || null
  const bankAccountHolder = (formData.get('bank_account_holder') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null
  const nearestStation = (formData.get('nearest_station') as string)?.trim() || null

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone,
      nationality,
      birthday: birthday || null,
      japanese_level: japaneseLevel,
      english_level: englishLevel,
      bank_name: bankName,
      bank_branch: bankBranch,
      bank_account_number: bankAccountNumber,
      bank_account_holder: bankAccountHolder,
      address,
      nearest_station: nearestStation,
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'プロフィールの更新に失敗しました。再度お試しください。' }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  redirect('/dashboard?message=' + encodeURIComponent('プロフィールを更新しました。'))
}
