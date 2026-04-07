export default function Loading() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#070a10] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(23,80,145,0.45),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(210,167,95,0.18),transparent_34%),linear-gradient(180deg,#111521_0%,#0b0d13_100%)]" />
      <div className="relative flex min-h-[100svh] items-center justify-center px-6">
        <div className="max-w-xl rounded-[2rem] border border-white/14 bg-[rgba(8,10,14,0.42)] p-8 text-center backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f1d8b2]">
            {"\u5168\u666f\u63a2\u7d22 Panorama Explore"}
          </p>
          <h1 className="mt-4 font-display text-4xl text-white">
            Loading the palace welcome view...
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            Preparing the open-place welcome scene, map overlay, place galleries,
            and continuous palace background music.
          </p>
        </div>
      </div>
    </section>
  );
}
