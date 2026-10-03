"use strict";

headerLogo.onload = () => {
  recalcWaybill();
  recalcInvoice();
};

function drawLetterhead(ctx, M, barH, title, docNo, dateStr) {
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(0, 0, A4.w, barH);
  const logoH = 130,
    logoRatio = headerLogo.naturalWidth && headerLogo.naturalHeight ? headerLogo.naturalWidth / headerLogo.naturalHeight : 554 / 170,
    logoW = Math.round(logoH * logoRatio);
  const logoX = M,
    logoY = barH + 26;
  if (headerLogo.complete && headerLogo.naturalWidth) {
    ctx.drawImage(headerLogo, logoX, logoY, logoW, logoH);
  }
  const dividerX = logoX + logoW + 26;
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(dividerX, logoY - 4);
  ctx.lineTo(dividerX, logoY + logoH + 4);
  ctx.stroke();
  ctx.lineWidth = 1;
  const textX = dividerX + 28,
    availW = A4.w - M - textX,
    companyTitle = "Food and Clothes Vacuum Packing & International Courier Service";
  let ty = logoY + 26;
  ctx.textAlign = "left";
  ctx.fillStyle = "#111827";
  let titleSize = 26;
  ctx.font = `800 ${titleSize}px Arial`;
  while (ctx.measureText(companyTitle).width > availW && titleSize > 14) {
    titleSize -= 1;
    ctx.font = `800 ${titleSize}px Arial`;
  }
  ctx.fillText(companyTitle, textX, ty);
  ctx.font = "500 18px Arial";
  ctx.fillStyle = "#4b5563";
  ty += 32;
  ctx.fillText("No. 47, 5th Lane, Sarabhoomi, Batakettara, Piliyandala, Sri Lanka.", textX, ty);
  ty += 28;
  ctx.fillText("No. 72/1C, Anderson Road, Kalubowila, Dehiwala, Sri Lanka.", textX, ty);
  ty += 28;
  ctx.fillText("+94 77 402 4853 | +94 777 129 247 |  yasiproducts2023@gmail.com", textX, ty);

  let hy = logoY + logoH + 30;
  ctx.strokeStyle = "#7f1d1d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(M, hy);
  ctx.lineTo(A4.w - M, hy);
  ctx.stroke();
  ctx.lineWidth = 1;

  hy += 46;
  ctx.font = "800 30px Arial";
  ctx.fillStyle = "#b91c1c";
  ctx.fillText(title, M, hy);
  ctx.textAlign = "right";
  ctx.font = "800 30px Arial";
  ctx.fillStyle = "#111827";
  ctx.fillText(docNo, A4.w - M, hy);
  ctx.font = "600 16px Arial";
  ctx.fillStyle = "#6b7280";
  ctx.fillText(dateStr, A4.w - M, hy + 24);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(M, hy + 40);
  ctx.lineTo(A4.w - M, hy + 40);
  ctx.stroke();
  return hy + 58;
}
const $ = (id) => document.getElementById(id);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const fmt = (v) => num(v).toFixed(2);
function today() {
  return new Date().toISOString().slice(0, 10);
}
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);
}
function nl(s) {
  return String(s ?? "")
    .split(/\n+/)
    .filter(Boolean);
}
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__tt);
  window.__tt = setTimeout(() => t.classList.remove("show"), 2200);
}
function currencyOptions(select) {
  select.innerHTML = currencies.map(([c, n]) => `<option value="${c}">${c} – ${n}</option>`).join("");
  select.value = "LKR";
}
function countryValue(v) {
  return v && v !== "Select" ? v : "";
}
function populateCountries() {
  const opts = '<option value="">Select</option>' + countries.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  document.querySelectorAll(".country-select").forEach((s) => (s.innerHTML = opts));
}
function keyseq(prefix) {
  const y = new Date().getFullYear();
  const k = `${prefix}_seq_${y}`;
  let n = Number(localStorage.getItem(k) || "0") + 1;
  localStorage.setItem(k, String(n));
  return `${prefix}-${y}-${String(n).padStart(4, "0")}`;
}
function syncSeqFromManual(prefix, val) {
  const m = String(val || "").match(/(\d+)$/);
  if (!m) return;
  const y = new Date().getFullYear();
  const k = `${prefix}_seq_${y}`;
  const n = Number(m[1]);
  const cur = Number(localStorage.getItem(k) || "0");
  if (n > cur) localStorage.setItem(k, String(n));
}
let currentWaybill = null,
  currentInvoice = null;
let waybills = JSON.parse(localStorage.getItem("yasi_waybills") || "[]");
let invoices = JSON.parse(localStorage.getItem("yasi_invoices") || "[]");
let deletedWaybills = JSON.parse(localStorage.getItem("yasi_deleted_waybills") || "[]");
let deletedInvoices = JSON.parse(localStorage.getItem("yasi_deleted_invoices") || "[]");
function persist() {
  localStorage.setItem("yasi_waybills", JSON.stringify(waybills));
  localStorage.setItem("yasi_invoices", JSON.stringify(invoices));
  localStorage.setItem("yasi_deleted_waybills", JSON.stringify(deletedWaybills));
  localStorage.setItem("yasi_deleted_invoices", JSON.stringify(deletedInvoices));
  refreshDashboard();
  renderSavedLists();
}
function nav(viewId) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active-view", v.id === viewId));
  document
    .querySelectorAll(".nav-item")
    .forEach((b) =>
      b.classList.toggle(
        "active",
        b.dataset.view === viewId ||
          (b.id === "waybillsMainNav" && (viewId === "waybillView" || viewId === "waybillSavedView")) ||
          (b.id === "invoicesMainNav" && (viewId === "invoiceView" || viewId === "invoiceSavedView")),
      ),
    );
  document.querySelectorAll(".subnav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === viewId));
  $("waybillSubnav").classList.toggle("open", viewId === "waybillView" || viewId === "waybillSavedView");
  $("invoiceSubnav").classList.toggle("open", viewId === "invoiceView" || viewId === "invoiceSavedView");
  window.scrollTo(0, 0);
}
function blankWaybill() {
  currentWaybill = null;
  $("waybillStatus").textContent = "New way bill";
  $("wbInvoiceNo").value = keyseq("YP");
  $("wbDateExport").value = today();
  $("wbExportReferences").value = "";
  ["wbShipper", "wbRecipient", "wbImporter", "wbAwbNumber"].forEach((id) => ($(id).value = ""));
  ["wbCountryExport", "wbCountryManufacture", "wbCountryDestination"].forEach((id) => ($(id).value = ""));
  $("wbCurrency").value = "LKR";
  $("wbDiscount").value = "0";
  $("wbSignatureName").value = "";
  $("wbSignatureDate").value = today();
  document.querySelector('input[name="shipmentType"][value="Express Saver"]').checked = true;
  $("shipmentRows").innerHTML = "";
  $("bagRows").innerHTML = "";
  addShipment();
  addBag();
  recalcWaybill();
}
function blankInvoice() {
  currentInvoice = null;
  $("invoiceStatus").textContent = "New invoice";
  $("invNumber").value = keyseq("YP-INV");
  $("invDate").value = today();
  $("invDueDate").value = "";
  $("invStatus").value = "Draft";
  $("invCurrency").value = "LKR";
  $("invReference").value = "";
  $("invBillTo").value = "";
  $("invShipTo").value = "";
  $("invDiscount").value = "0";
  $("invAdvance").value = "0";
  $("invNotes").value = "";
  $("invTerms").value = "";
  $("invoiceItems").innerHTML = "";
  $("invBagRows").innerHTML = "";
  addInvoiceItem();
  addInvBag();
  recalcInvoice();
}
function addShipment(data = { pkgs: "", weight: "", unit: "" }) {
  const row = document.createElement("div");
  row.className = "shipment-row";
  row.innerHTML = `<input class="sp-pkgs" type="number" min="0" step="1" value="${esc(data.pkgs)}"><input class="sp-weight" type="number" min="0" step="0.01" value="${esc(data.weight)}"><input class="sp-unit" type="number" min="0" step="0.01" value="${esc(data.unit)}"><input class="sp-total" readonly><button type="button" class="remove-row" title="Remove">×</button>`;
  row.querySelectorAll("input").forEach((i) => i.addEventListener("input", recalcWaybill));
  row.querySelector(".remove-row").onclick = () => {
    if (document.querySelectorAll(".shipment-row").length > 1) row.remove();
    recalcWaybill();
  };
  $("shipmentRows").appendChild(row);
  recalcWaybill();
}
function addBag(data = { item: "", unit: "", qty: "" }) {
  const row = document.createElement("div");
  row.className = "bag-row";
  row.innerHTML = `<select class="bag-item"><option value="" ${!data.item ? "selected" : ""} disabled hidden>Select</option>${vacuumItems.map((v) => `<option ${v === data.item ? "selected" : ""}>${esc(v)}</option>`).join("")}</select><input class="bag-unit" type="number" min="0" step="0.01" value="${esc(data.unit)}"><input class="bag-qty" type="number" min="0" step="1" value="${esc(data.qty)}"><input class="bag-total" readonly><button type="button" class="remove-row" title="Remove">×</button>`;
  row.querySelectorAll("input,select").forEach((i) => i.addEventListener("input", recalcWaybill));
  row.querySelector(".remove-row").onclick = () => {
    if (document.querySelectorAll(".bag-row").length > 1) row.remove();
    recalcWaybill();
  };
  $("bagRows").appendChild(row);
  recalcWaybill();
}
function collectWaybill() {
  return {
    invoiceNo: $("wbInvoiceNo").value.trim(),
    dateExport: $("wbDateExport").value,
    exportReferences: $("wbExportReferences").value,
    shipper: $("wbShipper").value,
    recipient: $("wbRecipient").value,
    countryExport: $("wbCountryExport").value,
    importer: $("wbImporter").value,
    countryManufacture: $("wbCountryManufacture").value,
    countryDestination: $("wbCountryDestination").value,
    awb: $("wbAwbNumber").value,
    currency: $("wbCurrency").value,
    shipmentType: document.querySelector('input[name="shipmentType"]:checked')?.value || "",
    shipments: [...document.querySelectorAll(".shipment-row")].map((r) => ({
      pkgs: r.querySelector(".sp-pkgs").value,
      weight: r.querySelector(".sp-weight").value,
      unit: r.querySelector(".sp-unit").value,
    })),
    bags: [...document.querySelectorAll(".bag-row")].map((r) => ({
      item: r.querySelector(".bag-item").value,
      unit: r.querySelector(".bag-unit").value,
      qty: r.querySelector(".bag-qty").value,
    })),
    discount: num($("wbDiscount").value),
    signatureName: $("wbSignatureName").value,
    signatureDate: $("wbSignatureDate").value,
    totalPackages: num($("wbTotalPackages").value),
    totalWeight: num($("wbTotalWeight").value),
    shipmentTotal: num($("wbTotalPackageValue").value),
    vacuumTotal: num($("wbTotalVacuumValue").value),
    totalInvoiceValue: num($("wbTotalInvoiceValue").value),
    updatedAt: new Date().toISOString(),
  };
}
function recalcWaybill() {
  let p = 0,
    w = 0,
    sv = 0,
    v = 0;
  document.querySelectorAll(".shipment-row").forEach((r) => {
    const pk = num(r.querySelector(".sp-pkgs").value),
      wt = num(r.querySelector(".sp-weight").value),
      uv = num(r.querySelector(".sp-unit").value),
      tot = wt * uv;
    p += pk;
    w += wt;
    sv += tot;
    r.querySelector(".sp-total").value = fmt(tot);
  });
  document.querySelectorAll(".bag-row").forEach((r) => {
    const uv = num(r.querySelector(".bag-unit").value),
      q = num(r.querySelector(".bag-qty").value),
      tot = uv * q;
    v += tot;
    r.querySelector(".bag-total").value = fmt(tot);
  });
  $("wbTotalPackages").value = String(p);
  $("wbTotalWeight").value = fmt(w);
  $("wbTotalPackageValue").value = fmt(sv);
  $("wbTotalVacuumValue").value = fmt(v);
  $("wbTotalInvoiceValue").value = fmt(sv + v - num($("wbDiscount").value));
  drawWaybill(collectWaybill());
}
function loadWaybill(wb) {
  currentWaybill = wb;
  $("waybillStatus").textContent = "Saved way bill";
  $("wbInvoiceNo").value = wb.invoiceNo || "";
  $("wbDateExport").value = wb.dateExport || "";
  $("wbExportReferences").value = wb.exportReferences || "";
  $("wbShipper").value = wb.shipper || "";
  $("wbRecipient").value = wb.recipient || "";
  $("wbCountryExport").value = countryValue(wb.countryExport);
  $("wbImporter").value = wb.importer || "";
  $("wbCountryManufacture").value = countryValue(wb.countryManufacture);
  $("wbCountryDestination").value = countryValue(wb.countryDestination);
  $("wbAwbNumber").value = wb.awb || "";
  $("wbCurrency").value = wb.currency || "LKR";
  $("wbDiscount").value = wb.discount || 0;
  $("wbSignatureName").value = wb.signatureName || "";
  $("wbSignatureDate").value = wb.signatureDate || "";
  document
    .querySelectorAll('input[name="shipmentType"]')
    .forEach((x) => (x.checked = x.value === (wb.shipmentType || "Express Saver")));
  $("shipmentRows").innerHTML = "";
  (wb.shipments || []).forEach((x) => addShipment(x));
  if (!(wb.shipments || []).length) addShipment();
  $("bagRows").innerHTML = "";
  (wb.bags || []).forEach((x) => addBag(x));
  if (!(wb.bags || []).length) addBag();
  recalcWaybill();
  nav("waybillView");
}
function saveWaybill() {
  const data = collectWaybill();
  if (!data.invoiceNo) {
    data.invoiceNo = keyseq("YP");
    $("wbInvoiceNo").value = data.invoiceNo;
  }
  syncSeqFromManual("YP", data.invoiceNo);
  const id = currentWaybill?.id || crypto.randomUUID();
  const rec = { id, ...data, createdAt: currentWaybill?.createdAt || new Date().toISOString() };
  const idx = waybills.findIndex((x) => x.id === id);
  if (idx >= 0) waybills[idx] = rec;
  else waybills.unshift(rec);
  currentWaybill = rec;
  $("waybillStatus").textContent = "Saved";
  persist();
  toast("Way bill saved");
}
function addInvoiceItem(data = { description: "", qty: "1", unit: "" }) {
  const row = document.createElement("div");
  row.className = "invoice-item-row";
  row.innerHTML = `<input class="iv-desc" value="${esc(data.description)}"><input class="iv-qty" type="number" min="0" step="0.01" value="${esc(data.qty)}"><input class="iv-unit" type="number" min="0" step="0.01" value="${esc(data.unit)}"><input class="iv-total" readonly><button type="button" class="remove-row">×</button>`;
  row.querySelectorAll("input").forEach((i) => i.addEventListener("input", recalcInvoice));
  row.querySelector(".remove-row").onclick = () => {
    if (document.querySelectorAll(".invoice-item-row").length > 1) row.remove();
    recalcInvoice();
  };
  $("invoiceItems").appendChild(row);
  recalcInvoice();
}
function addInvBag(data = { item: "", unit: "", qty: "" }) {
  const row = document.createElement("div");
  row.className = "inv-bag-row";
  row.innerHTML = `<select class="inv-bag-item"><option value="" ${!data.item ? "selected" : ""} disabled hidden>Select</option>${vacuumItems.map((v) => `<option ${v === data.item ? "selected" : ""}>${esc(v)}</option>`).join("")}</select><input class="inv-bag-unit" type="number" min="0" step="0.01" value="${esc(data.unit)}"><input class="inv-bag-qty" type="number" min="0" step="1" value="${esc(data.qty)}"><input class="inv-bag-total" readonly><button type="button" class="remove-row" title="Remove">×</button>`;
  row.querySelectorAll("input,select").forEach((i) => i.addEventListener("input", recalcInvoice));
  row.querySelector(".remove-row").onclick = () => {
    if (document.querySelectorAll(".inv-bag-row").length > 1) row.remove();
    recalcInvoice();
  };
  $("invBagRows").appendChild(row);
  recalcInvoice();
}
function collectInvoice() {
  return {
    number: $("invNumber").value.trim(),
    date: $("invDate").value,
    dueDate: $("invDueDate").value,
    status: $("invStatus").value,
    currency: $("invCurrency").value,
    reference: $("invReference").value,
    billTo: $("invBillTo").value,
    shipTo: $("invShipTo").value,
    items: [...document.querySelectorAll(".invoice-item-row")].map((r) => ({
      description: r.querySelector(".iv-desc").value,
      qty: r.querySelector(".iv-qty").value,
      unit: r.querySelector(".iv-unit").value,
    })),
    discount: num($("invDiscount").value),
    bags: [...document.querySelectorAll(".inv-bag-row")].map((r) => ({
      item: r.querySelector(".inv-bag-item").value,
      unit: r.querySelector(".inv-bag-unit").value,
      qty: r.querySelector(".inv-bag-qty").value,
    })),
    advance: num($("invAdvance").value),
    notes: $("invNotes").value,
    terms: $("invTerms").value,
    subtotal: num($("invSubtotalHidden")?.value || 0),
    vacuumTotal: num($("invVacuumHidden")?.value || 0),
    total: num($("invGrandTotalHidden")?.value || 0),
    updatedAt: new Date().toISOString(),
  };
}
function setHiddenValue(id, value) {
  let h = $(id);
  if (!h) {
    h = document.createElement("input");
    h.type = "hidden";
    h.id = id;
    $("invoiceForm").appendChild(h);
  }
  h.value = value;
}
function recalcInvoice() {
  let s = 0,
    v = 0;
  document.querySelectorAll(".invoice-item-row").forEach((r) => {
    const t = num(r.querySelector(".iv-qty").value) * num(r.querySelector(".iv-unit").value);
    s += t;
    r.querySelector(".iv-total").value = fmt(t);
  });
  document.querySelectorAll(".inv-bag-row").forEach((r) => {
    const t = num(r.querySelector(".inv-bag-unit").value) * num(r.querySelector(".inv-bag-qty").value);
    v += t;
    r.querySelector(".inv-bag-total").value = fmt(t);
  });
  const total = s + v - num($("invDiscount").value) - num($("invAdvance").value);
  setHiddenValue("invSubtotalHidden", s);
  setHiddenValue("invVacuumHidden", v);
  setHiddenValue("invGrandTotalHidden", total);
  drawInvoice(collectInvoice());
}
function loadInvoice(inv) {
  currentInvoice = inv;
  $("invoiceStatus").textContent = "Saved invoice";
  $("invNumber").value = inv.number || "";
  $("invDate").value = inv.date || "";
  $("invDueDate").value = inv.dueDate || "";
  $("invStatus").value = inv.status || "Draft";
  $("invCurrency").value = inv.currency || "LKR";
  $("invReference").value = inv.reference || "";
  $("invBillTo").value = inv.billTo || "";
  $("invShipTo").value = inv.shipTo || "";
  $("invDiscount").value = inv.discount || 0;
  $("invAdvance").value = inv.advance || 0;
  $("invNotes").value = inv.notes || "";
  $("invTerms").value = inv.terms || "";
  $("invoiceItems").innerHTML = "";
  (inv.items || []).forEach((x) => addInvoiceItem(x));
  if (!(inv.items || []).length) addInvoiceItem();
  $("invBagRows").innerHTML = "";
  (inv.bags || []).forEach((x) => addInvBag(x));
  if (!(inv.bags || []).length) addInvBag();
  recalcInvoice();
  nav("invoiceView");
}
function saveInvoice() {
  const data = collectInvoice();
  if (!data.number) {
    data.number = keyseq("YP-INV");
    $("invNumber").value = data.number;
  }
  syncSeqFromManual("YP-INV", data.number);
  const id = currentInvoice?.id || crypto.randomUUID();
  const rec = { id, ...data, createdAt: currentInvoice?.createdAt || new Date().toISOString() };
  const idx = invoices.findIndex((x) => x.id === id);
  if (idx >= 0) invoices[idx] = rec;
  else invoices.unshift(rec);
  currentInvoice = rec;
  $("invoiceStatus").textContent = "Saved";
  persist();
  toast("Invoice saved");
}
function drawText(ctx, text, x, y, size = 18, weight = "400", color = "#171717", maxW = 450) {
  ctx.font = `${weight} ${size}px Arial`;
  ctx.fillStyle = color;
  for (const line of nl(text)) {
    const parts = [];
    let cur = "";
    for (const word of String(line).split(/\s+/)) {
      const test = cur ? cur + " " + word : word;
      if (ctx.measureText(test).width > maxW && cur) {
        parts.push(cur);
        cur = word;
      } else cur = test;
    }
    if (cur) parts.push(cur);
    for (const p of parts) {
      ctx.fillText(p, x, y);
      y += size * 1.2;
    }
  }
  return y;
}
function fitText(ctx, text, x, y, maxW, size = 17, min = 10, weight = "600") {
  let s = size;
  while (s > min) {
    ctx.font = `${weight} ${s}px Arial`;
    if (ctx.measureText(text).width <= maxW) break;
    s--;
  }
  ctx.fillStyle = "#111";
  ctx.fillText(text, x, y);
  return s;
}
function drawBox(ctx, x, y, w, h, title) {
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(x, y, w, 36);
  ctx.fillStyle = "#374151";
  ctx.font = "700 13px Arial";
  ctx.fillText(title, x + 12, y + 23);
}
function currencyLabel(code) {
  const c = currencies.find((x) => x[0] === code);
  return c?.[0] || "LKR";
}
function clearCanvas(c) {
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, A4.w, A4.h);
  return ctx;
}
function drawWaybill(wb) {
  const c = $("waybillCanvas"),
    ctx = clearCanvas(c);
  const M = 58;
  let y = drawLetterhead(ctx, M, 14, "WAY BILL", wb.invoiceNo || "YP-2026-0001", wb.dateExport || "");
  let gap = 12,
    left = M,
    right = A4.w - M,
    col = (right - left - gap) / 2;
  drawBox(ctx, left, y, col, 205, "SHIPPER / EXPORTER");
  drawText(ctx, wb.shipper || "—", left + 14, y + 58, 21, "600", "#111", col - 28);
  drawBox(ctx, left + col + gap, y, col, 205, "RECIPIENT");
  drawText(ctx, wb.recipient || "—", left + col + gap + 14, y + 58, 21, "600", "#111", col - 28);
  y += 217;
  drawBox(ctx, left, y, col, 118, "COUNTRY OF EXPORT");
  drawText(ctx, countryValue(wb.countryExport) || "—", left + 14, y + 65, 21, "600", "#111", col - 28);
  drawBox(ctx, left + col + gap, y, col, 118, "IMPORTER / OTHER");
  drawText(ctx, wb.importer || "—", left + col + gap + 14, y + 58, 20, "600", "#111", col - 28);
  y += 130;
  drawBox(ctx, left, y, col, 112, "COUNTRY OF MANUFACTURE");
  drawText(ctx, countryValue(wb.countryManufacture) || "—", left + 14, y + 64, 21, "600", "#111", col - 28);
  drawBox(ctx, left + col + gap, y, col, 112, "ULTIMATE DESTINATION");
  drawText(ctx, countryValue(wb.countryDestination) || "—", left + col + gap + 14, y + 64, 21, "600", "#111", col - 28);
  y += 124;
  drawBox(ctx, left, y, col, 112, "AIR WAYBILL NUMBER");
  drawText(ctx, wb.awb || "—", left + 14, y + 64, 21, "600", "#111", col - 28);
  drawBox(ctx, left + col + gap, y, col, 112, "EXPORT REFERENCES");
  drawText(ctx, wb.exportReferences || "—", left + col + gap + 14, y + 58, 20, "600", "#111", col - 28);
  y += 124;
  ctx.fillStyle = "#111827";
  ctx.font = "800 20px Arial";
  ctx.fillText(`SHIPMENT TYPE: ${wb.shipmentType || "—"}`, left, y + 12);
  ctx.textAlign = "right";
  ctx.font = "700 20px Arial";
  ctx.fillText(`Currency: ${wb.currency || "LKR"}`, right, y + 12);
  ctx.textAlign = "left";

  y += 30;
  drawBox(ctx, left, y, right - left, 265, "SHIPMENT");
  const shipCol1 = left + 14,
    shipCol2 = left + Math.round((right - left) * 0.5),
    shipCol3 = left + Math.round((right - left) * 0.74);
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(left + 2, y + 36, right - left - 4, 34);
  ctx.fillStyle = "#6b7280";
  ctx.font = "700 16px Arial";
  ctx.fillText("NO. OF PKGS", shipCol1, y + 59);
  ctx.fillText("WEIGHT (KG)", shipCol2, y + 59);
  ctx.fillText("UNIT VALUE", shipCol3, y + 59);
  ctx.textAlign = "right";
  ctx.fillText("TOTAL VALUE", right - 16, y + 59);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(left + 2, y + 70);
  ctx.lineTo(right - 2, y + 70);
  ctx.stroke();
  let sy = y + 95;
  ctx.font = "600 18px Arial";
  ctx.fillStyle = "#111";
  (wb.shipments || []).slice(0, 5).forEach((r) => {
    ctx.fillText(String(r.pkgs || "0"), shipCol1, sy);
    ctx.fillText(fmt(r.weight), shipCol2, sy);
    ctx.fillText(fmt(r.unit), shipCol3, sy);
    ctx.textAlign = "right";
    ctx.fillText(fmt(num(r.weight) * num(r.unit)), right - 16, sy);
    ctx.textAlign = "left";
    sy += 34;
  });
  if ((wb.shipments || []).length > 5) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px Arial";
    ctx.fillText(`+ ${(wb.shipments || []).length - 5} more row(s)`, left + 14, sy);
  }

  y += 277;
  drawBox(ctx, left, y, right - left, 256, "VACUUM PACKING CHARGES");
  const bagCol1 = left + 14,
    bagCol2 = left + Math.round((right - left) * 0.5),
    bagCol3 = left + Math.round((right - left) * 0.74);
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(left + 2, y + 36, right - left - 4, 34);
  ctx.fillStyle = "#6b7280";
  ctx.font = "700 16px Arial";
  ctx.fillText("ITEM", bagCol1, y + 59);
  ctx.fillText("UNIT VALUE", bagCol2, y + 59);
  ctx.fillText("QTY", bagCol3, y + 59);
  ctx.textAlign = "right";
  ctx.fillText("TOTAL VALUE", right - 16, y + 59);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(left + 2, y + 70);
  ctx.lineTo(right - 2, y + 70);
  ctx.stroke();
  let by = y + 95;
  ctx.font = "600 18px Arial";
  ctx.fillStyle = "#111";
  (wb.bags || []).slice(0, 5).forEach((r) => {
    ctx.fillText(r.item || "", bagCol1, by);
    ctx.fillText(fmt(r.unit), bagCol2, by);
    ctx.fillText(String(r.qty || "0"), bagCol3, by);
    ctx.textAlign = "right";
    ctx.fillText(fmt(num(r.unit) * num(r.qty)), right - 16, by);
    ctx.textAlign = "left";
    by += 34;
  });

  y += 268;
  drawBox(ctx, left, y, 570, 212, "TOTALS");
  ctx.font = "600 19px Arial";
  ctx.fillStyle = "#374151";
  [
    ["Total No. of Pkgs", wb.totalPackages || 0],
    ["Total Weight", `${fmt(wb.totalWeight || 0)} kg`],
    ["Total Value of Pkgs", `${currencyLabel(wb.currency)} ${fmt(wb.shipmentTotal || 0)}`],
    ["Total Value of Vacuum", `${currencyLabel(wb.currency)} ${fmt(wb.vacuumTotal || 0)}`],
    ["Discount", `${currencyLabel(wb.currency)} ${fmt(wb.discount || 0)}`],
  ].forEach((a, i) => {
    ctx.fillText(a[0], left + 16, y + 64 + i * 29);
    ctx.textAlign = "right";
    ctx.fillText(String(a[1]), left + 538, y + 64 + i * 29);
    ctx.textAlign = "left";
  });
  ctx.fillStyle = "#111827";
  ctx.font = "800 29px Arial";
  ctx.fillText("WAY BILL TOTAL", left + 600, y + 70);
  ctx.textAlign = "right";
  ctx.fillText(`${currencyLabel(wb.currency)} ${fmt(wb.totalInvoiceValue || 0)}`, right, y + 72);
  ctx.textAlign = "left";
  ctx.font = "400 15px Arial";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Please retain this document for shipment and export records.", left + 600, y + 99);
  ctx.fillText("Declaration confirmed by shipper / exporter.", left + 600, y + 120);

  y += 230;
  drawBox(ctx, left, y, col, 116, "SIGNATURE OF SHIPPER / EXPORTER");
  drawText(ctx, wb.signatureName || "—", left + 14, y + 66, 20, "600", "#111", col - 28);
  drawBox(ctx, left + col + gap, y, col, 116, "DATE");
  drawText(ctx, wb.signatureDate || "—", left + col + gap + 14, y + 66, 17, "600", "#111", col - 28);
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(left, y + 130, right - left, 5);
  ctx.font = "700 16px Arial";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Yasi Products • Way Bill", left, y + 154);
  ctx.textAlign = "right";
  ctx.fillText("A4 • One Page", right, y + 154);
  ctx.textAlign = "left";
}
function drawInvoice(inv) {
  const c = $("invoiceCanvas"),
    ctx = clearCanvas(c);
  const M = 64,
    W = A4.w - M * 2;
  let y = drawLetterhead(ctx, M, 18, "INVOICE", inv.number || "YP-INV-2026-0001", inv.date || "");
  const col = (W - 20) / 2;
  drawBox(ctx, M, y, col, 150, "BILL TO");
  drawText(ctx, inv.billTo || "—", M + 14, y + 58, 19, "600", "#111", col - 28);
  drawBox(ctx, M + col + 20, y, col, 150, "SHIP TO");
  drawText(ctx, inv.shipTo || "—", M + col + 34, y + 58, 19, "600", "#111", col - 28);
  y += 165;
  ctx.fillStyle = "#374151";
  ctx.font = "600 15px Arial";
  ctx.fillText(`Reference: ${inv.reference || "—"}`, M, y + 6);
  ctx.textAlign = "right";
  ctx.fillText(
    `Due: ${inv.dueDate || "—"}   •   Status: ${inv.status || "Draft"}   •   Currency: ${inv.currency || "LKR"}`,
    A4.w - M,
    y + 6,
  );
  ctx.textAlign = "left";
  y += 26;
  const cur = inv.currency || "LKR";
  // ---- Food / Other Services ----
  drawBox(ctx, M, y, W, 460, "FOOD / OTHER SERVICES");
  const iCol2 = M + Math.round(W * 0.5),
    iCol3 = M + Math.round(W * 0.74);
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(M + 2, y + 36, W - 4, 36);
  ctx.fillStyle = "#6b7280";
  ctx.font = "700 16px Arial";
  ctx.fillText("DESCRIPTION", M + 14, y + 60);
  ctx.fillText("WEIGHT (KG)", iCol2, y + 60);
  ctx.fillText("UNIT PRICE", iCol3, y + 60);
  ctx.textAlign = "right";
  ctx.fillText("AMOUNT", A4.w - M - 16, y + 60);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(M + 2, y + 72);
  ctx.lineTo(A4.w - M - 2, y + 72);
  ctx.stroke();
  let iy = y + 105;
  ctx.font = "600 18px Arial";
  ctx.fillStyle = "#111";
  (inv.items || []).slice(0, 10).forEach((it) => {
    drawText(ctx, it.description || "", M + 14, iy, 16, "600", "#111", iCol2 - M - 24);
    ctx.fillText(String(it.qty || "0"), iCol2, iy);
    ctx.fillText(fmt(it.unit), iCol3, iy);
    ctx.textAlign = "right";
    ctx.fillText(fmt(num(it.qty) * num(it.unit)), A4.w - M - 16, iy);
    ctx.textAlign = "left";
    iy += 38;
  });
  y += 480;
  // ---- Vacuum Packing Charges ----
  drawBox(ctx, M, y, W, 300, "VACUUM PACKING CHARGES");
  const vCol2 = M + Math.round(W * 0.5),
    vCol3 = M + Math.round(W * 0.74);
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(M + 2, y + 36, W - 4, 36);
  ctx.fillStyle = "#6b7280";
  ctx.font = "700 16px Arial";
  ctx.fillText("ITEM", M + 14, y + 60);
  ctx.fillText("UNIT VALUE", vCol2, y + 60);
  ctx.fillText("QTY", vCol3, y + 60);
  ctx.textAlign = "right";
  ctx.fillText("TOTAL VALUE", A4.w - M - 16, y + 60);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(M + 2, y + 72);
  ctx.lineTo(A4.w - M - 2, y + 72);
  ctx.stroke();
  let vy = y + 105;
  ctx.font = "600 18px Arial";
  ctx.fillStyle = "#111";
  (inv.bags || []).slice(0, 5).forEach((r) => {
    ctx.fillText(r.item || "", M + 14, vy);
    ctx.fillText(fmt(r.unit), vCol2, vy);
    ctx.fillText(String(r.qty || "0"), vCol3, vy);
    ctx.textAlign = "right";
    ctx.fillText(fmt(num(r.unit) * num(r.qty)), A4.w - M - 16, vy);
    ctx.textAlign = "left";
    vy += 38;
  });
  y += 320;
  // ---- Totals ----
  const rightX = A4.w - M - 410,
    valX = A4.w - M - 18;
  ctx.font = "600 19px Arial";
  ctx.fillStyle = "#374151";
  [
    ["Food / Other Services", inv.subtotal],
    ["Vacuum Packing", inv.vacuumTotal],
    ["Discount", inv.discount],
    ["Advance Payment", inv.advance],
  ].forEach(([label, val], i) => {
    ctx.textAlign = "left";
    ctx.fillText(label, rightX, y + 15 + i * 31);
    ctx.textAlign = "right";
    ctx.fillText(`${cur} ${fmt(val || 0)}`, valX, y + 15 + i * 31);
  });
  ctx.textAlign = "left";
  ctx.strokeStyle = "#111827";
  ctx.beginPath();
  ctx.moveTo(rightX, y + 122);
  ctx.lineTo(A4.w - M, y + 122);
  ctx.stroke();
  ctx.fillStyle = "#111827";
  ctx.font = "800 29px Arial";
  ctx.fillText("INVOICE TOTAL", rightX, y + 161);
  ctx.textAlign = "right";
  ctx.fillText(`${cur} ${fmt(inv.total || 0)}`, A4.w - M - 16, y + 161);
  ctx.textAlign = "left";
  y += 200;
  drawBox(ctx, M, y, col, 135, "NOTES");
  drawText(ctx, inv.notes || "—", M + 14, y + 58, 16, "500", "#111", col - 28);
  drawBox(ctx, M + col + 20, y, col, 135, "PAYMENT TERMS");
  drawText(ctx, inv.terms || "—", M + col + 34, y + 58, 16, "500", "#111", col - 28);
  y += 154;
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(M, y, W, 5);
  ctx.font = "700 16px Arial";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Yasi Products • Thank you for your business.", M, y + 30);
  ctx.textAlign = "right";
  ctx.fillText("A4 • One Page", A4.w - M, y + 30);
  ctx.textAlign = "left";
}
function canvasDataUrl(canvas) {
  return canvas.toDataURL("image/jpeg", 0.92);
}
function preparePrint(canvas, title) {
  const root = $("printRoot");
  root.innerHTML = "";
  const img = document.createElement("img");
  img.alt = title;
  img.src = canvasDataUrl(canvas);
  root.appendChild(img);
  setTimeout(() => window.print(), 30);
}
function dataUrlToBytes(dataUrl) {
  const b64 = dataUrl.split(",")[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function asciiBytes(s) {
  return new TextEncoder().encode(s);
}
function buildPdfFromJpeg(jpegBytes, width, height) {
  const parts = [];
  let pos = 0;
  const addBytes = (b) => {
    parts.push(b);
    pos += b.length;
  };
  addBytes(asciiBytes("%PDF-1.4\n%Yasi\n"));
  const offsets = [0];
  function addObj(num, body) {
    offsets[num] = pos;
    addBytes(asciiBytes(`${num} 0 obj\n`));
    if (body.kind === "image") {
      addBytes(asciiBytes(body.head));
      addBytes(body.jpeg);
      addBytes(asciiBytes(body.tail));
    } else addBytes(asciiBytes(body));
    addBytes(asciiBytes("\nendobj\n"));
  }
  addObj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  addObj(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.ptW} ${A4.ptH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  const imageHead = `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
  addObj(4, { kind: "image", head: imageHead, jpeg: jpegBytes, tail: "\nendstream" });
  const content = `q\n${A4.ptW} 0 0 ${A4.ptH} 0 0 cm\n/Im0 Do\nQ\n`;
  addObj(5, `<< /Length ${asciiBytes(content).length} >>\nstream\n${content}endstream`);
  const xrefPos = pos;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  addBytes(asciiBytes(xref + trailer));
  return new Blob(parts, { type: "application/pdf" });
}
function downloadPdf(canvas, filename) {
  try {
    const jpeg = dataUrlToBytes(canvasDataUrl(canvas));
    const blob = buildPdfFromJpeg(jpeg, A4.w, A4.h);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    toast("PDF downloaded");
  } catch (e) {
    console.error(e);
    toast("PDF download failed");
  }
}
function renderSavedLists() {
  const q = ($("waybillSearch")?.value || "").toLowerCase();
  const wFiltered = waybills.filter((x) => (x.invoiceNo + " " + (x.recipient || "")).toLowerCase().includes(q)).slice(0, 30);
  $("savedWaybillList").innerHTML =
    wFiltered
      .map(
        (x) =>
          `<div class="saved-item"><div class="saved-main"><b>${esc(x.invoiceNo)}</b><span>${esc(x.dateExport || "")} • ${esc((x.recipient || "").split(/\n/)[0] || "No recipient")}</span></div><div class="saved-actions"><button class="mini-btn open-wb" data-id="${esc(x.id)}">Open</button><button class="mini-btn delete-wb" data-id="${esc(x.id)}">Delete</button></div></div>`,
      )
      .join("") || '<div style="color:#9ca3af;font-size:12px;padding:10px">No saved way bills.</div>';
  $("savedWaybillList")
    .querySelectorAll(".open-wb")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const x = waybills.find((r) => r.id === b.dataset.id);
          if (x) loadWaybill(x);
        }),
    );
  $("savedWaybillList")
    .querySelectorAll(".delete-wb")
    .forEach((b) => (b.onclick = () => deleteWaybill(b.dataset.id)));
  const iq = ($("invoiceSearch")?.value || "").toLowerCase();
  const iFiltered = invoices.filter((x) => (x.number + " " + (x.billTo || "")).toLowerCase().includes(iq)).slice(0, 30);
  $("savedInvoiceList").innerHTML =
    iFiltered
      .map(
        (x) =>
          `<div class="saved-item"><div class="saved-main"><b>${esc(x.number)}</b><span>${esc(x.date || "")} • ${esc((x.billTo || "").split(/\n/)[0] || "No customer")}</span></div><div class="saved-actions"><button class="mini-btn open-inv" data-id="${esc(x.id)}">Open</button><button class="mini-btn delete-inv" data-id="${esc(x.id)}">Delete</button></div></div>`,
      )
      .join("") || '<div style="color:#9ca3af;font-size:12px;padding:10px">No saved invoices.</div>';
  $("savedInvoiceList")
    .querySelectorAll(".open-inv")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const x = invoices.find((r) => r.id === b.dataset.id);
          if (x) loadInvoice(x);
        }),
    );
  $("savedInvoiceList")
    .querySelectorAll(".delete-inv")
    .forEach((b) => (b.onclick = () => deleteInvoice(b.dataset.id)));
  renderDocuments();
  renderTrash();
}
function deleteWaybill(id) {
  const x = waybills.find((r) => r.id === id);
  if (!x) return;
  if (!confirm(`Delete way bill "${x.invoiceNo || ""}"? You can restore it from Trash later.`)) return;
  waybills = waybills.filter((r) => r.id !== id);
  deletedWaybills.unshift({ ...x, deletedAt: new Date().toISOString() });
  persist();
  toast("Way bill moved to trash");
}
function deleteInvoice(id) {
  const x = invoices.find((r) => r.id === id);
  if (!x) return;
  if (!confirm(`Delete invoice "${x.number || ""}"? You can restore it from Trash later.`)) return;
  invoices = invoices.filter((r) => r.id !== id);
  deletedInvoices.unshift({ ...x, deletedAt: new Date().toISOString() });
  persist();
  toast("Invoice moved to trash");
}
function restoreWaybill(id) {
  const x = deletedWaybills.find((r) => r.id === id);
  if (!x) return;
  deletedWaybills = deletedWaybills.filter((r) => r.id !== id);
  const { deletedAt, ...rest } = x;
  waybills.unshift(rest);
  persist();
  toast("Way bill restored");
}
function restoreInvoice(id) {
  const x = deletedInvoices.find((r) => r.id === id);
  if (!x) return;
  deletedInvoices = deletedInvoices.filter((r) => r.id !== id);
  const { deletedAt, ...rest } = x;
  invoices.unshift(rest);
  persist();
  toast("Invoice restored");
}
function purgeWaybill(id) {
  if (!confirm("Permanently delete this way bill? This cannot be undone.")) return;
  deletedWaybills = deletedWaybills.filter((r) => r.id !== id);
  persist();
  toast("Way bill permanently deleted");
}
function purgeInvoice(id) {
  if (!confirm("Permanently delete this invoice? This cannot be undone.")) return;
  deletedInvoices = deletedInvoices.filter((r) => r.id !== id);
  persist();
  toast("Invoice permanently deleted");
}
function renderTrash() {
  const q = ($("trashSearch")?.value || "").toLowerCase();
  const rows = [
    ...deletedWaybills.map((x) => ({
      type: "Way Bill",
      no: x.invoiceNo,
      date: x.dateExport,
      party: x.recipient,
      deletedAt: x.deletedAt,
      id: x.id,
    })),
    ...deletedInvoices.map((x) => ({
      type: "Invoice",
      no: x.number,
      date: x.date,
      party: x.billTo,
      deletedAt: x.deletedAt,
      id: x.id,
    })),
  ]
    .filter((d) => (d.type + " " + d.no + " " + (d.party || "")).toLowerCase().includes(q))
    .sort((a, b) => String(b.deletedAt || "").localeCompare(String(a.deletedAt || "")));
  $("trashTable").innerHTML =
    '<div class="trash-row doc-head"><div>Type</div><div>Document No.</div><div>Party</div><div>Deleted</div><div>Action</div></div>' +
      rows
        .map(
          (d) =>
            `<div class="trash-row"><div>${esc(d.type)}</div><div>${esc(d.no)}</div><div>${esc((d.party || "").split(/\n/)[0] || "—")}</div><div>${esc((d.deletedAt || "").slice(0, 10))}</div><div class="trash-actions"><button class="mini-btn restore-doc" data-type="${d.type}" data-id="${esc(d.id)}">Restore</button><button class="mini-btn purge-doc" data-type="${d.type}" data-id="${esc(d.id)}">Delete Forever</button></div></div>`,
        )
        .join("") || '<div style="padding:12px;color:#9ca3af">Trash is empty.</div>';
  $("trashTable")
    .querySelectorAll(".restore-doc")
    .forEach(
      (b) =>
        (b.onclick = () => (b.dataset.type === "Way Bill" ? restoreWaybill(b.dataset.id) : restoreInvoice(b.dataset.id))),
    );
  $("trashTable")
    .querySelectorAll(".purge-doc")
    .forEach((b) => (b.onclick = () => (b.dataset.type === "Way Bill" ? purgeWaybill(b.dataset.id) : purgeInvoice(b.dataset.id))));
}
function renderDocuments() {
  const q = ($("documentSearch")?.value || "").toLowerCase();
  const docs = [
    ...waybills.map((x) => ({
      type: "Way Bill",
      no: x.invoiceNo,
      date: x.dateExport,
      party: x.recipient,
      total: x.totalInvoiceValue || 0,
      id: x.id,
    })),
    ...invoices.map((x) => ({ type: "Invoice", no: x.number, date: x.date, party: x.billTo, total: x.total || 0, id: x.id })),
  ]
    .filter((d) => (d.type + " " + d.no + " " + (d.party || "")).toLowerCase().includes(q))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  $("documentsTable").innerHTML =
    '<div class="doc-row doc-head"><div>Type</div><div>Document No.</div><div>Party</div><div>Total</div><div>Action</div></div>' +
      docs
        .map(
          (d) =>
            `<div class="doc-row"><div>${esc(d.type)}</div><div>${esc(d.no)}</div><div>${esc((d.party || "").split(/\n/)[0] || "—")}</div><div>${fmt(d.total)}</div><div><button class="mini-btn open-doc" data-type="${d.type}" data-id="${esc(d.id)}">Open</button></div></div>`,
        )
        .join("") || '<div style="padding:12px;color:#9ca3af">No documents found.</div>';
  document
    .querySelectorAll(".open-doc")
    .forEach(
      (b) => (b.onclick = () => (b.dataset.type === "Way Bill" ? openWaybillById(b.dataset.id) : openInvoiceById(b.dataset.id))),
    );
}
function openWaybillById(id) {
  const x = waybills.find((x) => x.id === id);
  if (x) loadWaybill(x);
}
function openInvoiceById(id) {
  const x = invoices.find((x) => x.id === id);
  if (x) loadInvoice(x);
}
function dashboardPeriodRange() {
  const period = $("dashboardPeriod")?.value || "all";
  const t = today();
  if (period === "today") return { start: t, end: t };
  if (period === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return { start: d.toISOString().slice(0, 10), end: t };
  }
  if (period === "month") return { start: t.slice(0, 7) + "-01", end: t };
  if (period === "year") return { start: t.slice(0, 4) + "-01-01", end: t };
  if (period === "custom") return { start: $("dashboardFrom")?.value || null, end: $("dashboardTo")?.value || null };
  return { start: null, end: null };
}
function inDateRange(dateStr, start, end) {
  if (!dateStr) return false;
  if (start && dateStr < start) return false;
  if (end && dateStr > end) return false;
  return true;
}
function refreshDashboard() {
  const { start, end } = dashboardPeriodRange();
  const filtering = !!(start || end);
  const wb = filtering ? waybills.filter((x) => inDateRange(x.dateExport, start, end)) : waybills,
    inv = filtering ? invoices.filter((x) => inDateRange(x.date, start, end)) : invoices;
  const p = wb.reduce((a, x) => a + num(x.totalPackages), 0),
    wt = wb.reduce((a, x) => a + num(x.totalWeight), 0),
    sv = wb.reduce((a, x) => a + num(x.shipmentTotal), 0),
    vv = wb.reduce((a, x) => a + num(x.vacuumTotal), 0),
    iv = inv.reduce((a, x) => a + (x.currency === "LKR" ? num(x.total) : 0), 0);
  $("statWaybills").textContent = wb.length;
  $("statInvoices").textContent = inv.length;
  $("statPackages").textContent = String(p);
  $("statWeight").textContent = fmt(wt) + " kg";
  $("statShipment").textContent = fmt(sv);
  $("statVacuum").textContent = fmt(vv);
  $("statInvoiceValue").textContent = "LKR " + fmt(iv);
  const ym = today().slice(0, 7);
  $("monthWaybills").textContent = wb.filter((x) => String(x.dateExport || "").startsWith(ym)).length;
  $("monthInvoices").textContent = inv.filter((x) => String(x.date || "").startsWith(ym)).length;
  $("paidInvoices").textContent = inv.filter((x) => x.status === "Paid").length;
  $("outstandingInvoices").textContent = inv.filter((x) => ["Issued", "Draft"].includes(x.status)).length;
  $("expressShipments").textContent = wb.filter((x) => x.shipmentType === "Express Saver").length;
  $("expeditedShipments").textContent = wb.filter((x) => x.shipmentType === "Expedited").length;
  $("economyShipments").textContent = wb.filter((x) => x.shipmentType === "Economy Service").length;
  $("vacuumItems").textContent = wb.reduce((a, x) => a + (x.bags || []).filter((r) => num(r.qty) > 0).length, 0);
  const docs = [
    ...wb.map((x) => ({ t: "Way Bill", n: x.invoiceNo, d: x.dateExport, p: x.recipient })),
    ...inv.map((x) => ({ t: "Invoice", n: x.number, d: x.date, p: x.billTo })),
  ]
    .sort((a, b) => String(b.d).localeCompare(String(a.d)))
    .slice(0, 8);
  $("recentDocs").innerHTML =
    docs
      .map(
        (d) =>
          `<div class="saved-item"><div class="saved-main"><b>${esc(d.t)} • ${esc(d.n)}</b><span>${esc(d.d || "")} • ${esc((d.p || "").split(/\n/)[0] || "—")}</span></div></div>`,
      )
      .join("") || '<div style="padding:10px;color:#9ca3af;font-size:12px">No saved documents yet.</div>';
}
function init() {
  populateCountries();
  currencyOptions($("wbCurrency"));
  currencyOptions($("invCurrency"));
  $("dashboardDate").textContent = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  blankWaybill();
  blankInvoice();
  refreshDashboard();
  renderSavedLists();
  nav("dashboardView");
  document.querySelectorAll(".nav-item[data-view]").forEach(
    (b) =>
      (b.onclick = () => {
        if (b.id === "waybillsMainNav") {
          blankWaybill();
          nav("waybillView");
        } else if (b.id === "invoicesMainNav") {
          blankInvoice();
          nav("invoiceView");
        } else nav(b.dataset.view);
      }),
  );
  document.querySelectorAll(".subnav-item").forEach(
    (b) =>
      (b.onclick = () => {
        if (b.dataset.action === "new-waybill") blankWaybill();
        if (b.dataset.action === "new-invoice") blankInvoice();
        nav(b.dataset.view);
      }),
  );
  $("savedNewWaybillBtn").onclick = () => {
    blankWaybill();
    nav("waybillView");
  };
  $("savedNewInvoiceBtn").onclick = () => {
    blankInvoice();
    nav("invoiceView");
  };
  $("quickWaybillBtn").onclick = () => {
    blankWaybill();
    nav("waybillView");
  };
  $("quickInvoiceBtn").onclick = () => {
    blankInvoice();
    nav("invoiceView");
  };
  $("dashNewWaybill").onclick = () => {
    blankWaybill();
    nav("waybillView");
  };
  $("dashNewInvoice").onclick = () => {
    blankInvoice();
    nav("invoiceView");
  };
  $("dashWaybills").onclick = () => nav("waybillSavedView");
  $("dashInvoices").onclick = () => nav("invoiceSavedView");
  $("viewAllDocs").onclick = () => nav("documentsView");
  $("newWaybillBtn").onclick = blankWaybill;
  $("saveWaybillBtn").onclick = saveWaybill;
  $("addShipmentBtn").onclick = () => addShipment();
  $("addBagBtn").onclick = () => addBag();
  $("pdfWaybillBtn").onclick = () => downloadPdf($("waybillCanvas"), `${$("wbInvoiceNo").value || "Yasi-WayBill"}.pdf`);
  $("printWaybillBtn").onclick = () => preparePrint($("waybillCanvas"), "Yasi Products Way Bill");
  $("waybillSearch").oninput = renderSavedLists;
  $("newInvoiceBtn").onclick = blankInvoice;
  $("saveInvoiceBtn").onclick = saveInvoice;
  $("addInvoiceItemBtn").onclick = () => addInvoiceItem();
  $("addInvBagBtn").onclick = () => addInvBag();
  $("pdfInvoiceBtn").onclick = () => downloadPdf($("invoiceCanvas"), `${$("invNumber").value || "Yasi-Invoice"}.pdf`);
  $("printInvoiceBtn").onclick = () => preparePrint($("invoiceCanvas"), "Yasi Products Invoice");
  $("invoiceSearch").oninput = renderSavedLists;
  $("documentSearch").oninput = renderDocuments;
  $("trashSearch").oninput = renderTrash;
  $("dashboardPeriod").onchange = () => {
    $("dashboardFrom").style.display = $("dashboardPeriod").value === "custom" ? "" : "none";
    $("dashboardTo").style.display = $("dashboardPeriod").value === "custom" ? "" : "none";
    refreshDashboard();
  };
  $("dashboardFrom").onchange = refreshDashboard;
  $("dashboardTo").onchange = refreshDashboard;
  [
    "wbInvoiceNo",
    "wbDateExport",
    "wbExportReferences",
    "wbShipper",
    "wbRecipient",
    "wbCountryExport",
    "wbImporter",
    "wbCountryManufacture",
    "wbCountryDestination",
    "wbAwbNumber",
    "wbCurrency",
    "wbDiscount",
    "wbSignatureName",
    "wbSignatureDate",
  ].forEach((id) => $(id).addEventListener("input", recalcWaybill));
  document.querySelectorAll('input[name="shipmentType"]').forEach((x) => x.addEventListener("change", recalcWaybill));
  [
    "invNumber",
    "invDate",
    "invDueDate",
    "invStatus",
    "invCurrency",
    "invReference",
    "invBillTo",
    "invShipTo",
    "invDiscount",
    "invAdvance",
    "invNotes",
    "invTerms",
  ].forEach((id) => $(id).addEventListener("input", recalcInvoice));
  $("changePasswordBtn").onclick = openChangePassword;
  $("cpCloseBtn").onclick = closeChangePassword;
  $("changePasswordForm").addEventListener("submit", handleChangePassword);
  window.addEventListener("beforeprint", () => {});
  window.addEventListener("afterprint", () => ($("printRoot").innerHTML = ""));
}
const AUTH_SESSION_KEY = "yasi_auth_session";
const AUTH_DEFAULT_USER = "admin";
const AUTH_DEFAULT_PASS = "yasi2026";
function authCheck(u, p) {
  const storedUser = localStorage.getItem("yasi_auth_user") || AUTH_DEFAULT_USER;
  const storedPass = localStorage.getItem("yasi_auth_pass") || AUTH_DEFAULT_PASS;
  return u === storedUser && p === storedPass;
}
function showApp() {
  $("loginScreen").classList.add("hidden");
  $("appRoot").classList.remove("hidden");
  if (!window.__appInited) {
    window.__appInited = true;
    init();
  }
}
function showLogin() {
  $("appRoot").classList.add("hidden");
  $("loginScreen").classList.remove("hidden");
  $("loginUsername").focus();
}
function openChangePassword() {
  $("cpCurrentPassword").value = "";
  $("cpNewUsername").value = localStorage.getItem("yasi_auth_user") || AUTH_DEFAULT_USER;
  $("cpNewPassword").value = "";
  $("cpConfirmPassword").value = "";
  $("cpError").textContent = "";
  $("changePasswordModal").classList.remove("hidden");
  $("cpCurrentPassword").focus();
}
function closeChangePassword() {
  $("changePasswordModal").classList.add("hidden");
}
function handleChangePassword(e) {
  e.preventDefault();
  const storedPass = localStorage.getItem("yasi_auth_pass") || AUTH_DEFAULT_PASS;
  const curPass = $("cpCurrentPassword").value;
  const newUser = $("cpNewUsername").value.trim();
  const newPass = $("cpNewPassword").value;
  const confirmPass = $("cpConfirmPassword").value;
  if (curPass !== storedPass) {
    $("cpError").textContent = "Current password is incorrect.";
    return;
  }
  if (!newUser) {
    $("cpError").textContent = "Username cannot be empty.";
    return;
  }
  if (newPass && newPass !== confirmPass) {
    $("cpError").textContent = "New passwords do not match.";
    return;
  }
  localStorage.setItem("yasi_auth_user", newUser);
  if (newPass) localStorage.setItem("yasi_auth_pass", newPass);
  closeChangePassword();
  toast("Login details updated");
}
function initAuth() {
  $("loginLogo").src = LOGO_SRC;
  $("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const u = $("loginUsername").value.trim(),
      p = $("loginPassword").value;
    if (authCheck(u, p)) {
      sessionStorage.setItem(AUTH_SESSION_KEY, "1");
      $("loginError").textContent = "";
      $("loginForm").reset();
      showApp();
    } else {
      $("loginError").textContent = "Invalid username or password.";
    }
  });
  if (sessionStorage.getItem(AUTH_SESSION_KEY) === "1") {
    showApp();
  } else {
    showLogin();
  }
}
window.addEventListener("DOMContentLoaded", () => {
  initAuth();
  $("logoutBtn").onclick = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    showLogin();
  };
});
