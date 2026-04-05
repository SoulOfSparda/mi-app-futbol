/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      new URL('https://r2.thesportsdb.com/**'),
      new URL('https://www.thesportsdb.com/**'),
    ],
  },
};

export default nextConfig;
