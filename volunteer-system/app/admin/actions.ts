'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

function toDateTimeStr(date: string, time: string) {
  return date ? `${date}T${time || '00:00'}:00` : null
}

export async function createEvent(
  _prevState: EventState,
  formData: FormData
): Promise<EventState> {
  const { supabase, user } = await checkAdmin()

  const eventDate = formData.get('event_date') as string
  const eventTime = formData.get('event_time') as string
  const regStart = formData.get('registration_start') as string
  const regEnd = formData.get('registration_end') as string
  const resultNotifDate = formData.get('result_notification_date') as string
  const capacityStr = formData.get('capacity') as string

  const { error } = await supabase.from('events').insert({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    location: (formData.get('location') as string) || null,
    event_date: `${eventDate}T${eventTime || '00:00'}:00`,
    registration_start: regStart ? `${regStart}:00` : null,
    registration_end: regEnd ? `${regEnd}:00` : null,
    result_notification_date: resultNotifDate ? `${resultNotifDate}:00` : null,
    capacity: capacityStr ? parseInt(capacityStr, 10) : null,
    created_by: user.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/events')
  revalidatePath('/dashboard')
  redirect('/admin/events?success=' + encodeURIComponent('イベントを作成しました'))
}

export async function updateEvent(
  _prevState: EventState,
  formData: FormData
): Promise<EventState> {
  const { supabase } = await checkAdmin()

  const id = formData.get('id') as string
  const eventDate = formData.get('event_date') as string
  const eventTime = formData.get('event_time') as string
  const regStart = formData.get('registration_start') as string
  const regEnd = formData.get('registration_end') as string
  const resultNotifDate = formData.get('result_notification_date') as string
  const capacityStr = formData.get('capacity') as string

  const { error } = await supabase
    .from('events')
    .update({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      location: (formData.get('location') as string) || null,
      event_date: `${eventDate}T${eventTime || '00:00'}:00`,
      registration_start: regStart ? `${regStart}:00` : null,
      registration_end: regEnd ? `${regEnd}:00` : null,
      result_notification_date: resultNotifDate ? `${resultNotifDate}:00` : null,
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
  redirect('/admin/events?success=' + encodeURIComponent('イベントを更新しました'))
}

export async function updateRegistrationStatus(
  registrationId: string,
  status: 'applied' | 'selected' | 'rejected'
) {
  const { supabase } = await checkAdmin()

  // 登録情報・プロフィール・イベントを取得
  const { data: reg } = await supabase
    .from('event_registrations')
    .select('*, profiles(*), events(*)')
    .eq('id', registrationId)
    .single()

  const { error } = await supabase
    .from('event_registrations')
    .update({ status })
    .eq('id', registrationId)

  if (error) {
    return { error: error.message }
  }

  // メール通知（当選・落選時のみ）
  if (reg && (status === 'selected' || status === 'rejected')) {
    const profile = reg.profiles as { email?: string; full_name?: string } | null
    const event = reg.events as { title?: string } | null
    if (profile?.email && event?.title) {
      const { data: tmpl } = await supabase
        .from('email_templates')
        .select('subject, body_html')
        .eq('id', status)
        .single()
      if (tmpl) {
        const name = profile.full_name ?? ''
        const title = event.title
        const subject = tmpl.subject.replace(/\{\{name\}\}/g, name).replace(/\{\{event_title\}\}/g, title)
        const html = tmpl.body_html.replace(/\{\{name\}\}/g, name).replace(/\{\{event_title\}\}/g, title)
        await resend.emails.send({
          from: 'NPOナタデココ <info@natadecoco.org>',
          to: profile.email,
          subject,
          html,
        })
      }
    }
  }

  revalidatePath('/admin/events', 'page')
  return { success: true }
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

export async function updateEmailTemplate(
  _prevState: EventState,
  formData: FormData
): Promise<EventState> {
  const { supabase } = await checkAdmin()

  const id = formData.get('id') as string
  const subject = formData.get('subject') as string
  const body_html = formData.get('body_html') as string

  const { error } = await supabase
    .from('email_templates')
    .update({ subject, body_html, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/email-templates')
  return null
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
