import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BackgroundHero from "./backgrounds/BackgroundHero";

type Job = {
  id: number;
  title: string;
  description: string;
  img: string;
};

const cards: Job[] = [
  { id: 1, title: "Job1", description: "1234", img: "" },
  { id: 2, title: "Job2", description: "asdas", img: "" },
  { id: 3, title: "Job3", description: "asdasdasd", img: "" },
  { id: 4, title: "Job4", description: "asdasdas", img: "" },
  { id: 5, title: "Job5", description: "asdasdas", img: "" },
  { id: 6, title: "Job6", description: "sdaasdas", img: "" },
  { id: 7, title: "Job7", description: "asdasda", img: "" },
  { id: 8, title: "Job8", description: "dfdg", img: "" },
];

type Action = "next" | "prev" | "skip" | "add";

const SWIPE_X = 110;
const SWIPE_Y = 130;

export default function JobsSection() {
  const [index, setIndex] = useState(0);

  const [action, setAction] = useState<Action>("next"); //  тип
  const [saved, setSaved] = useState<Job[]>([]);        //  тип

  const current = cards[index];

  const goNext = () => {
    setAction("next");
    setIndex((i) => (i + 1) % cards.length);
  };

  const goPrev = () => {
    setAction("prev");
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  const doSkip = () => {
    setAction("skip");
    goNext();
  };

  const doAdd = () => {
    setAction("add");
    setSaved((prev) =>
      prev.some((x) => x.id === current.id) ? prev : [...prev, current]
    );
    goNext();
  };

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

  return (
    <section className="h-screen flex bg-gradient-to-t from-blue-300 to-slate-800 items-center justify-center overflow-hidden">
      <div className="fixed inset-0 backdrop-blur-md bg-black/30 z-[-2]"></div>
      <BackgroundHero />


      <div className="flex flex-col items-center gap-4">
        <div className="text-purple-900 font-black text-3xl">
          ❤️<span className="font-bold">{saved.length}</span>
        </div>

        <div className="relative w-72 h-96">
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
                <h1 className="text-2xl font-bold">{current.title}</h1>
                <p className="mt-2 opacity-90">{current.description}</p>
              </div>

              <div className="text-xs opacity-75">
                
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
        </div>
      </div>
    </section>
  );
}
