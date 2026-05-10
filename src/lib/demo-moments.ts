import type { Moment } from "@/lib/store";
import img1 from "@/assets/demo-clothesline/01-tea.jpg";
import img2 from "@/assets/demo-clothesline/02-shirt.jpg";
import img3 from "@/assets/demo-clothesline/03-walk.jpg";
import img4 from "@/assets/demo-clothesline/04-album.jpg";
import img5 from "@/assets/demo-clothesline/05-noodles.jpg";
import img6 from "@/assets/demo-clothesline/06-bedside.jpg";

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const DEMO_MOMENTS: Moment[] = [
  {
    id: "demo-1",
    date: offsetDate(0),
    title: "Morning tea, the quiet kind",
    note: "He poured the second cup before I could ask.",
    photo: img1,
  },
  {
    id: "demo-2",
    date: offsetDate(0),
    title: "The top button",
    note: "He still tries the top one himself. I let him.",
    photo: img2,
  },
  {
    id: "demo-3",
    date: offsetDate(1),
    title: "A slow walk downstairs",
    note: "Void deck garden. He named every plant he could remember.",
    photo: img3,
  },
  {
    id: "demo-4",
    date: offsetDate(1),
    title: "Old album, new stories",
    note: "1973, Penang. A version of him I had never met.",
    photo: img4,
  },
  {
    id: "demo-5",
    date: offsetDate(3),
    title: "Noodles at the corner stall",
    note: "He smiled at the first bite. That was enough.",
    photo: img5,
  },
  {
    id: "demo-6",
    date: offsetDate(3),
    title: "Just sitting close",
    note: "The afternoon light, his shoulder, my whole heart.",
    photo: img6,
  },
];
