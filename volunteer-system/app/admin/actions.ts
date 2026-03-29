'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return { supabase, user }
}

export type EventState = { error?: string } | null

export async function createEvent(
  _prevState: EventState,
  formData: FormData
): Promise<EventState> {
  const { supabase, user } = await checkAdmin()

  const eventDate = formData.get('event_date') as string
  const eventTime = formData.get('event_time') as string
  const capacityStr = formData.get('capacity') as string

  const { error } = await supabase.from('events').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    location: formData.get('location') as string || null,
    event_date: `${eventDate}T${eventTime || '00:00'}:00`,
    capacity: capacityStr ? parseInt(capacityStr, 10) : null,
    created_by: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/events')
  revalidatePath('/dashboard')
  redirect('/admin/events?success=イベントを作成しました')
}

export async function updateEvent(
  _prevState: EventState,
  formData: FormData
): Promise<EventState> {
  const { supabase } = await checkAdmin()

  const id = formData.get('id') as string
  const eventDate = formData.get('event_date') as string
  const eventTime = formData.get('event_time') as string
  const capacityStr = formData.get('capacity') as string

  const { error } = await supabase
    .from('events')
    .update({
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      location: formData.get('location') as string || null,
      event_date: `${eventDate}T${eventTime || '00:00'}:00`,
      capacity: capacityStr ? parseInt(capacityStr, 10) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/events')
  revalidatePath('/dashboard')
  redirect('/admin/events?success=イベントを更新しました')
}

export async function deleteEvent(eventId: string) {
  const { supabase } = await checkAdmin()

  const { error } = await supabase.from('events').delete().eq('id', eventId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/events')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function removeParticipant(registrationId: string) {
  const { supabase } = await checkAdmin()

  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('id', registrationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
