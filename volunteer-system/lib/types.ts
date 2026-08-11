export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  nationality: string | null
  birthday: string | null
  prefecture: string | null
  occupation: string | null
  skills: string | null
  japanese_level: number | null
  english_level: number | null
  role: 'volunteer' | 'admin'
  address: string | null
  nearest_station: string | null
  bank_name: string | null
  bank_branch: string | null
  bank_account_number: string | null
  bank_account_holder: string | null
  orientation_date: string | null
  orientation_attended: boolean | null
  created_at: string
  updated_at: string
}

export interface IntlVolunteer {
  id: string
  created_at: string
  full_name: string
  birth_date: string
  email: string
  origin_country: string
  residence_pref: string
  question: string | null
  privacy_consent: boolean
  locale: 'en' | 'ja'
}

export interface Event {
  id: string
  title: string
  description: string | null
  location: string | null
  event_date: string
  registration_start: string | null
  registration_end: string | null
  result_notification_date: string | null
  capacity: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  status: 'applied' | 'selected' | 'rejected'
  wants_transport_fee: boolean | null
  wants_honorarium: boolean | null
  profiles?: Profile
  events?: Event
}
