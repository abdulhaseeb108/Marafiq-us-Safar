import Counter from "../models/Counter.js";

export async function nextReference(prefix = "MUS") {
  const now = new Date();
  const yymm = String(now.getUTCFullYear()).slice(2) + String(now.getUTCMonth() + 1).padStart(2, "0");
  const counterId = prefix === "MUS" ? yymm : `${prefix}-${yymm}`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}-${yymm}-${String(counter.seq).padStart(4, "0")}`;
}
