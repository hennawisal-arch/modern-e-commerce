import { jsPDF } from "jspdf";

export interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

export interface InvoiceData {
  orderId: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
}

export const downloadInvoicePdf = (data: InvoiceData) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 40;
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", left, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 24;
  doc.text(`Order #${data.orderId.slice(0, 8)}`, left, y);
  y += 14;
  doc.text(`Date: ${new Date(data.createdAt).toLocaleString()}`, left, y);
  y += 14;
  doc.text(`Status: ${data.status}`, left, y);
  y += 14;
  doc.text(`Payment: ${data.paymentMethod === "cod" ? "Cash on Delivery" : data.paymentMethod}`, left, y);

  // Shipping address
  if (data.shippingAddress) {
    y += 28;
    doc.setFont("helvetica", "bold");
    doc.text("Ship To", left, y);
    doc.setFont("helvetica", "normal");
    const a = data.shippingAddress;
    const lines = [
      a.fullName,
      a.address,
      [a.city, a.state, a.postalCode].filter(Boolean).join(", "),
      a.country,
      a.phone,
      a.email,
    ].filter(Boolean) as string[];
    for (const line of lines) {
      y += 14;
      doc.text(line, left, y);
    }
  }

  // Items table header
  y += 30;
  doc.setFont("helvetica", "bold");
  doc.text("Item", left, y);
  doc.text("Qty", 360, y, { align: "right" });
  doc.text("Price", 440, y, { align: "right" });
  doc.text("Total", 540, y, { align: "right" });
  doc.setLineWidth(0.5);
  doc.line(left, y + 4, 555, y + 4);

  doc.setFont("helvetica", "normal");
  for (const it of data.items) {
    y += 20;
    if (y > 760) { doc.addPage(); y = 50; }
    const variant = [it.size, it.color].filter(Boolean).join(" / ");
    const label = variant ? `${it.name} (${variant})` : it.name;
    doc.text(doc.splitTextToSize(label, 300) as string[], left, y);
    doc.text(String(it.quantity), 360, y, { align: "right" });
    doc.text(`$${Number(it.price).toFixed(2)}`, 440, y, { align: "right" });
    doc.text(`$${(Number(it.price) * it.quantity).toFixed(2)}`, 540, y, { align: "right" });
  }

  // Totals
  y += 30;
  doc.line(left, y, 555, y);
  y += 18;
  doc.text("Subtotal", 440, y, { align: "right" });
  doc.text(`$${data.subtotal.toFixed(2)}`, 540, y, { align: "right" });
  y += 16;
  doc.text("Shipping", 440, y, { align: "right" });
  doc.text(data.shipping === 0 ? "Free" : `$${data.shipping.toFixed(2)}`, 540, y, { align: "right" });
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.text("Total", 440, y, { align: "right" });
  doc.text(`$${data.total.toFixed(2)}`, 540, y, { align: "right" });

  y += 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Thank you for your order!", left, y);

  doc.save(`invoice-${data.orderId.slice(0, 8)}.pdf`);
};
