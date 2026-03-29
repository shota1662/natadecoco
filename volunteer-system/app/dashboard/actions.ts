'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function registerForEvent(
  eventId: string,
  wantsTransportFee: boolean,
  wantsHonorarium: boolean,
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'ログインが必要です' }
  }

  const { error } = await supabase.from('event_registrations').insert({
    event_id: eventId,
    user_id: user.id,
    wants_transport_fee: wantsTransportFee,
    wants_honorarium: wantsHonorarium,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'すでに申し込み済みです' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelRegistration(registrationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'ログインが必要です' }
  }

  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('id', registrationId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
