import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const books = [
  { id: 1, cover: "/Atomic Habits.jpg" },
  { id: 2, cover: "/Deep Work.jpeg" },
  { id: 3, cover: "/Start With Why.jpg" },
  { id: 4, cover: "/The Age of AI.jpg" },
  { id: 5, cover: "/The Pragmatic Programmer.jpg" },
];

const BOOK_W = 110;
const BOOK_H = 158;
const GAP = 150;

export default function BookCarousel() {
  const [active, setActive] = useState(0);
  const total = books.length;

  const prev = () => setActive((a) => (a - 1 + total) % total);
  const next = () => setActive((a) => (a + 1) % total);

  const getDiff = (index) => {
    let diff = index - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  const getStyle = (diff) => {
    const absD = Math.abs(diff);
    const translateX = diff * GAP;
    const scale = absD === 0 ? 1 : absD === 1 ? 0.7 : 0.5;
    const rotateY = absD === 0 ? 0 : diff > 0 ? -45 : 45;
    const zIndex = 10 - absD;
    const opacity = absD === 2 ? 0.6 : 1;
    const brightness = absD === 0 ? 1 : absD === 1 ? 0.65 : 0.4;

    return {
      position: "absolute",
      transform: `translateX(${translateX}px) scale(${scale}) perspective(800px) rotateY(${rotateY}deg)`,
      zIndex,
      opacity,
      filter: `brightness(${brightness})`,
      transition: "all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      transformOrigin: "center center",
      cursor: "pointer",
    };
  };

  return (
    <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
      {/* Section Header */}
      <div className="text-center mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">Koleksi Buku Terpopuler</h2>
        <p className="text-xs text-gray-500">Temukan buku pilihan dari perpustakaan kami</p>
      </div>

      {/* Carousel */}
      <div className="relative flex items-center justify-center">
        {/* Left Arrow */}
        <button
          onClick={prev}
          className="absolute left-0 z-30 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Books Stage */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{ width: "100%", height: BOOK_H + 40 }}
        >
          {books.map((book, index) => {
            const diff = getDiff(index);
            return (
              <div
                key={book.id}
                style={getStyle(diff)}
                onClick={() => setActive(index)}
              >
                <img
                  src={book.cover}
                  alt={`Buku ${index + 1}`}
                  draggable={false}
                  style={{
                    width: BOOK_W,
                    height: BOOK_H,
                    borderRadius: 10,
                    objectFit: "cover",
                    display: "block",
                    boxShadow:
                      diff === 0
                        ? "0 20px 50px rgba(0,0,0,0.3)"
                        : "0 6px 18px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={next}
          className="absolute right-0 z-30 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {books.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 16 : 6,
              height: 6,
              background: i === active ? "#3b82f6" : "#d1d5db",
            }}
          />
        ))}
      </div>
    </div>
  );
}