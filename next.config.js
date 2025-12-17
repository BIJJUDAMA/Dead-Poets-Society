/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ojhlughcmuxjvbbqcwjh.supabase.co",
                pathname: "/storage/v1/object/public/**"
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                pathname: "/**"
            }
        ]
    },

    productionBrowserSourceMaps: false,
    turbopack: {}
};

export default nextConfig;
