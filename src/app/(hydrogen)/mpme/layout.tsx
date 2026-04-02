'use client';

import { CartProvider } from '@/store/quick-cart/cart.context';

export default function MPMELayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            {children}
        </CartProvider>
    );
}