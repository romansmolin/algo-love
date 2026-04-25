import { api } from '@/shared/api/client/api'
import { normalizeError } from '@/shared/api/client/error-normalizer'
import {
    runBioRewriteStudio,
    runMatchRadar,
    runPhotoSpotlight,
    runProfileAnalyzer,
} from './services/ai-features.service'
import type {
    AIGateResult,
    BioRewriteStudioPayload,
    BioRewriteStudioResult,
    MatchRadarPayload,
    MatchRadarResult,
    PhotoSpotlightResult,
    ProfileAnalyzerResult,
} from './services/types'

const wrap = <Args, Data>(call: (args: Args) => Promise<Data>) => {
    return async (args: Args) => {
        try {
            const data = await call(args)
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
    }
}

export const aiFeaturesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        runProfileAnalyzer: builder.mutation<AIGateResult<ProfileAnalyzerResult>, void>({
            queryFn: wrap(() => runProfileAnalyzer()),
            invalidatesTags: ['Wallet'],
        }),
        runPhotoSpotlight: builder.mutation<AIGateResult<PhotoSpotlightResult>, void>({
            queryFn: wrap(() => runPhotoSpotlight()),
            invalidatesTags: ['Wallet'],
        }),
        runMatchRadar: builder.mutation<AIGateResult<MatchRadarResult>, MatchRadarPayload>({
            queryFn: wrap((payload) => runMatchRadar(payload)),
            invalidatesTags: ['Wallet'],
        }),
        runBioRewriteStudio: builder.mutation<
            AIGateResult<BioRewriteStudioResult>,
            BioRewriteStudioPayload
        >({
            queryFn: wrap((payload) => runBioRewriteStudio(payload)),
            invalidatesTags: ['Wallet'],
        }),
    }),
})

export const {
    useRunProfileAnalyzerMutation,
    useRunPhotoSpotlightMutation,
    useRunMatchRadarMutation,
    useRunBioRewriteStudioMutation,
} = aiFeaturesApi
