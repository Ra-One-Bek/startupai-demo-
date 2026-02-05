export default function BackgroundHero() {
  return (
    <div className="fixed inset-0 -z-10">
      <video
        className="w-full h-full object-cover"
        src="/video/blue.mov"
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  );
}
