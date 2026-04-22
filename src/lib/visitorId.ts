// Stable per-browser visitor id for anonymous likes.
const KEY = "rdv-visitor-id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
