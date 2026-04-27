import { ExternalLink } from 'lucide-react';

const placeholder = 'https://placehold.co/200x200/e59eaf/ffffff?text=Baby+Steps';

export default function ProductCard({ product, onClick }) {
  const fullyReserved = product.reservedQuantity >= product.stockQuantity;

  return (
    <div
      onClick={() => !fullyReserved && onClick(product)}
      className={`flex-shrink-0 w-40 bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-700
        ${fullyReserved ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
    >
      <div className="relative">
        <img
          src={product.imageURL || placeholder}
          alt={product.name}
          className={`w-full h-36 object-cover transition-all duration-700 ${fullyReserved ? 'grayscale' : ''}`}
          onError={(e) => { e.target.src = placeholder; }}
        />
        {fullyReserved && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="bg-white/90 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
              Reserved
            </span>
          </div>
        )}
        {product.productURL && (
          <div className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 shadow-sm">
            <ExternalLink size={10} className="text-gray-500" />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs text-gray-500 truncate">{product.brand}</p>
        <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{product.name}</p>
        <p className="text-sm text-header font-bold mt-1">R{product.price.toFixed(2)}</p>
        {product.notes && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-1.5 py-1 mt-1.5 leading-snug line-clamp-2">
            {product.notes}
          </p>
        )}
      </div>
    </div>
  );
}
