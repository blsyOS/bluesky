"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";
import { productRegistry, PRODUCT_COOKIE } from "@/lib/products";
import { setPreferenceCookie } from "@/lib/cookies";

/**
 * Active product context. Product switching is an administrative action
 * (Settings → Product Context), not sidebar navigation — this context lets
 * the Settings panel switch products while the shell rebuilds its sidebar
 * from the same state. Switching persists the choice (cookie, read
 * server-side in the layout so SSR renders the right sidebar) and lands on
 * the product's default dashboard.
 */
type ProductContextValue = {
  activeProductId: string;
  switchProduct: (id: string) => void;
};

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductContextProvider({
  initialProductId,
  children,
}: {
  initialProductId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [activeProductId, setActiveProductId] = useState(initialProductId);

  const switchProduct = useCallback(
    (id: string) => {
      const config = productRegistry.get(id);
      if (!config || id === activeProductId) return;
      setActiveProductId(id);
      setPreferenceCookie(PRODUCT_COOKIE, id);
      router.push(config.defaultLanding);
    },
    [router, activeProductId]
  );

  return (
    <ProductContext.Provider value={{ activeProductId, switchProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error(
      "useProductContext must be used inside <ProductContextProvider>."
    );
  }
  return ctx;
}
