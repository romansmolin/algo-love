export {
    useGetCurrentUserQuery,
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
    useGetUserDetailsQuery,
} from './api/client/endpoints'

// User Types
export type {
    UpdateProfileRequest,
    UpdateProfileResponse,
    User,
    UserDetailsResponse,
    UserGender,
    UserInteractionState,
    UserProfile,
    UserProfilePhoto,
    UserProfileResponse,
} from './model/types'

// Server-side exports (use with caution - only in server contexts)
export { GetCurrentUserController } from './api/server/controller/get-current-user.controller'
export { GetUserDetailsController } from './api/server/controller/get-user-details.controller'
export { UserProfileController } from './api/server/controller/user-profile.controller'
export { GetCurrentUserUseCase } from './api/server/use-cases/get-current-user.usecase'
export { GetUserDetailsUseCase } from './api/server/use-cases/get-user-details.usecase'
export { PrismaUserRepository } from './api/server/repositories/prisma-user.repository'
export { UserProfileRepository } from './api/server/repositories/user-profile.repo'
export { UserProfileService } from './api/server/services/user-profile.service'
export type { IUserRepository } from './api/server/interfaces/user-repository.interface'
