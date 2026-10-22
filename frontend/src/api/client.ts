import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

/** The browser's IANA zone, e.g. 'Asia/Tokyo'. Falls back to UTC if unavailable. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // The server stores instants in UTC; it needs the viewer's zone to know
  // where each calendar day starts. Sent on every request so a travelling
  // user's "today" follows them without any stored preference.
  config.params = { tz: browserTimeZone(), ...(config.params ?? {}) }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('email')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default client
