/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage public URLs. Host is derived from NEXT_PUBLIC_SUPABASE_URL.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
