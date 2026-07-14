import { useEffect, useRef, useState } from "react";
import { Play, ArrowRight, Star, ArrowCounterClockwise } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
gsap.registerPlugin(ScrollTrigger);

const AESTHETIC_IMAGES = {
  hero: "https://picsum.photos/seed/cinema-hero-dark/1920/1080",
  bento1: "https://picsum.photos/seed/film-strip/800/800",
  bento2: "https://picsum.photos/seed/mood-lighting/800/800",
  inline: "https://picsum.photos/seed/lens-flare/200/80",
  stack1: "https://picsum.photos/seed/noir-scene/600/800",
  stack2: "https://picsum.photos/seed/neon-streets/600/800",
  stack3: "https://picsum.photos/seed/abstract-blur/600/800",
};

function MagneticCTA({ href, onClick, children, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const textX = useTransform(springX, (v) => v * 0.5);
  const textY = useTransform(springY, (v) => v * 0.5);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((e.clientX - centerX) * 0.25);
    y.set((e.clientY - centerY) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ x: springX, y: springY }}
      className={`relative flex items-center justify-center ${className}`}
    >
      <motion.span style={{ x: textX, y: textY }} className="w-full h-full flex items-center justify-center pointer-events-none text-ink">
        {children}
      </motion.span>
    </Component>
  );
}

function Navigation() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-8 py-4 bg-ink/80 backdrop-blur-md rounded-full border border-cream/10 w-[90%] max-w-5xl">
      <div className="font-bold tracking-widest uppercase text-sm">CineMatch</div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-cream/70">
        <a href="#engine" className="hover:text-cream transition-colors">Engine</a>
        <a href="#catalog" className="hover:text-cream transition-colors">Catalog</a>
      </div>
      <MagneticCTA href="#try" className="px-6 py-2 bg-cream text-ink rounded-full font-bold text-sm hover:bg-cream/90 transition-colors">
        Start Engine
      </MagneticCTA>
    </nav>
  );
}

function Hero() {
  const container = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-element", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.2
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative min-h-[100dvh] flex items-center pt-24 pb-24 px-6 md:px-12 lg:px-24">
      {/* Background Ambience */}
      <div className="absolute inset-0 -z-10 bg-ink">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,_var(--color-amber)_0%,_transparent_40%)] opacity-10 mix-blend-screen" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 space-y-10">
          <h1 className="hero-element text-cream text-[clamp(3.5rem,8vw,7rem)] leading-[0.95] font-medium tracking-tighter max-w-5xl">
            Find your next watch
            <span 
              className="inline-block w-24 md:w-40 h-12 md:h-20 rounded-full align-middle bg-cover bg-center mx-4 -mt-4 grayscale hover:grayscale-0 transition-all duration-700" 
              style={{ backgroundImage: `url(${AESTHETIC_IMAGES.inline})` }} 
            />
            by pure mood.
          </h1>
          <p className="hero-element text-cream/60 text-lg md:text-xl max-w-xl leading-relaxed">
            Stop scrolling endlessly. CineMatch aligns cinematic geometry with human emotion to suggest a hyper-curated shortlist.
          </p>
          <div className="hero-element flex items-center gap-6">
            <MagneticCTA href="#try" className="group px-8 py-5 bg-cream text-ink rounded-full font-bold hover:bg-cream/90 transition-colors">
              <span className="flex items-center gap-3">
                <span>Start Engine</span>
                <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </span>
            </MagneticCTA>
            <button className="flex items-center justify-center w-16 h-16 rounded-full border border-cream/20 text-cream hover:bg-cream/5 transition-colors">
              <Play weight="fill" />
            </button>
          </div>
        </div>

        <div className="hero-element w-full md:w-1/3 aspect-[3/4] rounded-[2rem] overflow-hidden relative group">
          <img 
            src={AESTHETIC_IMAGES.hero} 
            alt="Cinematic aesthetic" 
            className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-ink/20 mix-blend-multiply" />
        </div>
      </div>
    </section>
  );
}

const MOODS = ["Slow burn", "Comfort", "Mind-bending", "Date night"];
const TIMES = ["Under 90 min", "Two episodes", "Weekend binge"];
const GENRES = ["Drama", "Thriller", "Sci-fi", "Comedy"];
const ERAS = ["Classic (Pre-80s)", "Golden Age (80s-90s)", "Modern (2000s+)", "Brand New"];
const VISUALS = ["Gritty & Raw", "Stylized & Neon", "Sleek & Minimal", "Cinematic Epic"];
const PACINGS = ["Slow & Deliberate", "Steady Tension", "Fast & Chaotic", "Unpredictable"];

function Engine() {
  const [resultText, setResultText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({ mood: "", time: "", genre: "", era: "", visual: "", pacing: "" });

const handleSelect = async (type, val) => {
  const newSelections = { ...selections, [type]: val };

  // Check before updating state (setState is async)
  const isLastStep = step === steps.length - 1;

  setSelections(newSelections);
  setStep((s) => s + 1);

  if (!isLastStep) return;

  setIsGenerating(true);
  setResultText("");

  try {
    const response = await fetch("http://localhost:3000/api/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSelections),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Streaming not supported by this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const text = decoder.decode(value, { stream: true });

      console.log("📦 Chunk:", text);

      setResultText((prev) => prev + text);
    }

    console.log("✅ Stream complete");
  } catch (err) {
    console.error("Engine failure:", err);
    setResultText("Engine failed to ignite. Please try again.");
  } finally {
    setIsGenerating(false);
  }
};

  const reset = () => {
    setStep(0);
    setSelections({ mood: "", time: "", genre: "", era: "", visual: "", pacing: "" });
  };

  const steps = [
    { title: "What's the frequency tonight?", key: "mood", options: MOODS },
    { title: "How much time do we have?", key: "time", options: TIMES },
    { title: "Any genre boundaries?", key: "genre", options: GENRES },
    { title: "Which era feels right?", key: "era", options: ERAS },
    { title: "How should it look?", key: "visual", options: VISUALS },
    { title: "What pace are we setting?", key: "pacing", options: PACINGS }
  ];

  return (
    <section id="engine" className="py-32 px-6 md:px-12 lg:px-24 bg-ink relative overflow-hidden flex items-center justify-center min-h-[80vh]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-charcoal-soft)_0%,_transparent_70%)] opacity-50" />
      
      <div className="relative w-full max-w-4xl mx-auto border border-cream/10 bg-charcoal/50 backdrop-blur-3xl rounded-[3rem] p-12 md:p-20 shadow-2xl">
        <AnimatePresence mode="wait">
          {step < steps.length ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center text-center space-y-12"
            >
              <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-cream">
                {steps[step].title}
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {steps[step].options.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(steps[step].key, opt)}
                    className="px-8 py-4 rounded-full border border-cream/20 bg-ink/50 text-cream/80 hover:text-ink hover:bg-cream hover:border-cream transition-colors text-lg md:text-xl font-medium"
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="flex flex-col md:flex-row gap-12"
            >
              <div className="w-full md:w-1/3 aspect-[3/4] rounded-3xl overflow-hidden relative sticky top-10 h-fit">
                 <img src={AESTHETIC_IMAGES.stack1} alt="Recommended film" className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-1000" />
                 <div className="absolute inset-0 bg-ink/20 mix-blend-multiply" />
              </div>
              <div className="flex-1 flex flex-col items-start space-y-6 text-left">
                <div className="px-4 py-1.5 rounded-full border border-amber/30 text-amber text-xs font-bold tracking-widest uppercase">
                  Matches Found
                </div>
                
                <div className="w-full text-lg text-cream/80 leading-relaxed whitespace-pre-wrap font-sans">
                  {isGenerating && !resultText 
                    ? "Calibrating cinematic grid...\nGenerating curations based on your frequency..." 
                    : resultText}
                </div>

                <button onClick={reset} className="flex items-center gap-2 text-cream/50 hover:text-cream transition-colors mt-8 pt-6 border-t border-cream/10 w-full">
                  <ArrowCounterClockwise /> <span>Calibrate again</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function GaplessBento() {
  return (
    <section className="py-32 px-6 md:px-12 lg:px-24 bg-ink">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-16 max-w-2xl">
          The architecture of perfect curation.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[240px] md:grid-flow-dense">
          
          {/* Large Feature Cell */}
          <div className="group col-span-1 md:col-span-2 row-span-2 relative rounded-[2rem] overflow-hidden bg-charcoal-soft border border-cream/5">
            <img src={AESTHETIC_IMAGES.bento1} alt="Film strip" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-60 transition-all duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 space-y-4">
              <h3 className="text-3xl font-medium text-cream">Geometry of Taste</h3>
              <p className="text-cream/60 max-w-md">Our engine maps narrative tension and visual aesthetics, moving beyond simple genre tags.</p>
            </div>
          </div>

          {/* Tall Typographic Cell */}
          <div className="col-span-1 md:col-span-1 row-span-2 p-8 rounded-[2rem] bg-amber text-ink flex flex-col justify-between">
            <Star weight="fill" size={32} className="opacity-80" />
            <div className="space-y-2">
              <div className="text-5xl font-bold tracking-tighter">98%</div>
              <p className="font-medium opacity-80 leading-snug">Accuracy rate in matching human mood to cinematic pacing.</p>
            </div>
          </div>

          {/* Standard Cell */}
          <div className="group col-span-1 md:col-span-1 row-span-1 rounded-[2rem] overflow-hidden relative bg-charcoal p-8 border border-cream/5 hover:border-amber/40 transition-colors duration-500">
             <h4 className="text-xl font-medium text-cream mb-2">Deep Library</h4>
             <p className="text-sm text-cream/50">Access to archives bridging classic cinema and modern indies.</p>
          </div>

          {/* Image Cell */}
          <div className="group col-span-1 md:col-span-1 row-span-1 rounded-[2rem] overflow-hidden relative">
            <img src={AESTHETIC_IMAGES.bento2} alt="Mood lighting" className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-700 ease-out" />
          </div>

        </div>
      </div>
    </section>
  );
}

function GsapSplitPinned() {
  const wrapperRef = useRef(null);
  const [isMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const rightCols = gsap.utils.toArray(".scroll-card");
        
        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=150%",
          pin: ".pinned-left",
          pinSpacing: false
        });

        rightCols.forEach((card) => {
          gsap.fromTo(card, 
            { scale: 0.8, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              scrollTrigger: {
                trigger: card,
                start: "top 80%",
                end: "top 30%",
                scrub: true
              }
            }
          );
        });
      });
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrapperRef} className="py-20 md:py-32 px-6 md:px-12 lg:px-24 bg-charcoal relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 relative">
        
        {/* Pinned Left Side */}
        <div className="pinned-left w-full md:w-5/12 h-fit md:h-[100vh] flex flex-col justify-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-medium tracking-tight">
            Curated context.
          </h2>
          <p className="text-xl text-cream/60 leading-relaxed max-w-md">
            The era of scrolling endless grids is over. We surface films that match the exact frequency of your evening.
          </p>
          <a href="#try" className="w-fit text-amber font-medium flex items-center gap-2 hover:gap-4 transition-all">
            See the algorithm <ArrowRight />
          </a>
        </div>

        {/* Scrolling Right Side */}
        <div className="w-full md:w-7/12 flex flex-col gap-12 md:gap-32 py-10 md:py-[20vh]" key={isMobile ? "mobile" : "desktop"}>
          {[AESTHETIC_IMAGES.stack1, AESTHETIC_IMAGES.stack2, AESTHETIC_IMAGES.stack3].map((img, i) => (
            <motion.div 
              key={i} 
              className="scroll-card w-full aspect-[4/5] rounded-3xl overflow-hidden relative bg-ink"
              initial={isMobile ? { opacity: 0, y: 50 } : { opacity: 1, y: 0, scale: 1 }}
              whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
            >
              <img src={img} alt={`Curated film ${i}`} className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity hover:grayscale-0 transition-all duration-1000" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function BigFooter() {
  return (
    <section className="bg-ink pt-48 pb-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-16">
        <h2 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-none max-w-5xl">
          Start watching.
        </h2>
        <MagneticCTA href="#try" className="group px-12 py-6 bg-cream text-ink rounded-full font-bold text-xl hover:bg-cream/90 transition-colors">
          <span className="flex items-center gap-4">
            <span>Start Engine</span>
            <ArrowRight weight="bold" className="group-hover:translate-x-2 transition-transform" />
          </span>
        </MagneticCTA>
      </div>
      
      <div className="max-w-7xl mx-auto mt-48 pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center text-sm text-cream/40">
        <div>© 2026 CineMatch Engine.</div>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-cream transition-colors">Twitter</a>
          <a href="#" className="hover:text-cream transition-colors">Letterboxd</a>
          <a href="#" className="hover:text-cream transition-colors">Legal</a>
        </div>
      </div>
    </section>
  );
}

function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1600; 
    const interval = 20;
    const step = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-ink flex flex-col items-center justify-center select-none"
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4px_4px]" />
      
      <div className="relative flex flex-col items-center space-y-8">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-cream/10 border-t-cream"
          />
          <span className="font-mono text-[10px] tracking-widest text-cream/40">SYS_RUN</span>
        </div>
        
        <div className="font-medium text-5xl md:text-7xl font-mono tracking-tighter text-cream">
          {Math.floor(progress).toString().padStart(3, "0")}%
        </div>
        
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-cream/40">
          Calibrating Cinematic Grid
        </div>
      </div>
    </motion.div>
  );
}

export function App() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-ink text-cream selection:bg-amber selection:text-ink">
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <Navigation />
      <Hero />
      <div id="try"><Engine /></div>
      <GaplessBento />
      <GsapSplitPinned />
      <BigFooter />
    </main>
  );
}
