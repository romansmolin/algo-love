export {
    useGetCurrentUserQuery,
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
} from './api/client/endpoints'

// User Types
export type {
    UpdateProfileRequest,
    UpdateProfileResponse,
    User,
    UserGender,
    UserProfile,
    UserProfilePhoto,
    UserProfileResponse,
} from './model/types'

// Server-side exports (use with caution - only in server contexts)
export { GetCurrentUserController } from './api/server/controller/get-current-user.controller'
export { UserProfileController } from './api/server/controller/user-profile.controller'
export { GetCurrentUserUseCase } from './api/server/use-cases/get-current-user.usecase'
export { PrismaUserRepository } from './api/server/repositories/prisma-user.repository'
export { UserProfileRepository } from './api/server/repositories/user-profile.repo'
export { UserProfileService } from './api/server/services/user-profile.service'
export type { IUserRepository } from './api/server/interfaces/user-repository.interface'
