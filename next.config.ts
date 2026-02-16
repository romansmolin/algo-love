import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    turbopack: {
        root: path.resolve(__dirname),
    },
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            },
        ],
    },
}

export default nextConfig
