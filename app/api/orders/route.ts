import { NextRequest } from "next/server";
import {
  createOrder,
  getOrdersByEmail,
  getProductById,
  getOrders,
} from "@/lib/db";
import { sessionFromRequest, json, badRequest } from "@/lib/api-helpers";
import { DELIVERY_ZONES, FREE_DELIVERY_THRESHOLD } from "@/lib/format";

export async function GET(req: NextRequest) {
  const user = await sessionFromRequest(req);
  if (!user) return json({ error: "Not signed in." }, 401);
  const { searchParams } = new URL(req.url);
  // Admins can list everything via the admin endpoint; here scope to own email.
  if (user.role === "admin" && searchParams.get("all") === "true") {
    return json({ orders: await getOrders() });
  }
  const orders = await getOrdersByEmail(user.email);
  return json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, city, zone, items, paymentMethod, notes } =
      body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !address?.trim() || !city?.trim()) {
      return badRequest("Please fill in all delivery details.");
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return badRequest("Please enter a valid email address.");
    }
    if (!Array.isArray(items) || items.length === 0) {
      return badRequest("Your cart is empty.");
    }

    // Re-price on the server so totals can't be tampered with.
    let subtotal = 0;
    const pricedItems = [];
    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product) return badRequest("One of the products is no longer available.");
      if (!product.sizes.includes(item.size)) return badRequest(`Size ${item.size} is not available for ${product.name}.`);
      const qty = Math.max(1, Math.min(99, Number(item.qty) || 1));
      if (product.stock < qty) {
        return badRequest(`Only ${product.stock} unit(s) of ${product.name} left in stock.`);
      }
      subtotal += product.price * qty;
      pricedItems.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: item.size,
        color: product.colors.includes(item.color) ? item.color : product.colors[0],
        price: product.price,
        qty,
        image: product.images[0],
      });
    }

    const zoneInfo = DELIVERY_ZONES.find((z) => z.id === zone) ?? DELIVERY_ZONES[0];
    const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : zoneInfo.fee;
    const total = subtotal + delivery;

    const user = await sessionFromRequest(req);

    const order = await createOrder({
      userId: user?.id,
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      zone: zoneInfo.label,
      items: pricedItems,
      subtotal,
      delivery,
      total,
      paymentMethod: paymentMethod || "bank-transfer",
      paymentStatus: paymentMethod === "pay-on-delivery" ? "on-delivery" : "pending",
      notes: notes?.trim(),
    });

    return json({ order }, 201);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Could not place order.");
  }
}
