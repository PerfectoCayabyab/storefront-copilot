// Seed catalog + orders for the one-click demo store, so reviewers can try
// the dashboard and AI assistant without entering any data.

export const DEMO_STORE = {
  name: "Aurora Outfitters",
  description:
    "Outdoor apparel and gear for hikers, campers, and trail runners. Sustainable materials, field-tested designs.",
  currency: "USD",
};

export type DemoProduct = {
  title: string;
  description: string;
  price: number;
  inventory: number;
  category: string;
  status: "active" | "draft";
};

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    title: "Ridgeline Waterproof Shell Jacket",
    description:
      "A 3-layer waterproof shell with fully taped seams, pit zips, and a helmet-compatible hood. Weighs just 310 g and packs into its own chest pocket. Ideal for alpine hiking in unpredictable weather.",
    price: 189.0,
    inventory: 42,
    category: "Apparel",
    status: "active",
  },
  {
    title: "Basecamp Merino Hoodie",
    description:
      "Midweight 100% merino wool hoodie that regulates temperature and resists odor for days on the trail. Flatlock seams prevent chafing under a pack.",
    price: 129.0,
    inventory: 58,
    category: "Apparel",
    status: "active",
  },
  {
    title: "Switchback Convertible Hiking Pants",
    description:
      "Stretch-woven nylon pants that zip off into shorts. Quick-dry, UPF 50+, with a gusseted crotch and five pockets including a zippered thigh pocket.",
    price: 84.0,
    inventory: 73,
    category: "Apparel",
    status: "active",
  },
  {
    title: "Trailhead Trucker Cap",
    description:
      "Classic six-panel trucker cap with a moisture-wicking sweatband and laser-cut vent holes. One size fits most.",
    price: 28.0,
    inventory: 120,
    category: "Apparel",
    status: "active",
  },
  {
    title: "Summit Pro Trail Runners",
    description:
      "Aggressive 5 mm lugs, rock plate, and a breathable engineered-mesh upper. Zero-drop platform with a wide toe box for natural foot splay on long runs.",
    price: 149.0,
    inventory: 36,
    category: "Footwear",
    status: "active",
  },
  {
    title: "Creekside Waterproof Hiking Boots",
    description:
      "Full-grain leather boots with a waterproof membrane, Vibram outsole, and ankle support for heavy loads. Break-in friendly and resoleable.",
    price: 179.0,
    inventory: 27,
    category: "Footwear",
    status: "active",
  },
  {
    title: "Camp Mocs Recycled Slippers",
    description:
      "Insulated camp slippers made from recycled ripstop with a grippy rubber sole. Compress flat to stash in any pack pocket.",
    price: 45.0,
    inventory: 64,
    category: "Footwear",
    status: "active",
  },
  {
    title: "Aurora 2P Ultralight Tent",
    description:
      "Two-person, three-season tent at 1.4 kg with two doors and two vestibules. DAC poles, 20D ripstop fly, and color-coded setup in under five minutes.",
    price: 349.0,
    inventory: 18,
    category: "Camping",
    status: "active",
  },
  {
    title: "Nightfall 20°F Down Sleeping Bag",
    description:
      "800-fill hydrophobic down bag rated to 20°F (-7°C). Weighs 850 g, with a draft collar, anti-snag zipper, and a stash pocket for your phone.",
    price: 279.0,
    inventory: 22,
    category: "Camping",
    status: "active",
  },
  {
    title: "Ember Ti Camp Stove",
    description:
      "Titanium canister stove that boils a liter in 3.5 minutes yet weighs only 88 g. Piezo igniter and fold-out pot supports included.",
    price: 89.0,
    inventory: 51,
    category: "Camping",
    status: "active",
  },
  {
    title: "Glacier 3L Hydration Reservoir",
    description:
      "BPA-free 3-liter reservoir with a quick-disconnect hose, magnetic bite-valve dock, and a wide slider opening that makes cleaning and ice-loading easy.",
    price: 39.0,
    inventory: 88,
    category: "Camping",
    status: "active",
  },
  {
    title: "Wander 45L Backpack",
    description:
      "A 45-liter pack with an adjustable torso, ventilated back panel, and rain cover. Hip-belt pockets fit a phone and snacks; front shove-it pocket for wet layers.",
    price: 199.0,
    inventory: 31,
    category: "Accessories",
    status: "active",
  },
  {
    title: "Firefly Rechargeable Headlamp",
    description:
      "450-lumen USB-C rechargeable headlamp with red night-vision mode and IPX7 waterproofing. Runs 40 hours on low.",
    price: 49.0,
    inventory: 95,
    category: "Accessories",
    status: "active",
  },
  {
    title: "Trailside Titanium Spork",
    description:
      "Polished titanium spork, 17 g, with a carabiner notch so it never gets lost at the bottom of your pack.",
    price: 12.0,
    inventory: 210,
    category: "Accessories",
    status: "active",
  },
  {
    title: "Overlook Insulated Bottle 750ml",
    description:
      "Double-wall vacuum insulated bottle that keeps drinks cold 24 h or hot 12 h. Powder-coated grip and a leakproof twist cap.",
    price: 34.0,
    inventory: 140,
    category: "Accessories",
    status: "active",
  },
  {
    title: "Polar Loft Expedition Parka",
    description:
      "Expedition-grade parka with 850-fill down, a storm skirt, and a fur-free insulated hood. Built for basecamp temperatures well below freezing.",
    price: 429.0,
    inventory: 9,
    category: "Apparel",
    status: "draft",
  },
];

const DEMO_CUSTOMERS = [
  "Alex Rivera",
  "Jordan Tan",
  "Maria Santos",
  "Chris Nakamura",
  "Sam Patel",
  "Dana Cruz",
  "Lee Morgan",
  "Robin Diaz",
  "Casey Lim",
  "Jamie Fox",
];

export type DemoOrder = {
  customer_name: string;
  status: "paid" | "fulfilled";
  daysAgo: number;
  items: { productIndex: number; quantity: number }[];
};

// Deterministic pseudo-random generator so every demo store gets the same
// believable 60 days of order history (weekend bumps, 1–3 items per order).
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildDemoOrders(): DemoOrder[] {
  const rand = mulberry32(20260714);
  const orders: DemoOrder[] = [];

  for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
    // Slight upward trend toward today plus weekend bumps.
    const weekday = (daysAgo + 4) % 7; // arbitrary alignment
    const isWeekend = weekday === 5 || weekday === 6;
    const base = 1 + (60 - daysAgo) / 40 + (isWeekend ? 1.2 : 0);
    const count = Math.max(0, Math.round(base + (rand() - 0.5) * 2));

    for (let i = 0; i < count; i++) {
      const itemCount = 1 + Math.floor(rand() * 3);
      const items: DemoOrder["items"] = [];
      for (let j = 0; j < itemCount; j++) {
        // Active products only (all but the last draft product).
        const productIndex = Math.floor(rand() * (DEMO_PRODUCTS.length - 1));
        const quantity = 1 + Math.floor(rand() * 2);
        items.push({ productIndex, quantity });
      }
      orders.push({
        customer_name: DEMO_CUSTOMERS[Math.floor(rand() * DEMO_CUSTOMERS.length)],
        status: daysAgo > 3 ? "fulfilled" : "paid",
        daysAgo,
        items,
      });
    }
  }

  return orders;
}
