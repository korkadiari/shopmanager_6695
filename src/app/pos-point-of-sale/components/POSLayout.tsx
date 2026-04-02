'use client';
import React, { useState } from 'react';
import ProductCatalog from './ProductCatalog';
import SalesCart from './SalesCart';
import PaymentModal from './PaymentModal';
import InvoiceModal from './InvoiceModal';
import { ShoppingCart, X } from 'lucide-react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  category: string;
}

export interface GeneratedInvoice {
  invoiceNumber: string;
  customer: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  paymentMethod: string;
  date: string;
}

export default function POSLayout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<GeneratedInvoice | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: { id: string; name: string; price: number; stock: number; category: string }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= existing.maxStock) return prev;
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: `cart-${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          maxStock: product.stock,
          category: product.category,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(qty, i.maxStock) } : i))
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handlePaymentComplete = (invoice: GeneratedInvoice) => {
    setGeneratedInvoice(invoice);
    setShowPaymentModal(false);
    setShowMobileCart(false);
    setCart([]);
    setDiscount(0);
    setSelectedCustomer('');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-100 overflow-hidden relative">
      {/* Product catalog — full width on mobile, flex-1 on desktop */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <ProductCatalog onAddToCart={addToCart} cartItems={cart} />
      </div>

      {/* Cart — hidden on mobile (shown as drawer), w-96 on desktop */}
      <div className="hidden lg:flex w-96 shrink-0 border-l border-slate-200 bg-white flex-col overflow-hidden">
        <SalesCart
          cart={cart}
          discount={discount}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
          selectedCustomer={selectedCustomer}
          onDiscountChange={setDiscount}
          onCustomerChange={setSelectedCustomer}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => setShowPaymentModal(true)}
          onClear={() => setCart([])}
        />
      </div>

      {/* Mobile Cart FAB */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowMobileCart(true)}
          className="relative w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors active:scale-95"
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Cart Drawer */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMobileCart(false)}
          />
          {/* Drawer slides up from bottom */}
          <div className="bg-white rounded-t-2xl shadow-2xl flex flex-col animate-slide-up" style={{ maxHeight: '85vh' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShoppingCart size={18} className="text-amber-500" />
                Panier ({cartCount} article{cartCount !== 1 ? 's' : ''})
              </h2>
              <button
                onClick={() => setShowMobileCart(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <SalesCart
                cart={cart}
                discount={discount}
                subtotal={subtotal}
                discountAmount={discountAmount}
                total={total}
                selectedCustomer={selectedCustomer}
                onDiscountChange={setDiscount}
                onCustomerChange={setSelectedCustomer}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={() => {
                  setShowMobileCart(false);
                  setShowPaymentModal(true);
                }}
                onClear={() => setCart([])}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal — slide-out drawer on mobile, centered modal on desktop */}
      {showPaymentModal && (
        <>
          {/* Mobile: bottom drawer */}
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
            <div
              className="flex-1 bg-black/50"
              onClick={() => setShowPaymentModal(false)}
            />
            <div className="bg-white rounded-t-2xl shadow-2xl animate-slide-up overflow-y-auto" style={{ maxHeight: '92vh' }}>
              <PaymentModal
                total={total}
                cart={cart}
                discount={discount}
                subtotal={subtotal}
                customer={selectedCustomer}
                onClose={() => setShowPaymentModal(false)}
                onComplete={handlePaymentComplete}
                isMobileDrawer
              />
            </div>
          </div>
          {/* Desktop: centered modal */}
          <div className="hidden lg:flex fixed inset-0 bg-black/50 items-center justify-center z-50 p-4 animate-fade-in">
            <PaymentModal
              total={total}
              cart={cart}
              discount={discount}
              subtotal={subtotal}
              customer={selectedCustomer}
              onClose={() => setShowPaymentModal(false)}
              onComplete={handlePaymentComplete}
            />
          </div>
        </>
      )}

      {/* Invoice Modal */}
      {generatedInvoice && (
        <InvoiceModal
          invoice={generatedInvoice}
          onClose={() => setGeneratedInvoice(null)}
        />
      )}
    </div>
  );
}