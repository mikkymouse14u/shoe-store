import { NavLink } from "react-router-dom";
import type { SyntheticEvent } from "react";
import type { Product } from "../types/product";

// A couple of the seeded Unsplash URLs are dead (they 404). Rather than
// letting the browser draw its broken-image icon, hide the <img> and let
// the grey panel behind it show through.
// `SyntheticEvent<HTMLImageElement>` is React's cross-browser wrapper around
// a native DOM event; the generic parameter says which element type
// triggered it, so `event.currentTarget` is typed as an <img> (and has
// `.style`, `.src`, etc.) instead of a generic Element.
const hideOnError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.style.visibility = "hidden";
};

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  // Every product carries four photos but the card only ever showed the
  // first. The second one now fades in on hover, which is the cheapest way
  // to let someone see another angle without leaving the grid.
  // Same single width the landing page uses, so a photo already fetched
  // there is served from cache here instead of downloaded again.
  const sized = (url: string | undefined): string | undefined =>
    typeof url === "string" && url.includes("images.unsplash.com")
      ? url.replace(/([?&])w=\d+/, "$1w=800")
      : url;

  const front = sized(product.images?.[0]);
  const back = sized(product.images?.[1]);

  return (
    <NavLink
      to={`/product/${product._id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={front}
          alt={product.name}
          loading="lazy"
          onError={hideOnError}
          className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        {back && (
          <img
            src={back}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={hideOnError}
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100 motion-reduce:transition-none"
          />
        )}

        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-700 backdrop-blur-sm">
          {product.brand}
        </span>
      </div>

      <div className="space-y-1 p-5">
        <h3 className="font-medium text-gray-900 transition-colors group-hover:text-red-600">
          {product.name}
        </h3>
        <p className="text-xl font-bold text-gray-900">${product.price}</p>
      </div>
    </NavLink>
  );
}

export default ProductCard;
