import { mark } from "@/lib/mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return mark(180, 0); // iOS rounds the corners itself
}
