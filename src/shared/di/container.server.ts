import './reflect-metadata.server'
import { Container } from 'inversify'
import { DI_TOKENS } from './tokens'
import {
    IUserRepository,
    GetCurrentUserController,
    GetCurrentUserUseCase,
    GetUserDetailsController,
    GetUserDetailsUseCase,
    PrismaUserRepository,
    UserProfileController,
    UserProfileRepository,
    UserProfileService,
} from '@/entities/user'
import { ICreditRepository } from '@/entities/credit/api/server/interfaces/credit-repository.interface'
import { PrismaCreditRepository } from '@/entities/credit/api/server/repositories/prisma-credit.repository'
import { GetBalanceUseCase } from '@/entities/credit/api/server/use-cases/get-balance.usecase'
import { PurchaseCreditsUseCase } from '@/entities/credit/api/server/use-cases/purchase-credits.usecase'
import { GetWalletUseCase } from '@/entities/credit/api/server/use-cases/get-wallet.usecase'
import { SpendCreditsUseCase } from '@/entities/credit/api/server/use-cases/spend-credits.usecase'
import { PurchaseCreditsController } from '@/entities/credit/api/server/controller/purchase-credits.controller'
import { GetWalletController } from '@/entities/credit/api/server/controller/get-wallet.controller'
import { IPaymentTokenRepository } from '@/entities/payment/api/server/interfaces/payment-token-repository.interface'
import { PrismaPaymentTokenRepository } from '@/entities/payment/api/server/repositories/prisma-payment-token.repository'
import { PaymentGatewayAdapter } from '@/entities/payment/api/server/interfaces/payment-gateway.interface'
import { SecureProcessorAdapter } from '@/entities/payment/api/server/adapters/secure-processor.adapter'
import { CreatePaymentCheckoutUseCase } from '@/entities/payment/api/server/use-cases/create-payment-checkout.usecase'
import { HandleReturnUseCase } from '@/entities/payment/api/server/use-cases/handle-return.usecase'
import { HandlePaymentWebhookUseCase } from '@/entities/payment/api/server/use-cases/handle-payment-webhook.usecase'
import { SecureProcessorReturnController } from '@/entities/payment/api/server/controller/secure-processor-return.controller'
import { SecureProcessorWebhookController } from '@/entities/payment/api/server/controller/secure-processor-webhook.controller'
import { DashboardController, DashboardRepository, DashboardService } from '@/entities/dashboard'
import {
    InteractionsController,
    ListInteractionsUseCase,
    MatchController,
    MatchInteractionRepository,
    MatchRepository,
    MatchService,
    SubmitMatchActionUseCase,
} from '@/entities/match'
import {
    ChatController,
    ChatRepository,
    ChatService,
    ConversationRepository,
    ConversationsController,
    ListConversationsUseCase,
    ListMessagesUseCase,
    MarkConversationReadUseCase,
    MessageRepository,
    SendConversationMessageUseCase,
} from '@/entities/chat'
import { GiftController } from '@/entities/gift/api/server/controllers/gift.controller'
import { GiftRepository } from '@/entities/gift/api/server/repositories/gift.repository'
import { GiftService } from '@/entities/gift/api/server/services/gift.service'
import {
    AIUnlockController,
    AIUnlockRepository,
    AIUnlockService,
} from '@/entities/ai-unlock/server'
import { AIGate } from '@/shared/lib/ai/ai-gate'
import { ProfileAnalyzerService } from '@/entities/ai-profile-analyzer/api/server/services/profile-analyzer.service'
import { ProfileAnalyzerController } from '@/entities/ai-profile-analyzer/api/server/controllers/profile-analyzer.controller'
import { PhotoSpotlightService } from '@/entities/ai-photo-spotlight/api/server/services/photo-spotlight.service'
import { PhotoSpotlightController } from '@/entities/ai-photo-spotlight/api/server/controllers/photo-spotlight.controller'
import { MatchRadarService } from '@/entities/ai-match-radar/api/server/services/match-radar.service'
import { MatchRadarController } from '@/entities/ai-match-radar/api/server/controllers/match-radar.controller'
import { BioRewriteStudioService } from '@/entities/ai-bio-rewrite-studio/api/server/services/bio-rewrite-studio.service'
import { BioRewriteStudioController } from '@/entities/ai-bio-rewrite-studio/api/server/controllers/bio-rewrite-studio.controller'

export const container = new Container({
    defaultScope: 'Singleton',
})

export function initializeContainer(): void {
    // User entity bindings
    container.bind<IUserRepository>(DI_TOKENS.UserRepository).to(PrismaUserRepository)
    container.bind<GetCurrentUserUseCase>(DI_TOKENS.GetCurrentUserUseCase).to(GetCurrentUserUseCase)
    container.bind(GetCurrentUserController).toSelf()
    container.bind(UserProfileRepository).toSelf()
    container.bind(UserProfileService).toSelf()
    container.bind(UserProfileController).toSelf()
    container.bind(GetUserDetailsUseCase).toSelf()
    container.bind(GetUserDetailsController).toSelf()

    // Credit entity bindings
    container.bind<ICreditRepository>('ICreditRepository').to(PrismaCreditRepository)
    container.bind(GetBalanceUseCase).toSelf()
    container.bind(PurchaseCreditsUseCase).toSelf()
    container.bind(GetWalletUseCase).toSelf()
    container.bind(SpendCreditsUseCase).toSelf()
    container.bind(PurchaseCreditsController).toSelf()
    container.bind(GetWalletController).toSelf()

    // Payment entity bindings
    container
        .bind<IPaymentTokenRepository>('IPaymentTokenRepository')
        .to(PrismaPaymentTokenRepository)
    container.bind<PaymentGatewayAdapter>('PaymentGatewayAdapter').to(SecureProcessorAdapter)
    container.bind(CreatePaymentCheckoutUseCase).toSelf()
    container.bind(HandleReturnUseCase).toSelf()
    container.bind(HandlePaymentWebhookUseCase).toSelf()
    container.bind(SecureProcessorReturnController).toSelf()
    container.bind(SecureProcessorWebhookController).toSelf()

    // Dashboard entity bindings
    container.bind(DashboardRepository).toSelf()
    container.bind(DashboardService).toSelf()
    container.bind(DashboardController).toSelf()

    // Match entity bindings
    container.bind(MatchRepository).toSelf()
    container.bind(MatchInteractionRepository).toSelf()
    container.bind(SubmitMatchActionUseCase).toSelf()
    container.bind(ListInteractionsUseCase).toSelf()
    container.bind(MatchService).toSelf()
    container.bind(MatchController).toSelf()
    container.bind(InteractionsController).toSelf()

    // Chat entity bindings
    container.bind(ChatRepository).toSelf()
    container.bind(ChatService).toSelf()
    container.bind(ChatController).toSelf()
    container.bind(ConversationRepository).toSelf()
    container.bind(MessageRepository).toSelf()
    container.bind(ListConversationsUseCase).toSelf()
    container.bind(ListMessagesUseCase).toSelf()
    container.bind(MarkConversationReadUseCase).toSelf()
    container.bind(SendConversationMessageUseCase).toSelf()
    container.bind(ConversationsController).toSelf()

    // Gift entity bindings
    container.bind(GiftRepository).toSelf()
    container.bind(GiftService).toSelf()
    container.bind(GiftController).toSelf()

    // AI shared
    container.bind(AIGate).toSelf()

    // AI unlock entity bindings
    container.bind(AIUnlockRepository).toSelf()
    container.bind(AIUnlockService).toSelf()
    container.bind(AIUnlockController).toSelf()

    // AI feature bindings
    container.bind(ProfileAnalyzerService).toSelf()
    container.bind(ProfileAnalyzerController).toSelf()
    container.bind(PhotoSpotlightService).toSelf()
    container.bind(PhotoSpotlightController).toSelf()
    container.bind(MatchRadarService).toSelf()
    container.bind(MatchRadarController).toSelf()
    container.bind(BioRewriteStudioService).toSelf()
    container.bind(BioRewriteStudioController).toSelf()
}

// Initialize container on module load
initializeContainer()
