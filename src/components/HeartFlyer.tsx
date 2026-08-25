import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { onFly, getHeartTarget } from "@/lib/heart-flight";

type Flying = { id: number; x: number; y: number; tx: number; ty: number };

export function HeartFlyer() {
  const [items, setItems] = useState<Flying[]>([]);

  useEffect(
    () =>
      onFly((origin) => {
        const target = getHeartTarget();
        if (!target) return;
        const id = Date.now() + Math.random();
        setItems((prev) => [...prev, { id, x: origin.x, y: origin.y, tx: target.x, ty: target.y }]);
        window.setTimeout(() => {
          setItems((prev) => prev.filter((i) => i.id !== id));
        }, 950);
      }),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      <AnimatePresence>
        {items.map((it) => (
          <motion.div
            key={it.id}
            initial={{ x: it.x - 12, y: it.y - 12, scale: 1, opacity: 1 }}
            animate={{
              x: it.tx - 12,
              y: it.ty - 12,
              scale: [1, 1.4, 0.6],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.85, ease: [0.4, 0.0, 0.2, 1], times: [0, 0.7, 1] }}
            className="absolute top-0 left-0"
          >
            <Heart
              className="h-6 w-6 text-sage drop-shadow"
              fill="currentColor"
              strokeWidth={1.4}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
