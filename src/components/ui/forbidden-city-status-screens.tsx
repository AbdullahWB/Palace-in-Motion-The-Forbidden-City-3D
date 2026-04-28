import type { CSSProperties, ReactNode } from "react";

const stars = [
  { size: 2, top: "8%", left: "12%", delay: "0s" },
  { size: 1, top: "14%", left: "28%", delay: "0.8s" },
  { size: 2, top: "6%", left: "44%", delay: "1.4s" },
  { size: 1, top: "11%", left: "58%", delay: "0.4s" },
  { size: 2, top: "7%", left: "72%", delay: "2.1s" },
  { size: 1, top: "16%", left: "85%", delay: "1s" },
  { size: 2, top: "20%", left: "38%", delay: "1.7s" },
  { size: 1, top: "18%", left: "65%", delay: "0.2s" },
  { size: 2, top: "5%", left: "92%", delay: "2.5s" },
  { size: 1, top: "22%", left: "8%", delay: "1.2s" },
] as const;

const fireflies = [
  { left: "22%", top: "60%", delay: "0s", duration: "5.5s" },
  { left: "76%", top: "55%", delay: "2s", duration: "7s" },
  { left: "45%", top: "65%", delay: "1.3s", duration: "6.2s" },
] as const;

function StatusScreenAnimationStyles() {
  return (
    <style>
      {`
        @keyframes threeDStarTwinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes threeDLanternSway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        @keyframes threeDLanternFlicker {
          0%, 100% { opacity: 0.6; }
          40% { opacity: 1; }
          70% { opacity: 0.75; }
        }

        @keyframes threeDLoadingSweep {
          0% { left: -80%; }
          100% { left: 110%; }
        }

        @keyframes threeDFireflyDrift {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.6; }
          100% { transform: translate(30px, -40px); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .three-d-status-motion {
            animation: none !important;
          }
        }
      `}
    </style>
  );
}

function LoadingGateIllustration() {
  return (
    <svg
      viewBox="0 0 460 280"
      xmlns="http://www.w3.org/2000/svg"
      className="block w-full"
      aria-hidden="true"
    >
      <rect x="0" y="245" width="460" height="35" fill="#1a1008" />
      <rect x="30" y="220" width="400" height="28" fill="#3a2e1e" rx="2" />
      <rect x="50" y="212" width="360" height="12" fill="#44372a" rx="2" />
      <rect x="40" y="100" width="380" height="115" fill="#8B1F26" />
      <rect x="40" y="100" width="380" height="8" fill="rgba(0,0,0,0.3)" />
      <rect x="40" y="210" width="380" height="5" fill="rgba(0,0,0,0.35)" />
      <rect x="70" y="142" width="38" height="60" rx="2" fill="#1a0c06" />
      <rect x="128" y="150" width="32" height="52" rx="2" fill="#1a0c06" />
      <rect x="191" y="132" width="78" height="78" rx="2" fill="#1a0c06" />
      <rect x="300" y="150" width="32" height="52" rx="2" fill="#1a0c06" />
      <rect x="352" y="142" width="38" height="60" rx="2" fill="#1a0c06" />
      <path
        d="M191 180 Q230 148 269 180"
        stroke="rgba(196,144,16,0.6)"
        strokeWidth="1.5"
        fill="none"
      />
      <rect x="40" y="140" width="380" height="2" fill="#c49010" opacity="0.6" />
      <rect x="40" y="200" width="380" height="2" fill="#c49010" opacity="0.5" />
      <rect x="22" y="94" width="416" height="10" fill="#c27a14" rx="1" />
      <polygon points="22,94 60,58 400,58 438,94" fill="#b07018" />
      <rect x="65" y="52" width="330" height="9" fill="#8B1F26" />
      <rect x="48" y="44" width="364" height="10" fill="#c27a14" rx="1" />
      <polygon points="48,44 88,12 372,12 412,44" fill="#c27a14" />
      <rect x="95" y="8" width="270" height="8" fill="#7a4e0c" rx="2" />
      <rect x="91" y="4" width="8" height="14" rx="1" fill="#7a4e0c" />
      <rect x="361" y="4" width="8" height="14" rx="1" fill="#7a4e0c" />
      <rect x="225" y="2" width="10" height="12" rx="1" fill="#c49010" opacity="0.9" />
      <circle cx="22" cy="94" r="4" fill="#c27a14" opacity="0.9" />
      <circle cx="438" cy="94" r="4" fill="#c27a14" opacity="0.9" />
      <circle cx="48" cy="44" r="4" fill="#c27a14" opacity="0.9" />
      <circle cx="412" cy="44" r="4" fill="#c27a14" opacity="0.9" />
      <rect x="78" y="210" width="6" height="10" fill="#5a1018" rx="1" />
      <rect x="150" y="210" width="6" height="10" fill="#5a1018" rx="1" />
      <rect x="220" y="210" width="6" height="10" fill="#5a1018" rx="1" />
      <rect x="290" y="210" width="6" height="10" fill="#5a1018" rx="1" />
      <rect x="376" y="210" width="6" height="10" fill="#5a1018" rx="1" />
    </svg>
  );
}

function BrokenGateIllustration() {
  return (
    <svg
      width="130"
      height="160"
      viewBox="0 0 130 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-32 w-28 sm:h-40 sm:w-32"
    >
      <rect x="5" y="138" width="120" height="20" fill="#d8c8a8" rx="2" />
      <rect x="14" y="130" width="102" height="10" fill="#c8b898" rx="2" />
      <rect x="10" y="66" width="110" height="68" fill="#8B1F26" opacity="0.72" />
      <line
        x1="62"
        y1="66"
        x2="60"
        y2="134"
        stroke="rgba(200,80,40,0.2)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <polyline
        points="62,66 58,88 66,100 60,134"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="42" y="82" width="46" height="52" rx="2" fill="#2a1208" opacity="0.75" />
      <rect x="4" y="60" width="122" height="8" fill="#b07018" opacity="0.88" rx="1" />
      <polygon points="4,60 22,36 108,36 126,60" fill="#c27a14" opacity="0.82" />
      <rect x="25" y="32" width="80" height="6" fill="#7a4e0c" opacity="0.9" rx="1" />
      <rect x="22" y="28" width="5" height="12" rx="1" fill="#7a4e0c" opacity="0.85" />
      <rect x="103" y="28" width="5" height="12" rx="1" fill="#7a4e0c" opacity="0.85" />
      <circle cx="4" cy="60" r="3.5" fill="#c27a14" opacity="0.8" />
      <circle cx="126" cy="60" r="3.5" fill="#c27a14" opacity="0.8" />
      <rect x="10" y="90" width="110" height="1.5" fill="#c49010" opacity="0.45" />
    </svg>
  );
}

function Lantern({ style }: { style: CSSProperties }) {
  return (
    <div
      className="three-d-status-motion absolute origin-top"
      style={{
        ...style,
        animation: "threeDLanternSway 4s ease-in-out infinite",
      }}
      aria-hidden="true"
    >
      <div className="mx-auto h-[22px] w-px bg-[rgba(200,200,180,0.5)]" />
      <div className="mx-auto h-1.5 w-6 rounded-sm bg-[#c49010]" />
      <div className="relative flex h-7 w-[18px] items-center justify-center rounded-b-md rounded-t-sm bg-[#c8200a]">
        <span
          className="three-d-status-motion absolute inset-[3px] rounded-b-[5px] rounded-t-sm bg-[rgba(255,160,40,0.55)]"
          style={{ animation: "threeDLanternFlicker 1.6s ease-in-out infinite" }}
        />
      </div>
      <div className="mx-auto h-3.5 w-0.5 bg-[#e8c030]" />
    </div>
  );
}

export function ForbiddenCityLoadingScreen() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading Forbidden City experience"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0a0604] px-6 text-center text-[#f5e8c8]"
    >
      <StatusScreenAnimationStyles />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,#1a2c44_0%,#0d1420_45%,#060402_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,transparent_0%,#0e0906_40%,#130d08_100%)]" />
      <span className="absolute left-3 top-3 z-20 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-[rgba(220,200,160,0.6)]">
        Loading screen
      </span>

      {stars.map((star) => (
        <span
          key={`${star.left}-${star.top}`}
          className="three-d-status-motion absolute rounded-full bg-[#f0e8d0]"
          style={{
            width: star.size,
            height: star.size,
            top: star.top,
            left: star.left,
            animation: "threeDStarTwinkle 3s ease-in-out infinite",
            animationDelay: star.delay,
          }}
          aria-hidden="true"
        />
      ))}

      <div className="absolute right-[18%] top-[9%] h-12 w-12 rounded-full bg-[#f5eac0] shadow-[0_0_38px_14px_rgba(240,220,140,0.22),0_0_80px_30px_rgba(200,170,90,0.10)] sm:h-[52px] sm:w-[52px]" />

      {fireflies.map((firefly) => (
        <span
          key={`${firefly.left}-${firefly.top}`}
          className="three-d-status-motion absolute h-[3px] w-[3px] rounded-full bg-[#f0e060]"
          style={{
            left: firefly.left,
            top: firefly.top,
            animation: "threeDFireflyDrift ease-in-out infinite",
            animationDelay: firefly.delay,
            animationDuration: firefly.duration,
          }}
          aria-hidden="true"
        />
      ))}

      <Lantern style={{ bottom: 180, left: "calc(50% - 130px)", animationDelay: "0.5s" }} />
      <Lantern style={{ bottom: 180, left: "calc(50% + 112px)", animationDelay: "1.2s" }} />

      <div className="absolute bottom-0 left-1/2 w-[min(460px,88vw)] -translate-x-1/2 opacity-90">
        <LoadingGateIllustration />
      </div>

      <div className="relative z-10 pb-32">
        <span className="block font-serif text-[11px] tracking-[0.4em] text-[rgba(200,170,100,0.7)]">
          全景故宫
        </span>
        <span className="mt-3 block text-[10px] uppercase tracking-[0.28em] text-[rgba(180,150,80,0.55)]">
          Panoramic Palace
        </span>
        <h1 className="mt-7 font-serif text-2xl font-light leading-snug tracking-[0.08em] sm:text-[26px]">
          正在准备故宫入口场景...
        </h1>
        <p className="mt-1 font-serif text-[15px] italic text-[rgba(220,190,130,0.72)]">
          Preparing the palace entry scene...
        </p>
        <div className="relative mx-auto mt-8 h-px w-44 overflow-hidden bg-[rgba(180,140,60,0.2)]">
          <div
            className="three-d-status-motion absolute top-0 h-full w-[70%] bg-[linear-gradient(90deg,transparent,#c8a040,#f0d080,#c8a040,transparent)]"
            style={{ animation: "threeDLoadingSweep 2.2s ease-in-out infinite" }}
          />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[rgba(180,150,80,0.45)]">
          页面加载中 · Page loading
        </p>
      </div>
    </section>
  );
}

export function ForbiddenCityErrorScreen({
  actions,
  code,
}: {
  actions: ReactNode;
  code?: string;
}) {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#f7f2ec] px-6 py-12 text-[#1a0d08]">
      <div className="absolute inset-0 opacity-[0.04] [background-image:repeating-linear-gradient(45deg,#8B1F26_0,#8B1F26_1px,transparent_0,transparent_50%),repeating-linear-gradient(-45deg,#8B1F26_0,#8B1F26_1px,transparent_0,transparent_50%)] [background-size:22px_22px]" />
      <div className="absolute inset-x-0 top-0 h-[5px] bg-[#8B1F26] after:absolute after:inset-x-0 after:top-[5px] after:h-[3px] after:bg-[#c49010]" />
      <span className="absolute left-3 top-3 z-20 rounded-full border border-black/10 bg-black/6 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-[rgba(80,50,30,0.55)]">
        Error screen
      </span>

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-8 px-2 py-8 sm:flex-row sm:gap-10">
        <div className="shrink-0">
          <BrokenGateIllustration />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,31,38,0.22)] bg-[rgba(139,31,38,0.09)] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8B1F26]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#6a1820]">
              Render failed · 渲染失败
            </span>
          </div>

          <span className="mt-4 block font-serif text-[11px] tracking-[0.3em] text-[rgba(100,60,40,0.6)]">
            系统错误 · Application error
          </span>
          <h1 className="mt-2 font-serif text-[21px] font-normal leading-normal tracking-[0.06em]">
            故宫体验暂时无法展示。
          </h1>
          <p className="mt-1 font-serif text-sm italic leading-relaxed text-[rgba(80,50,30,0.7)]">
            The palace experience is temporarily unavailable.
          </p>
          <p className="mt-4 border-l-0 border-[#c49010] text-sm leading-7 text-[rgba(60,40,20,0.65)] sm:border-l-2 sm:pl-3">
            Something failed while rendering this route. Retry now, or continue from the homepage or the 3D view.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
            {actions}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-5 text-[9px] uppercase tracking-[0.24em] text-[rgba(100,70,50,0.35)]">
        Error code: {code ?? "3D"} · 故宫
      </div>
    </section>
  );
}
