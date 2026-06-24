export type ShopifyProductType = "course" | "physical" | "bundle" | "subscription";

export type ShopifyProductKey = "livingTheRunes";

export type ShopifyCheckoutStatus = "created" | "pending" | "completed" | "expired";

export type ShopifyCheckoutRecord = {
  uid: string;
  productKey: ShopifyProductKey;
  productType: ShopifyProductType;
  courseId?: string;
  shopifyCartId?: string;
  shopifyCheckoutUrl?: string;
  status: ShopifyCheckoutStatus;
  createdAt: string;
  updatedAt: string;
};

export type ShopifyOrderRecord = {
  uid: string;
  productKey?: ShopifyProductKey;
  courseId?: string;
  shopifyOrderId: string;
  status: "paid" | "cancelled" | "refunded";
  createdAt: string;
  updatedAt: string;
};

export type ShopifyPaymentEventRecord = {
  provider: "shopify";
  eventId: string;
  topic: string;
  orderId?: string;
  processedAt: string;
  rawStored: false;
};
