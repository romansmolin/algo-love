import './reflect-metadata.server'
import { Container } from 'inversify'
import { DI_TOKENS } from './tokens'
import {
    IUserRepository,
    GetCurrentUserController,
    GetCurrentUserUseCase,
    PrismaUserRepository,
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
import { UpdatePaymentFromReturnUseCase } from '@/entities/payment/api/server/use-cases/update-payment-from-return.usecase'
import { HandlePaymentWebhookUseCase } from '@/entities/payment/api/server/use-cases/handle-payment-webhook.usecase'
import { SecureProcessorReturnController } from '@/entities/payment/api/server/controller/secure-processor-return.controller'
import { SecureProcessorWebhookController } from '@/entities/payment/api/server/controller/secure-processor-webhook.controller'
import { DashboardController, DashboardRepository, DashboardService } from '@/entities/dashboard'
import { MatchController, MatchRepository, MatchService } from '@/entities/match'

export const container = new Container({
    defaultScope: 'Singleton',
})

export function initializeContainer(): void {
    // User entity bindings
    container.bind<IUserRepository>(DI_TOKENS.UserRepository).to(PrismaUserRepository)
    container.bind<GetCurrentUserUseCase>(DI_TOKENS.GetCurrentUserUseCase).to(GetCurrentUserUseCase)
    container.bind(GetCurrentUserController).toSelf()

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
    container.bind(UpdatePaymentFromReturnUseCase).toSelf()
    container.bind(HandlePaymentWebhookUseCase).toSelf()
    container.bind(SecureProcessorReturnController).toSelf()
    container.bind(SecureProcessorWebhookController).toSelf()

    // Dashboard entity bindings
    container.bind(DashboardRepository).toSelf()
    container.bind(DashboardService).toSelf()
    container.bind(DashboardController).toSelf()

    // Match entity bindings
    container.bind(MatchRepository).toSelf()
    container.bind(MatchService).toSelf()
    container.bind(MatchController).toSelf()
}

// Initialize container on module load
initializeContainer()
