export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  nationality: string | null
  birthday: string | null
  japanese_level: number | null
  english_level: number | null
  role: 'volunteer' | 'admin'
  bank_name: string | null
  bank_branch: string | null
  bank_account_number: string | null
  bank_account_holder: string | null
  address: string | null
  nearest_station: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  location: string | null
  event_date: string
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
  wants_transport_fee: boolean | null
  wants_honorarium: boolean | null
  profiles?: Profile
  events?: Event
}
