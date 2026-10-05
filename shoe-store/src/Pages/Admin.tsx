import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import api from "../api/api";
import type { Product, ProductDraft } from "../types/product";

// The blank starting point for the form, and what it resets to after a
// successful submit or a "Clear" click. `category` defaults to "men" — one
// of only the two values ProductDraft's type allows (see types/product.ts).
const EMPTY: ProductDraft = {
  name: "",
  brand: "",
  category: "men",
  price: "",
  description: "",
  images: ["", "", "", ""],
};

// A caught error's type is `unknown` — TypeScript won't let you read
// `.message` off it directly, because it could be literally anything that
// was thrown, not necessarily an Error object. `axios.isAxiosError(error)`
// and `error instanceof Error` are "type guards": checks that, once true,
// let TypeScript treat `error` as a more specific type for the rest of that
// `if` block, so `.message` becomes safe to access.
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function Admin() {
  const [form, setForm] = useState<ProductDraft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = async () => {
    try {
      const res = await api.get<Product[]>("/products");
      setProducts(res.data);
    } catch {
      // The list is a convenience, not the point of the page — if it fails
      // the form above still works, so don't shout about it.
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // `Omit<ProductDraft, "images">` builds a new type that's ProductDraft
  // minus the `images` field (which is handled separately by `setImage`
  // below, since it's an array rather than a plain text value).
  // `keyof` turns that type into a union of its property names ("name" |
  // "brand" | "category" | "price" | "description"), so `field` can only
  // ever be one of those — a typo like "naem" would fail to compile.
  //
  // This is a function that *returns* a change handler: calling
  // `setField("name")` gives back an `onChange` function pre-wired to
  // update just the "name" field, so one small helper covers every text
  // input/select instead of writing a separate handler for each.
  const setField =
    (field: keyof Omit<ProductDraft, "images">) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const setImage = (index: number) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => {
      const images = [...prev.images];
      images[index] = event.target.value;
      return { ...prev, images };
    });

  // The first image that actually has a URL in it — that's what the store
  // shows on the product card, so that's what we preview.
  const previewUrl = form.images.find((url) => url.trim());

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      // `form.price` is kept as a string the whole time it's being typed
      // (see the ProductDraft comment in types/product.ts for why), and
      // only gets converted to a real number right here, at the moment the
      // request body is built.
      await api.post("/products", {
        ...form,
        price: Number(form.price),
        images: form.images.filter((url) => url.trim()),
      });

      toast.success(`${form.name} added to the store`);
      setForm(EMPTY);
      loadProducts();
    } catch (error) {
      // The server sends a readable sentence in `message` — show that
      // rather than a generic "something went wrong".
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const field =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 transition focus:border-red-500 focus:outline-none";

  const label =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Add a shoe
        </h1>
        <p className="mt-2 max-w-xl text-gray-500">
          New products appear on the storefront straight away.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------------- form ---------------- */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="name">Name</label>
              <input
                id="name"
                className={field}
                value={form.name}
                onChange={setField("name")}
                placeholder="Air Max 270"
              />
            </div>

            <div>
              <label className={label} htmlFor="brand">Brand</label>
              <input
                id="brand"
                className={field}
                value={form.brand}
                onChange={setField("brand")}
                placeholder="Nike"
              />
            </div>

            <div>
              <label className={label} htmlFor="category">Category</label>
              {/* Only "men" and "women" are ever offered here, matching the
                  fixed set of values Product's `category` type allows — the
                  form can't accidentally submit some other category string. */}
              <select
                id="category"
                className={field}
                value={form.category}
                onChange={setField("category")}
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>

            <div>
              <label className={label} htmlFor="price">Price (USD)</label>
              <input
                id="price"
                type="number"
                min="1"
                step="1"
                className={field}
                value={form.price}
                onChange={setField("price")}
                placeholder="150"
              />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={4}
              className={`${field} resize-y`}
              value={form.description}
              onChange={setField("description")}
              placeholder="Lightweight running shoes with maximum cushioning."
            />
          </div>

          <div>
            <label className={label}>Image URLs</label>
            <div className="space-y-3">
              {form.images.map((url, index) => (
                <input
                  key={index}
                  className={field}
                  value={url}
                  onChange={setImage(index)}
                  placeholder={
                    index === 0
                      ? "Main image — shown on the product card"
                      : `Extra image ${index + 1} (optional)`
                  }
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Paste full URLs. The first one is the card image.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-red-500 px-7 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add shoe"}
            </button>

            <button
              type="button"
              onClick={() => setForm(EMPTY)}
              className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              Clear
            </button>
          </div>
        </form>

        {/* ---------------- live preview ---------------- */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className={label}>Preview</p>

          <div className="overflow-hidden rounded-2xl bg-white shadow-md">
            <div className="flex h-56 items-center justify-center overflow-hidden bg-gray-100">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  // A typo'd URL would otherwise render as a broken-image
                  // icon, which looks like the page is broken.
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = "block";
                  }}
                />
              ) : (
                <span className="px-6 text-center text-sm text-gray-400">
                  Paste an image URL to see it here
                </span>
              )}
            </div>

            <div className="space-y-1 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                {form.brand || "Brand"}
              </p>
              <h3 className="text-lg font-medium text-gray-900">
                {form.name || "Shoe name"}
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                ${form.price || "0"}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-400">
            This is how the shoe will look on the storefront.
          </p>
        </aside>
      </div>

      {/* ---------------- existing products ---------------- */}
      <section className="mt-16">
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          In the store{" "}
          <span className="font-normal text-gray-400">({products.length})</span>
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3 font-semibold">Shoe</th>
                <th className="px-5 py-3 font-semibold">Brand</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 text-right font-semibold">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-gray-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-5 py-3 text-gray-500">{product.brand}</td>
                  <td className="px-5 py-3 capitalize text-gray-500">{product.category}</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">
                    ${product.price}
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                    No shoes yet — add the first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Admin;
