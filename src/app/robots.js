export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/dev/'],
        },
        sitemap: 'https://dps.vercel.app/sitemap.xml',
    }
}
