import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://autoshifthouston.com';
  return [
    { url: base,              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/browse`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/sell`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
