import { products } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        Home / <span className="text-gray-900 font-medium">All Products</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">


        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Our Products</h1>
            
            <div className="flex items-center gap-2 text-sm">
              <label className="text-gray-500 hidden sm:block">Sort by:</label>
              <select className="border border-gray-300 rounded p-1.5 outline-none bg-white">
                <option>Popularity</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
