import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BackgroundHero from "./backgrounds/BackgroundHero";
import { fetchJobs, type Job } from "../api/jobsApi"; // путь проверь

type Action = "next" | "prev" | "skip" | "add";

const SWIPE_X = 110;
const SWIPE_Y = 130;

export default function JobsSection() {
  const [cards, setCards] = useState<Job[]>([]);
  const [index, setIndex] = useState(0);

  const [action, setAction] = useState<Action>("next");
  const [saved, setSaved] = useState<Job[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ useMemo всегда вызывается
  const variants = useMemo(
    () => ({
      enter: { y: 30, opacity: 0, scale: 0.98 },
      center: { y: 0, opacity: 1, scale: 1 },
      exit: (act: Action) => {
        if (act === "skip") return { x: -260, opacity: 0, rotate: -12, scale: 0.9 };
        if (act === "add") return { x: 260, opacity: 0, rotate: 12, scale: 0.9 };
        if (act === "prev") return { y: 260, opacity: 0, scale: 0.95 };
        return { y: -260, opacity: 0, scale: 0.95 }; // next
      },
    }),
    []
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const jobs = await fetchJobs();
        setCards(jobs);
        setIndex(0);
      } catch (e: any) {
        console.error("fetchJobs error:", e);
        setError(e?.message ?? "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasCards = cards.length > 0;
  const current = hasCards ? cards[index] : null;

  const goNext = () => {
    if (!hasCards) return;
    setAction("next");
    setIndex((i) => (i + 1) % cards.length);
  };

  const goPrev = () => {
    if (!hasCards) return;
    setAction("prev");
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  const doSkip = () => {
    setAction("skip");
    goNext();
  };

  const doAdd = () => {
    if (!current) return;
    setAction("add");
    setSaved((prev) => (prev.some((x) => x.id === current.id) ? prev : [...prev, current]));
    goNext();
  };

  return (
    <section className="h-screen flex bg-gradient-to-t from-blue-300 to-slate-800 items-center justify-center overflow-hidden">
      <div className="fixed inset-0 backdrop-blur-md bg-black/30 z-[-2]"></div>
      <BackgroundHero />

      <div className="flex flex-col items-center gap-4">
        <div className="text-purple-900 font-black text-3xl">
          hui<span className="font-bold">{saved.length}</span>
        </div>

        <div className="relative w-72 h-96">
          {/* ✅ показываем состояния, НЕ выходя из компонента */}
          {loading && (
            <div className="absolute inset-0 bg-slate-900 rounded-2xl text-white p-5 shadow-xl flex items-center justify-center">
              Loading…
            </div>
          )}

          {!loading && error && (
            <div className="absolute inset-0 bg-slate-900 rounded-2xl text-white p-5 shadow-xl">
              <div className="font-bold">Ошибка</div>
              <div className="mt-2 text-sm opacity-90">{error}</div>
              <div className="mt-3 text-xs opacity-70">
                (Если снова CORS — проще всего сделать Vite proxy /api → ngrok)
              </div>
            </div>
          )}

          {!loading && !error && !current && (
            <div className="absolute inset-0 bg-slate-900 rounded-2xl text-white p-5 shadow-xl flex items-center justify-center">
              Нет данных
            </div>
          )}

          {!loading && !error && current && (
            <AnimatePresence mode="wait" custom={action}>
              <motion.div
                key={current.id}
                custom={action}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  const { x, y } = info.offset;

                  if (x > SWIPE_X) return doAdd();
                  if (x < -SWIPE_X) return doSkip();

                  if (y < -SWIPE_Y) return goNext();
                  if (y > SWIPE_Y) return goPrev();
                }}
                whileDrag={{ scale: 1.02 }}
                className="absolute inset-0 bg-slate-900 rounded-2xl text-white p-5 shadow-xl flex flex-col justify-between select-none"
              >
                <div>
                  <h1 className="text-lg font-bold">{current.title}</h1>
                  <p className="mt-2 opacity-90 whitespace-pre-line">{current.description}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={doSkip} className="flex-1 py-2 bg-gray-500 rounded-xl font-bold">
                    Skip
                  </button>
                  <button onClick={doAdd} className="flex-1 py-2 bg-green-500 rounded-xl font-bold">
                    Add
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}