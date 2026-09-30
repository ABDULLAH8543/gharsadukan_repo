"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { CartItem } from "../types";

type CartClientProps = {
  initialItems: CartItem[];
};

function formatPkr(value: number) {
  return `PKR ${value.toFixed(2)}`;
}

export function CartClient({ initialItems }: CartClientProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * item.price, 0),
    [items],
  );
  const shipping = items.length === 0 ? 0 : subtotal >= 50 ? 0 : 8;
  const total = subtotal + shipping;

  function increaseQty(name: string) {
    setItems((prev) =>
      prev.map((item) => (item.name === name ? { ...item, qty: item.qty + 1 } : item)),
    );
  }

  function decreaseQty(name: string) {
    setItems((prev) =>
      prev
        .map((item) => (item.name === name ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    );
  }

  function deleteProduct(name: string) {
    setItems((prev) => prev.filter((item) => item.name !== name));
  }

  function placeOrder() {
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setItems([]);
    alert("Order is placed.");
  }

  return (
    <section className="grid gap-0 lg:grid-cols-12">
      <article className="reveal border-b border-[var(--line)] p-5 sm:p-8 lg:col-span-8 lg:border-b-0 lg:border-r">
        <p className="kicker">Shopping Desk</p>
        <h2 className="mt-2 text-3xl newspaper-title sm:text-5xl">Your Cart</h2>
        <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
          Review selected items before checkout.
        </p>

        {items.length === 0 ? (
          <div className="mt-6 border border-[var(--line)] bg-white/40 p-4 text-sm text-[var(--ink-soft)]">
            Your cart is empty.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.name}
                className="grid gap-3 border border-[var(--line)] bg-white/40 p-4 sm:grid-cols-[84px_1fr_auto] sm:items-center"
              >
                <div className="relative h-20 w-20 overflow-hidden border border-[var(--line)] bg-[var(--paper-strong)]">
                  <Image
                    src={item.imageUrl || "/placeholder.png"}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="font-semibold text-[var(--ink)]">{item.name}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{formatPkr(item.price)} each</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border border-[var(--line)]">
                    <button
                      onClick={() => decreaseQty(item.name)}
                      className="px-3 py-1 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper-strong)]"
                      aria-label={`Decrease quantity for ${item.name}`}
                    >
                      -
                    </button>
                    <span className="min-w-10 border-x border-[var(--line)] px-3 py-1 text-center text-sm">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => increaseQty(item.name)}
                      className="px-3 py-1 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--paper-strong)]"
                      aria-label={`Increase quantity for ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => deleteProduct(item.name)}
                    className="text-xs font-semibold tracking-[0.12em] text-[var(--accent)] hover:underline"
                  >
                    DELETE PRODUCT
                  </button>

                  <p className="font-bold text-[var(--ink)]">{formatPkr(item.qty * item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <aside className="reveal reveal-delay-1 p-5 sm:p-8 lg:col-span-4">
        <h3 className="newspaper-title text-2xl">Order Summary</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="text-[var(--ink-soft)]">Subtotal</span>
            <span className="font-semibold">{formatPkr(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="text-[var(--ink-soft)]">Shipping</span>
            <span className="font-semibold">{shipping === 0 ? "FREE" : formatPkr(shipping)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold">{formatPkr(total)}</span>
          </div>
        </div>

        <button
          onClick={placeOrder}
          className="mt-6 w-full border border-[var(--ink)] px-5 py-3 text-sm font-semibold tracking-[0.1em] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]"
        >
          PROCEED TO CHECKOUT
        </button>
      </aside>
    </section>
  );
}
