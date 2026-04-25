import 'server-only'

import { container } from '@/shared/lib/di/container.server'
import { AIUnlockService } from '@/entities/ai-unlock/api/server/services/ai-unlock.service'

export const ensureActiveAIUnlock = async (userId: string): Promise<void> => {
    const service = container.get(AIUnlockService)
    await service.ensureActive(userId)
}
