"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { addressApi, orderApi } from "@/lib/api";
import {
  CheckCircle,
  MapPin,
  CreditCard,
  Truck,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    icon: "💵",
    desc: "Pay when your order arrives",
  },
  { id: "upi", label: "UPI", icon: "📱", desc: "GPay, PhonePe, Paytm & more" },
  {
    id: "card",
    label: "Credit / Debit Card",
    icon: "💳",
    desc: "Visa, Mastercard, RuPay",
  },
];

const STEPS = ["Address", "Payment", "Review"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, clearCart } = useCart();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    address_type: "home",
    is_default: false,
  });

  // Auto-calculate totals from items
  const mrpTotal = Math.round(
    items.reduce(
      (sum, i) =>
        sum +
        (i.product.originalPrice || i.product.discountedPrice) * i.quantity,
      0,
    ),
  );
  const payableTotal = Math.round(
    items.reduce((sum, i) => sum + i.product.discountedPrice * i.quantity, 0),
  );
  const savings = mrpTotal - payableTotal;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (items.length === 0 && !ordered) {
      router.push("/cart");
      return;
    }

    addressApi
      .get()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedAddress(def.id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const newAddr = await addressApi.add(addressForm);
      setAddresses((prev) => [newAddr, ...prev]);
      setSelectedAddress(newAddr.id);
      setShowForm(false);
      setAddressForm({
        name: "",
        phone: "",
        pincode: "",
        locality: "",
        address: "",
        city: "",
        state: "",
        address_type: "home",
        is_default: false,
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }

    setPlacing(true);
    try {
      const result = await orderApi.place({
        address_id: selectedAddress,
        payment_method: paymentMethod,
        cart_items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      });
      await clearCart();
      setOrderId(result.order?.id || result.id || "—");
      setOrdered(true);
    } catch (err) {
      alert(err.message || "Unable to place the order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // ── Success Screen ────────────────────────────────────
  if (ordered)
    return (
      <div className="store-shell min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed! 🎉
          </h1>
          <p className="text-gray-500 text-sm mb-1">Order #{orderId}</p>
          <p className="text-gray-400 text-xs mb-4">
            Delivery in 3–7 business days ।
          </p>
          <div className="bg-orange-50 rounded-xl p-3 mb-8">
            <p className="text-orange-700 text-sm font-bold">
              Total Paid: ₹{payableTotal.toLocaleString()}
            </p>
            <p className="text-orange-500 text-xs mt-0.5">
              {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.icon}{" "}
              {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/orders"
              className="flex-1 bg-black text-white py-3 rounded-lg text-sm font-bold text-center hover:bg-gray-800 transition"
            >
              Track Order
            </Link>
            <Link
              href="/"
              className="flex-1 border border-gray-200 py-3 rounded-lg text-sm font-bold text-center hover:bg-gray-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={36} />
      </div>
    );

  const selectedAddr = addresses.find((a) => a.id === selectedAddress);

  return (
    <div className="store-shell min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/cart" className="hover:text-black transition">
            Cart
          </Link>
          <ChevronRight size={14} />
          <span className="font-bold text-gray-900">Checkout</span>
        </div>

        {/* Steps */}
        <div className="-mx-4 mb-8 flex items-center gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${
                  step === i
                    ? "bg-black text-white"
                    : i < step
                      ? "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {i < step ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
                {s}
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 ${i < step ? "bg-green-400" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            {/* STEP 0: Address */}
            {step === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <MapPin size={18} className="text-orange-500" /> Delivery
                    Address
                  </h2>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={14} /> Add New
                  </button>
                </div>

                {showForm && (
                  <form
                    onSubmit={handleAddAddress}
                    className="mb-6 p-4 bg-gray-50 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <h3 className="col-span-full text-sm font-bold text-gray-700">
                      New Address
                    </h3>
                    {[
                      { name: "name", placeholder: "Full Name" },
                      { name: "phone", placeholder: "Phone Number" },
                      { name: "pincode", placeholder: "Pincode" },
                      { name: "locality", placeholder: "Locality / Area" },
                      { name: "city", placeholder: "City" },
                      { name: "state", placeholder: "State" },
                    ].map((f) => (
                      <input
                        key={f.name}
                        required
                        placeholder={f.placeholder}
                        value={addressForm[f.name]}
                        onChange={(e) =>
                          setAddressForm((p) => ({
                            ...p,
                            [f.name]: e.target.value,
                          }))
                        }
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    ))}
                    <textarea
                      required
                      placeholder="Full Address"
                      rows={2}
                      value={addressForm.address}
                      onChange={(e) =>
                        setAddressForm((p) => ({
                          ...p,
                          address: e.target.value,
                        }))
                      }
                      className="col-span-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <div className="col-span-full flex gap-3">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="border px-5 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 && !showForm ? (
                  <div className="text-center py-8 text-gray-400">
                    <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No saved addresses found.</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-3 text-blue-600 text-sm font-bold hover:underline"
                    >
                      + Add Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedAddress === addr.id ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-300"}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${selectedAddress === addr.id ? "border-black bg-black" : "border-gray-300"}`}
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-gray-800">
                                {addr.name}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded capitalize">
                                {addr.address_type}
                              </span>
                              {addr.is_default && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {addr.address}, {addr.locality}
                            </p>
                            <p className="text-sm text-gray-600">
                              {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              📞 {addr.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!selectedAddress) {
                      alert("Please select an address.");
                      return;
                    }
                    setStep(1);
                  }}
                  className="w-full mt-6 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 1: Payment */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <CreditCard size={18} className="text-orange-500" /> Payment
                  Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center gap-4 ${paymentMethod === pm.id ? "border-black bg-gray-50" : "border-gray-100 hover:border-gray-300"}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${paymentMethod === pm.id ? "border-black bg-black" : "border-gray-300"}`}
                      />
                      <span className="text-2xl">{pm.icon}</span>
                      <div>
                        <p className="font-bold text-sm text-gray-800">
                          {pm.label}
                        </p>
                        <p className="text-xs text-gray-400">{pm.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-orange-50 rounded-xl text-center">
                  <p className="text-xs text-orange-700 font-bold">
                    Total Payable: ₹{payableTotal.toLocaleString()}
                    {savings > 0 && (
                      <span className="ml-2 text-green-600">
                        (₹{savings.toLocaleString()} saved!)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-[2] bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition flex items-center justify-center gap-2"
                  >
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <Truck size={18} className="text-orange-500" /> Review Order
                </h2>

                {selectedAddr && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Delivering To
                    </p>
                    <p className="font-bold text-sm text-gray-800">
                      {selectedAddr.name} — 📞 {selectedAddr.phone}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {selectedAddr.address}, {selectedAddr.locality},{" "}
                      {selectedAddr.city} — {selectedAddr.pincode}
                    </p>
                  </div>
                )}

                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Payment
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.icon}{" "}
                    {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}
                  </p>
                </div>

                <div className="mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Items ({totalItems})
                  </p>
                  <div className="space-y-3">
                    {items.map(({ cartId, quantity, product }) => (
                      <div key={cartId} className="flex gap-3 items-center">
                        <img
                          src={product.images?.[0] || "/placeholder.jpg"}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            ₹{product.discountedPrice} × {quantity}
                            {product.originalPrice >
                              product.discountedPrice && (
                              <span className="ml-1 line-through text-gray-300">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="font-bold text-sm text-gray-900 flex-shrink-0">
                          ₹
                          {(
                            product.discountedPrice * quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total breakdown */}
                  <div className="mt-4 pt-4 border-t space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>MRP Total</span>
                      <span>₹{mrpTotal.toLocaleString()}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>− ₹{savings.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery</span>
                      <span className="text-green-600 font-medium">FREE</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                      <span>Total Payable</span>
                      <span>₹{payableTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {placing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "🎉"
                    )}
                    {placing
                      ? "Placing..."
                      : `Place Order • ₹${payableTotal.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h2 className="font-bold text-gray-700 uppercase text-sm tracking-wide mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                {items.map(({ cartId, quantity, product }) => (
                  <div key={cartId} className="flex gap-2 items-center">
                    <img
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">x{quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-800 flex-shrink-0">
                      ₹{(product.discountedPrice * quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>MRP ({totalItems} items)</span>
                  <span>₹{mrpTotal.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>− ₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total Payable</span>
                  <span>₹{payableTotal.toLocaleString()}</span>
                </div>
              </div>
              {savings > 0 && (
                <div className="mt-3 bg-green-50 rounded-lg p-2 text-center">
                  <p className="text-green-700 text-xs font-bold">
                    🎉 ₹{savings.toLocaleString()} saving!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
