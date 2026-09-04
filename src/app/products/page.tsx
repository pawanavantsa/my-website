import type { Metadata } from "next";
import { ProductsShowcase } from "@/components/products/ProductsShowcase";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Products",
  description: `Explore ${products.length}+ AI products and solutions from ${site.legalName} — inQ, Xeroura CS, LiveBot, Xeroura AI, and more.`,
};

export default function ProductsPage() {
  return (
    <>
      <h1 className="sr-only">Products</h1>
      <ProductsShowcase products={products} />
    </>
  );
}
