import { useParams } from "react-router-dom";
import api from "../api/api";
import { useState, useEffect } from "react";
import { useCart } from "../Contexts/CartContext";
import type { Product as ProductType } from "../types/product";

function Product() {
  // Starts as null because we don't have the product yet — it's fetched
  // from the API in the effect below, once we know which id to ask for.
  const [product, setProduct] = useState<ProductType | null>(null);
  const [mainImage, setmainImage] = useState("");
  const { addTocart } = useCart();
  const [quantity, setQuantity] = useState(1);
  // useParams reads the dynamic segment from the URL that App.tsx's route
  // ("/product/:id") declared. Its type is `{ id: string | undefined }` —
  // TypeScript can't guarantee the URL actually had that segment filled in,
  // so `id` has to be checked before use, which is why the code below
  // guards on `if (!id) return`.
  const { id } = useParams<{ id: string }>();

  // Re-fetch whenever `id` changes (e.g. navigating from one product page
  // straight to another) — that's what the `[id]` dependency array means:
  // "re-run this effect whenever `id` is different from last render".
  useEffect(() => {
    const getProduct = async () => {
      if (!id) return;

      try {
        const res = await api.get<ProductType>(`/products/${id}`);
        setProduct(res.data);
        setmainImage(res.data.images?.[0] || "");
      } catch {
        console.log("Failed to load product");
      }
    };

    if (id) getProduct();
  }, [id]);

  // (Name keeps its original typo — "handelClick" — left as-is since this
  // pass only adds comments, not renames.)
  const handelClick = () => {
    if (!product) return;
    addTocart(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-4 md:py-10 grid lg:grid-cols-2 gap-12">
      {/* images */}
      <div className="w-full">
        <div className="aspect-square md:aspect-4/3 lg:aspect-square overflow-hidden rounded-2xl min-h-[410]">
          {/* `product?.name` is optional chaining: it reads `.name` only if
              `product` isn't null/undefined, otherwise the whole expression
              short-circuits to `undefined` instead of throwing. Needed here
              because `product` starts out null before the fetch resolves. */}
          <img
            src={mainImage || "/placeholder.png"}
            alt={product?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* thumbnails */}
        <div
          className="flex gap-4 mt-6 justify-center
        "
        >
          {product?.images?.map((image, index) => (
            <img
              key={index}
              className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition ${mainImage === image ? "border-[#ff7d1a] scale-105" : "border-transparent"}`}
              src={image}
              alt=""
              onClick={() => setmainImage(image)}
            />
          ))}
        </div>
      </div>

      {/* other info */}
      <div className="lg:mt-[10%]">
        <p className="text-[#ff7d1a] uppercase text-sm font-bold tracking-widest">
          {" "}
          {product?.brand}
        </p>

        <h1 className="text-4xl font-bold mt-4"> {product?.name}</h1>

        <p className="text-gray-500 mt-6"> {product?.description}</p>

        <div className="mt-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">${product?.price}</span>
            <span className="bg-black text-white text-sm px-2 py-1 rounded-md ">
              50%
            </span>
          </div>

          <p className="text-gray-400">${product?.price}</p>
        </div>
        <div className="mt-8 flex flex-col lg:flex-row gap-4">
          <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-xl lg:w-40">
            <button
              className="text-red-500 text-xl font-bold cursor-pointer"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              {" "}
              -
            </button>
            <span>{quantity}</span>
            <button
              className="text-red-500 text-xl font-bold cursor-pointer"
              onClick={() => setQuantity((q) => q + 1)}
            >
              {" "}
              +
            </button>
          </div>

          <button
            onClick={handelClick}
            className="flex-1 shrink-0 bg-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-3 cursor-pointer shadow-md hover:shadow-xl transition duration-300 text-white"
          >
            <img
              src="/images/icon-cart.svg"
              alt=""
              className="w-5 brightness-0 invert"
            />{" "}
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Product;
