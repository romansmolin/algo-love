import { api } from '@/shared/api/client/api'
import { getCurrentUser } from './services/get-current-user.service'
import { getUserProfile, updateUserProfile } from './services/profile.service'
import { getUserDetails } from './services/user-details.service'
import { UserResponseDto } from '../server/contracts/user-response.dto'
import { normalizeError } from '@/shared/api/client/error-normalizer'
import type {
    UpdateProfileRequest,
    UpdateProfileResponse,
    UserDetailsResponse,
    UserProfileResponse,
} from '@/entities/user/model/types'

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentUser: builder.query<UserResponseDto, void>({
            queryFn: async () => {
                try {
                    const data = await getCurrentUser()
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            providesTags: ['User'],
        }),
        getUserProfile: builder.query<UserProfileResponse, void>({
            queryFn: async () => {
                try {
                    const data = await getUserProfile()
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            providesTags: ['User'],
        }),
        updateUserProfile: builder.mutation<UpdateProfileResponse, UpdateProfileRequest>({
            queryFn: async (payload) => {
                try {
                    const data = await updateUserProfile(payload)
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            invalidatesTags: ['User'],
        }),
        getUserDetails: builder.query<UserDetailsResponse, number>({
            queryFn: async (datingId) => {
                try {
                    const data = await getUserDetails(datingId)
                    return { data }
                } catch (error) {
                    const normalized = normalizeError(error)
                    return {
                        error: {
                            status: 'CUSTOM_ERROR' as const,
                            data: normalized,
                            error: normalized.message,
                        },
                    }
                }
            },
            providesTags: (_result, _error, datingId) => [
                { type: 'User', id: `details:${datingId}` },
            ],
        }),
    }),
})

export const {
    useGetCurrentUserQuery,
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
    useGetUserDetailsQuery,
} = userApi
