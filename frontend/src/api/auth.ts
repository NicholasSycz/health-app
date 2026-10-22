import type { TokenResponse, UserCredentials } from '../types/auth'
import client from './client'

export async function register(credentials: UserCredentials): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/auth/register', credentials)
  return data
}

export async function login(credentials: UserCredentials): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/auth/login', credentials)
  return data
}
