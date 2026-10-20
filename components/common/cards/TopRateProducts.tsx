// src/components/common/cards/TopRateProducts.tsx
import { getTopRatedProducts } from '@/lib/products';
import ProductCarousel from '@/components/product/ProductCarousel';
const HOME_TOP_RATE_PRODUCTS = 7;

export default async function TopRateProducts() {
    const products = await getTopRatedProducts(HOME_TOP_RATE_PRODUCTS + 1);
    if (!products.length) return null;

    return (
      <ProductCarousel
        id="top-rated-heading"
        title="Top rated products"
        products={products.slice(0, HOME_TOP_RATE_PRODUCTS)}
        seeMoreHref={products.length > HOME_TOP_RATE_PRODUCTS ? '/products?sort=top-rated' : undefined}
      />
    );
}