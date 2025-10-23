/// <reference types="astro/client" />

export function getOptimizedImageUrl(originalUrl: string | null | undefined, width: number, height: number): string {
  if (!originalUrl) {
    return '/default-avatar.png';
  }
  try {
    const url = new URL(originalUrl);
    const pathSegments = url.pathname.split('/');
    if (pathSegments.length < 6) { return originalUrl; }
    const bucketName = pathSegments[4];
    const imagePath = pathSegments.slice(5).join('/');
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn("PUBLIC_SUPABASE_URL not defined. Using relative path.");
      return `/storage/v1/render/image/public/${bucketName}/${imagePath}?width=${width}&height=${height}&resize=cover`;
    }
    const transformUrl = `${supabaseUrl}/storage/v1/render/image/public/${bucketName}/${imagePath}?width=${width}&height=${height}&resize=cover`;
    return transformUrl;
  } catch (error) {
    console.error("Failed to parse/transform image URL:", originalUrl, error);
    return originalUrl;
  }
}