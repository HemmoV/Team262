/* eslint-disable @next/next/no-img-element */

// Toont de productfoto, of het Team262-logo als placeholder als er (nog) geen foto is.
export default function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  if (src) return <img src={src} alt={alt} loading="lazy" />;
  return (
    <div className="product-placeholder">
      <img src="/img/logo-white.svg" alt="" />
    </div>
  );
}
