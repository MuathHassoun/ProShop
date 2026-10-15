// components/product/Advertising.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Product } from '@/types';

interface Props {
  product: Product;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

// Remember to advertise the first five products, as they will be in stock and there is a discount.
export default function Advertising({ product }: Props) {
  const salePrice = product.discount_price ?? product.price;
  const hasDiscount =
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    product.discount_price < product.price;
  const rating = Math.round(product.rating ?? 0);

  return (
    <section className="relative w-full overflow-hidden bg-gray-200 text-neutral-800">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-stretch overflow-hidden bg-gray-200 md:min-h-[400px] md:flex-row md:items-center md:gap-8 md:px-6 lg:min-h-[500px] lg:px-8 xl:max-w-[1400px] xl:gap-16 xl:p-10 2xl:max-w-[1680px] 2xl:gap-28 2xl:px-24">
        {/* Image: on top for mobile, right side on md+ */}
        <div className="relative order-first m-3 aspect-[4/3] overflow-hidden rounded-2xl bg-white sm:aspect-[16/9] md:order-last md:m-0 md:aspect-auto md:min-h-[360px] md:flex-1 md:basis-0 lg:min-h-[420px] 2xl:min-h-[520px]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-4xl font-bold text-black sm:text-5xl lg:text-[64px]">
                <span className="text-yellow-400">Pro</span>Shop
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex w-full min-w-0 flex-col items-center justify-center gap-3 px-5 py-6 text-center sm:gap-4 sm:px-8 sm:py-8 md:flex-1 md:basis-0 md:items-start md:px-4 md:py-0 md:text-left lg:px-6 xl:px-0 2xl:gap-5">
          <p className="text-base font-bold uppercase tracking-[0.05em] text-yellow-600 sm:text-lg lg:text-xl">
            Save up to {formatPrice(salePrice)}
          </p>
          <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl 2xl:text-5xl">{product.name}</h2>
          {product.description ? (
            <p className="max-w-lg text-sm text-neutral-600 sm:text-base 2xl:max-w-xl 2xl:text-lg">
              {product.description}
            </p>
          ) : null}

          <div className="mt-3 flex w-full flex-col items-center gap-4 sm:mt-5 sm:flex-row sm:justify-center sm:gap-8 md:justify-start lg:gap-12">
            <div className="flex flex-col items-center gap-2 md:items-start">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'}
                    size={18}
                  />
                ))}
              </div>
              <p className="text-sm text-neutral-500">
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </p>
            </div>

            <Link
              href={`/product/${product.slug}`}
              className="inline-flex w-full max-w-[260px] items-center justify-center rounded-[15px] bg-yellow-400 px-8 py-3 text-center font-normal tracking-[0.1em] text-black transition hover:text-primary-500 sm:w-[200px] sm:px-11"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}