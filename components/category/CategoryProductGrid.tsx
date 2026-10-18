// components/category/CategoryProductGrid.tsx
'use client';
import ProductCard from '@/components/product/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import type { Product } from '@/types';

export default function CategoryProductGrid({ products }: { products: Product[] }) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.cartItems);

  const handleAdd = (product: Product) => {
    const stock = product.stock_quantity ?? 0;
    if (stock <= 0) return;

    const inCart = cartItems.find((i) => i.product_id === product.product_id)?.quantity ?? 0;
    const hasDiscount =
      product.discount_price !== null &&
      product.discount_price !== undefined &&
      product.discount_price < product.price;

    dispatch(
      addToCart({
        product_id: product.product_id,
        name: product.name,
        slug: product.slug,
        price: hasDiscount ? (product.discount_price as number) : product.price,
        image_url: product.image_url ?? '',
        stock_quantity: stock,
        quantity: Math.min(inCart + 1, stock),
      })
    );
  };

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <li key={product.product_id} className="min-w-0">
          <ProductCard product={product} onAddToCart={handleAdd} />
        </li>
      ))}
    </ul>
  );
}