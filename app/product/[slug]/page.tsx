// app/product/[slug]/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ProductCarousel from '@/components/product/ProductCarousel';
import ProductDetails from '@/components/product/ProductDetails';
import ProductPageSkeleton from '@/components/product/ProductPageSkeleton';
import ReviewList from '@/components/product/ReviewList';
import ReviewsSkeleton from '@/components/product/ReviewsSkeleton';
import {
  getProductBySlug,
  getProductImages,
  getProductReviews,
  getProductSpecs,
  getProductVariants,
  getRelatedProducts,
} from '@/lib/products';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found | ProShop', robots: { index: false } };

  const images = await getProductImages(product.product_id);
  const cover = images[0]?.image_url ?? product.image_url ?? undefined;
  const description = product.description?.slice(0, 155);

  return {
    title: `${product.name} | ProShop`,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

async function Reviews({ productId }: { productId: number }) {
  const reviews = await getProductReviews(productId);
  return <ReviewList reviews={reviews} />;
}

async function ProductContent({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [images, specs, variants] = await Promise.all([
    getProductImages(product.product_id),
    getProductSpecs(product.product_id),
    getProductVariants(product.product_id),
  ]);

  const hasDiscount = product.discount_price != null && product.discount_price < product.price;
  const price = hasDiscount ? (product.discount_price as number) : product.price;
  const imageUrls = images.map((i) => i.image_url);
  if (!imageUrls.length && product.image_url) imageUrls.push(product.image_url);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imageUrls,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'USD',
      availability:
        (product.stock_quantity ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductDetails
        key={product.product_id}
        product={product}
        images={images}
        specs={specs}
        variants={variants}
        reviewsSlot={
          <Suspense fallback={<ReviewsSkeleton />}>
            <Reviews productId={product.product_id} />
          </Suspense>
        }
      />
    </>
  );
}

async function RelatedProducts({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return null;

  const related = await getRelatedProducts(product.category_id, product.product_id, 8);
  if (!related.length) return null;

  return (
    <ProductCarousel
      id="related-heading"
      title={product.category_name ? `More in ${product.category_name}` : 'You may also like'}
      products={related}
      className="bg-slate-50"
    />
  );
}

const relatedGrid =
  'mx-auto grid max-w-[1500px] grid-cols-1 gap-2 px-4 sm:grid-cols-2 sm:gap-3 sm:px-15 lg:grid-cols-4 xl:px-0';

function RelatedFallback() {
  return (
    <section aria-hidden className="bg-slate-50 py-4 sm:py-6">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-15 xl:px-0">
        <div className="mb-4 border-b border-neutral-200 pb-3">
          <div className="h-6 w-48 rounded bg-neutral-200 motion-safe:animate-pulse" />
        </div>
      </div>
      <div className={relatedGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`aspect-[3/4] rounded-2xl bg-neutral-200 motion-safe:animate-pulse ${
              i === 0 ? '' : i < 2 ? 'hidden sm:block' : 'hidden lg:block'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default function ProductPage({ params }: PageProps) {
  return (
    <div className="pb-24 lg:pb-0">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-15 lg:py-10 xl:px-0">
        <Suspense fallback={<ProductPageSkeleton />}>
          <ProductContent params={params} />
        </Suspense>
      </div>

      <Suspense fallback={<RelatedFallback />}>
        <RelatedProducts params={params} />
      </Suspense>
    </div>
  );
}