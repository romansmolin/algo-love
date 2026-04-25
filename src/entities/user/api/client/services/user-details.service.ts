import { apiClient } from '@/shared/api/client/axios.config'
import type { UserDetailsResponse } from '@/entities/user/model/types'

export async function getUserDetails(datingId: number): Promise<UserDetailsResponse> {
    const response = await apiClient.get<UserDetailsResponse>(`/api/users/${datingId}`)
    return response.data
}
