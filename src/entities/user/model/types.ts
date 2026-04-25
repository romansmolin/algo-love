/**
 * User domain types
 * Aligned with Better Auth schema
 */

export interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  name: string
  image?: string
}

export interface UpdateUserInput {
  name?: string
  emailVerified?: boolean
  image?: string
}

export type UserGender = 'man' | 'woman' | 'couple'

export interface UserProfilePhoto {
  large?: string
  medium?: string
  small?: string
}

export interface UserProfile {
  id: number
  username: string
  fullName?: string
  age?: number
  gender?: UserGender
  location?: string
  email?: string
  lastVisit?: string
  avatarUrl?: string
  photos?: UserProfilePhoto[]
  photoCount?: number
  description?: string
  height?: number
  weight?: number
  eyeColor?: number
  hairColor?: number
  situation?: number
  silhouette?: number
  personality?: number
  schedule?: number
  orientation?: number
  children?: number
  education?: number
  profession?: number
}

export interface UserProfileResponse {
  user: UserProfile
}

export type UserInteractionState = 'none' | 'liked' | 'disliked' | 'skipped' | 'matched'

export interface UserDetailsResponse {
  user: UserProfile
  interactionState: UserInteractionState
}

export interface UpdateProfileRequest {
  fullName: string
  height?: number
  weight?: number
  eyeColor?: number
  hairColor?: number
  situation?: number
  silhouette?: number
  personality?: number
  schedule?: number
  orientation?: number
  children?: number
  education?: number
  profession?: number
  email?: string
  langUi?: string
  bodyOptions?: number[]
  description?: string
}

export interface UpdateProfileResponse {
  accepted?: number
  error?: string
}
