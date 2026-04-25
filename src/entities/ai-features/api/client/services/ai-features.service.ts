import { apiClient } from '@/shared/api/client/axios.config'
import type { AIGateResult } from './types'
import type {
    BioRewriteStudioPayload,
    BioRewriteStudioResult,
    MatchRadarPayload,
    MatchRadarResult,
    PhotoSpotlightResult,
    ProfileAnalyzerResult,
} from './types'

export async function runProfileAnalyzer(): Promise<AIGateResult<ProfileAnalyzerResult>> {
    const response = await apiClient.post<AIGateResult<ProfileAnalyzerResult>>(
        '/api/ai/profile-analyzer',
        {},
    )
    return response.data
}

export async function runPhotoSpotlight(): Promise<AIGateResult<PhotoSpotlightResult>> {
    const response = await apiClient.post<AIGateResult<PhotoSpotlightResult>>(
        '/api/ai/photo-spotlight',
        {},
    )
    return response.data
}

export async function runMatchRadar(
    payload: MatchRadarPayload,
): Promise<AIGateResult<MatchRadarResult>> {
    const response = await apiClient.post<AIGateResult<MatchRadarResult>>(
        '/api/ai/match-radar',
        payload,
    )
    return response.data
}

export async function runBioRewriteStudio(
    payload: BioRewriteStudioPayload,
): Promise<AIGateResult<BioRewriteStudioResult>> {
    const response = await apiClient.post<AIGateResult<BioRewriteStudioResult>>(
        '/api/ai/bio-rewrite-studio',
        payload,
    )
    return response.data
}
