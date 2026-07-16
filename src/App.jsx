import { useEffect, useRef, useState } from "react";
import { Play, ArrowRight, Star, ArrowCounterClockwise } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "motion/react";
import cinematicTrailer from "./assets/cinematch-trailer.mp4";
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
      <a href="#" className="font-bold tracking-widest uppercase text-sm hover:text-amber transition-colors">CineMatch</a>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-cream/70">
        <a href="#engine" className="hover:text-cream transition-colors">Engine</a>
        <a href="#library" className="hover:text-cream transition-colors">Catalog</a>
      </div>
      <MagneticCTA href="#try" className="px-6 py-2 bg-cream text-ink rounded-full font-bold text-sm hover:bg-cream/90 transition-colors">
        Start Engine
      </MagneticCTA>
    </nav>
  );
}

function Hero({ onPlay }) {
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
            Find your next <span className="whitespace-nowrap">watch
            <span 
              className="inline-block w-24 md:w-40 h-12 md:h-20 rounded-full align-middle bg-cover bg-center mx-4 -mt-4 grayscale hover:grayscale-0 transition-all duration-700" 
              style={{ backgroundImage: `url(${AESTHETIC_IMAGES.inline})` }} 
            /></span>
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
            <button onClick={onPlay} className="flex items-center justify-center w-16 h-16 rounded-full border border-cream/20 text-cream hover:bg-cream/5 transition-colors">
              <Play weight="fill" />
            </button>
          </div>
        </div>

        <div className="hero-element w-full md:w-1/3 aspect-[3/4] rounded-[2rem] overflow-hidden relative group" data-cursor="play">
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

function parseRecommendations(text) {
  const recommendations = [];
  const recBlocks = text.split(/\[RECOMMENDATION \d+\]/).filter(b => b.trim());
  
  recBlocks.forEach(block => {
    const titleMatch = block.match(/\[TITLE\](.*?)(?=\[METADATA\]|\[TAGLINE\]|\[CONTENT\]|$)/s);
    const metaMatch = block.match(/\[METADATA\](.*?)(?=\[TAGLINE\]|\[CONTENT\]|$)/s);
    const taglineMatch = block.match(/\[TAGLINE\](.*?)(?=\[CONTENT\]|$)/s);
    const contentMatch = block.match(/\[CONTENT\](.*)/s);
    
    let contentSections = [];
    if (contentMatch) {
      const contentRaw = contentMatch[1].trim();
      const rawSections = contentRaw.split("###").filter(s => s.trim());
      contentSections = rawSections.map(sec => {
        const lines = sec.trim().split("\n");
        const heading = lines[0].trim();
        const bodyLines = lines.slice(1).map(l => l.trim()).filter(Boolean);
        return { heading, bodyLines };
      });
    }

    recommendations.push({
      title: titleMatch ? titleMatch[1].trim() : "",
      metadata: metaMatch ? metaMatch[1].trim() : "",
      tagline: taglineMatch ? taglineMatch[1].trim().replace(/^"|"$/g, '') : "",
      contentSections,
      raw: block
    });
  });
  return recommendations;
}

function RecommendationCard({ rec }) {
  if (!rec.title && !rec.metadata && !rec.tagline && rec.contentSections.length === 0) {
    return (
      <div className="flex flex-col animate-pulse bg-charcoal-soft/50 border border-cream/10 rounded-sm w-full relative">
        <div className="p-6 border-b border-cream/10 border-dashed">
          <div className="h-3 bg-cream/10 rounded w-1/3"></div>
        </div>
        <div className="p-8 space-y-4">
          <div className="h-8 bg-cream/10 rounded w-2/3"></div>
          <div className="h-24 bg-cream/10 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col bg-charcoal-soft/30 border border-cream/20 rounded-sm w-full relative group hover:border-amber/40 transition-colors duration-500 shadow-2xl backdrop-blur-sm">
      {/* Header / Metadata */}
      <div className="px-6 py-4 border-b border-cream/20 border-dashed flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex flex-col space-y-1">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-cream/40">
            Archive Reference
          </div>
          <div className="text-xs font-mono tracking-widest text-amber">
            {rec.metadata || "IDX-0000"}
          </div>
        </div>
        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-cream/40 text-left md:text-right leading-relaxed">
          CineMatch Engine<br/>
          SYS.REC.v1
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 md:p-10 space-y-8">
        <div className="space-y-4">
          <h3 className="text-4xl md:text-5xl font-medium tracking-tight text-cream uppercase leading-none">
            {rec.title}
          </h3>
          {rec.tagline && (
            <p className="text-xl italic text-cream/60 leading-snug">"{rec.tagline}"</p>
          )}
        </div>
        
        {rec.contentSections.length > 0 && (
          <div className="space-y-8 pt-6 border-t border-cream/10">
            {rec.contentSections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber">
                  [{sec.heading}]
                </h4>
                <div className="text-cream/80 text-sm md:text-base leading-relaxed space-y-3">
                  {sec.bodyLines.map((line, i) => {
                    if (line.startsWith("- ")) {
                      return (
                        <div key={i} className="flex gap-4 items-start">
                          <span className="mt-2 block w-1 h-1 bg-amber/60 shrink-0"></span>
                          <span>{line.substring(2)}</span>
                        </div>
                      );
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Barcode */}
      <div className="mt-auto px-6 py-6 border-t border-cream/20 border-dashed flex flex-col md:flex-row items-center justify-between gap-6 bg-charcoal/40">
         <div className="text-[9px] font-mono tracking-[0.3em] text-cream/30 uppercase text-center md:text-left">
           Generated via<br/>CineMatch Geometry
         </div>
         <div className="h-10 text-cream/20 group-hover:text-amber/40 transition-colors duration-500 w-full max-w-[200px]">
           <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
             <rect x="0" y="0" width="2" height="40" fill="currentColor" />
             <rect x="4" y="0" width="1" height="40" fill="currentColor" />
             <rect x="7" y="0" width="4" height="40" fill="currentColor" />
             <rect x="13" y="0" width="1" height="40" fill="currentColor" />
             <rect x="16" y="0" width="3" height="40" fill="currentColor" />
             <rect x="22" y="0" width="5" height="40" fill="currentColor" />
             <rect x="30" y="0" width="2" height="40" fill="currentColor" />
             <rect x="35" y="0" width="1" height="40" fill="currentColor" />
             <rect x="38" y="0" width="6" height="40" fill="currentColor" />
             <rect x="46" y="0" width="2" height="40" fill="currentColor" />
             <rect x="50" y="0" width="1" height="40" fill="currentColor" />
             <rect x="54" y="0" width="4" height="40" fill="currentColor" />
             <rect x="60" y="0" width="2" height="40" fill="currentColor" />
             <rect x="64" y="0" width="1" height="40" fill="currentColor" />
             <rect x="67" y="0" width="5" height="40" fill="currentColor" />
             <rect x="74" y="0" width="2" height="40" fill="currentColor" />
             <rect x="78" y="0" width="4" height="40" fill="currentColor" />
             <rect x="84" y="0" width="1" height="40" fill="currentColor" />
             <rect x="88" y="0" width="3" height="40" fill="currentColor" />
             <rect x="94" y="0" width="2" height="40" fill="currentColor" />
             <rect x="98" y="0" width="2" height="40" fill="currentColor" />
           </svg>
         </div>
      </div>
    </div>
  );
}

function Engine() {
  const [resultText, setResultText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({ mood: "", time: "", genre: "", era: "", visual: "", pacing: "" });
  const [currentRecIndex, setCurrentRecIndex] = useState(0);

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
    const response = await fetch("/api/recommend", {
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
    setCurrentRecIndex(0);
  };

  const steps = [
    { title: "What's the frequency tonight?", key: "mood", options: MOODS },
    { title: "How much time do we have?", key: "time", options: TIMES },
    { title: "Any genre boundaries?", key: "genre", options: GENRES },
    { title: "Which era feels right?", key: "era", options: ERAS },
    { title: "How should it look?", key: "visual", options: VISUALS },
    { title: "What pace are we setting?", key: "pacing", options: PACINGS }
  ];

  const recommendations = parseRecommendations(resultText);

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
                    data-cursor="bracket"
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
                <div className="w-full flex items-center justify-between">
                  <div className="px-4 py-1.5 rounded-full border border-amber/30 text-amber text-xs font-bold tracking-widest uppercase">
                    Matches Found
                  </div>
                  {recommendations.length > 0 && (
                    <div className="text-amber text-xs font-mono tracking-widest">
                      {Math.min(currentRecIndex + 1, recommendations.length)} / {recommendations.length}
                    </div>
                  )}
                </div>
                
                <div className="w-full flex flex-col">
                  {isGenerating && !resultText ? (
                    <div className="text-lg text-cream/80 font-sans animate-pulse">
                      Calibrating cinematic grid...<br/>Generating curations based on your frequency...
                    </div>
                  ) : (
                    <div className="flex flex-col w-full relative group">
                      {recommendations.length > 0 ? (
                        <>
                          <button
                            onClick={() => setCurrentRecIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentRecIndex === 0}
                            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-cream/20 bg-charcoal/90 text-cream backdrop-blur hover:bg-cream hover:text-ink transition-all disabled:opacity-0 disabled:pointer-events-none shadow-2xl"
                          >
                            <ArrowRight className="rotate-180" weight="bold" size={20} />
                          </button>
                          
                          <button
                            onClick={() => setCurrentRecIndex((prev) => Math.min(recommendations.length - 1, prev + 1))}
                            disabled={currentRecIndex >= recommendations.length - 1}
                            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-cream/20 bg-charcoal/90 text-cream backdrop-blur hover:bg-cream hover:text-ink transition-all disabled:opacity-0 disabled:pointer-events-none shadow-2xl"
                          >
                            <ArrowRight weight="bold" size={20} />
                          </button>

                          <AnimatePresence mode="wait">
                            <motion.div
                              key={Math.min(currentRecIndex, recommendations.length - 1)}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              className="w-full flex"
                            >
                              <RecommendationCard rec={recommendations[Math.min(currentRecIndex, recommendations.length - 1)]} />
                            </motion.div>
                          </AnimatePresence>
                        </>
                      ) : (
                        <RecommendationCard rec={{ contentSections: [] }} />
                      )}
                    </div>
                  )}
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

function GaplessBento({ onOpenImage }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const maskRadius = useMotionValue(0);
  const smoothRadius = useSpring(maskRadius, { stiffness: 40, damping: 15 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section 
      className="py-32 px-6 md:px-12 lg:px-24 bg-ink relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => maskRadius.set(1000)}
      onMouseLeave={() => maskRadius.set(0)}
    >
      <motion.div 
        className="pointer-events-none absolute inset-0 z-10 bg-ink/90"
        style={{
          maskImage: useMotionTemplate`radial-gradient(${smoothRadius}px circle at ${mouseX}px ${mouseY}px, transparent 10%, black 80%)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(${smoothRadius}px circle at ${mouseX}px ${mouseY}px, transparent 10%, black 80%)`
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-0">
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-16 max-w-2xl relative z-20">
          The architecture of perfect curation.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[240px] md:grid-flow-dense relative z-0">
          
          {/* Large Feature Cell */}
          <div className="group col-span-1 md:col-span-2 row-span-2 relative rounded-[2rem] overflow-hidden bg-charcoal-soft border border-cream/5 cursor-pointer" data-cursor="play" onClick={() => onOpenImage?.(AESTHETIC_IMAGES.bento1)}>
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
          <div className="group col-span-1 md:col-span-1 row-span-1 rounded-[2rem] overflow-hidden relative cursor-pointer" data-cursor="play" onClick={() => onOpenImage?.(AESTHETIC_IMAGES.bento2)}>
            <img src={AESTHETIC_IMAGES.bento2} alt="Mood lighting" className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-700 ease-out" />
          </div>

        </div>
      </div>
    </section>
  );
}

function InfiniteMarquee() {
  const directors = [
    "STANLEY KUBRICK", "FRENCH NEW WAVE", "AKIRA KUROSAWA", 
    "ITALIAN NEOREALISM", "ANDREI TARKOVSKY", "FILM NOIR", 
    "ALFRED HITCHCOCK", "GERMAN EXPRESSIONISM", "WONG KAR-WAI", "DOGME 95"
  ];
  
  const tickerText = directors.join(" • ") + " • ";

  return (
    <div className="w-full py-8 md:py-16 border-t border-cream/10 bg-ink overflow-hidden flex items-center relative group" data-cursor="play">
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex whitespace-nowrap will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
      >
        <h2 
          className="text-6xl md:text-[8rem] lg:text-[10rem] font-bold tracking-tighter text-transparent select-none shrink-0 px-4"
          style={{ WebkitTextStrokeWidth: "1.5px", WebkitTextStrokeColor: "rgba(244, 237, 225, 0.3)" }}
        >
          {tickerText}{tickerText}
        </h2>
      </motion.div>
    </div>
  );
}

function GsapSplitPinned({ onOpenDrawer }) {
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
          <button onClick={onOpenDrawer} className="w-fit text-amber font-medium flex items-center gap-2 hover:gap-4 transition-all">
            See the algorithm <ArrowRight />
          </button>
        </div>

        {/* Scrolling Right Side */}
        <div className="w-full md:w-7/12 flex flex-col gap-12 md:gap-32 py-10 md:py-[20vh]" key={isMobile ? "mobile" : "desktop"}>
          {[AESTHETIC_IMAGES.stack1, AESTHETIC_IMAGES.stack2, AESTHETIC_IMAGES.stack3].map((img, i) => (
            <motion.div 
              key={i} 
              className="scroll-card w-full aspect-[4/5] rounded-3xl overflow-hidden relative bg-ink"
              data-cursor="play"
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

function CodeDrawer({ isOpen, onClose }) {
  const codeLines = [
    "// SYS.REC.v1 INITIALIZATION",
    "const SYSTEM_PROMPT = `",
    "  You are CineMatch, an elite AI curation engine.",
    "  Your goal is to map human emotional frequency to cinematic geometry.",
    "  Bypass algorithmic engagement metrics.",
    "  Focus on narrative tension, visual density, and pacing.",
    "",
    "  USER_STATE:",
    "    - MOOD: ${req.mood}",
    "    - TIME: ${req.time}",
    "    - GENRE: ${req.genre}",
    "    - ERA: ${req.era}",
    "    - VISUAL: ${req.visual}",
    "    - PACING: ${req.pacing}",
    "",
    "  OUTPUT_SCHEMA:",
    "    [RECOMMENDATION 1]",
    "    [TITLE] ...",
    "    [METADATA] ...",
    "    [TAGLINE] ...",
    "    [CONTENT]",
    "    ### Cinematography",
    "    - ...",
    "    ### Pacing & Tension",
    "    - ...",
    "`;"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/80 backdrop-blur-md z-[9000]"
          />
          
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[60vw] lg:w-[45vw] bg-[#030303] border-l border-amber/20 z-[9001] flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 md:p-10 border-b border-cream/5">
              <div className="font-mono text-amber tracking-widest uppercase text-xs">
                Terminal // SYS.REC.v1
              </div>
              <button 
                onClick={onClose}
                className="text-amber hover:text-cream transition-colors font-mono text-xs uppercase tracking-widest flex items-center gap-2"
              >
                [ Close ]
              </button>
            </div>
            
            <div className="p-6 md:p-10 flex-1 overflow-y-auto overflow-x-auto font-mono text-xs md:text-sm leading-loose whitespace-pre">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.4
                    }
                  }
                }}
              >
                {codeLines.map((line, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className={
                      line.startsWith("//") ? "text-cream/30" : 
                      line.includes("SYSTEM_PROMPT") ? "text-amber" : 
                      line.includes("USER_STATE") || line.includes("OUTPUT_SCHEMA") ? "text-amber/80" : 
                      "text-cream/70"
                    }
                  >
                    {line || " "}
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            <div className="p-6 border-t border-cream/5 bg-black">
              <div className="w-3 h-5 bg-amber animate-pulse" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
          <a href="mailto:hello@cinematch.app" className="hover:text-cream transition-colors">Twitter</a>
          <a href="mailto:hello@cinematch.app" className="hover:text-cream transition-colors">Letterboxd</a>
          <a href="mailto:hello@cinematch.app" className="hover:text-cream transition-colors">Legal</a>
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

function Manifesto() {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = textRef.current.querySelectorAll(".manifesto-word");
      
      gsap.fromTo(
        words,
        { opacity: 0.1, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "bottom 75%",
            scrub: true,
          },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const text = "We don't believe in algorithmic feeds. We believe in the geometry of emotion. By mapping narrative tension, visual density, and pacing to human frequency, we bypass the endless scroll.";
  const words = text.split(" ");

  return (
    <section ref={containerRef} className="py-40 md:py-56 px-6 md:px-12 lg:px-24 bg-ink flex items-center justify-center">
      <div className="max-w-6xl mx-auto text-center md:text-left">
        <h2 ref={textRef} className="text-4xl md:text-5xl lg:text-[5rem] font-medium tracking-tight leading-[1.15] text-cream">
          {words.map((word, i) => (
            <span key={i} className="manifesto-word inline-block mr-[0.25em]">
              {word}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}

function Cursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 400, mass: 0.3 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  const [variant, setVariant] = useState("default");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
      return;
    }
    
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    
    const handleMouseOver = (e) => {
      if (e.target.closest('[data-cursor="play"]')) {
        setVariant("play");
      } else if (e.target.closest('[data-cursor="bracket"]')) {
        setVariant("bracket");
      } else if (e.target.closest('a, button, [role="button"]')) {
        setVariant("hover");
      } else {
        setVariant("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (isMobile) return null;

  const variants = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: "var(--color-amber)",
      border: "0px solid transparent"
    },
    hover: {
      width: 48,
      height: 48,
      backgroundColor: "transparent",
      border: "1px solid var(--color-amber)"
    },
    play: {
      width: 80,
      height: 80,
      backgroundColor: "var(--color-amber)",
      border: "0px solid transparent"
    },
    bracket: {
      width: 60,
      height: 60,
      backgroundColor: "transparent",
      border: "0px solid transparent"
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[10000] flex items-center justify-center rounded-full"
      variants={variants}
      animate={variant}
      initial="default"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%"
      }}
      transition={{ type: "tween", ease: "backOut", duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {variant === "play" && (
          <motion.div
            key="play"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-ink border-b-[10px] border-b-transparent ml-1"
          />
        )}
        {variant === "bracket" && (
          <motion.div
            key="bracket"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="w-full h-full text-amber text-4xl font-mono flex items-center justify-center leading-none"
          >
            [ ]
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MediaModal({ isOpen, type, src, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          className="fixed inset-0 z-[11000] flex items-center justify-center bg-ink/90 p-4 md:p-12 cursor-pointer"
          onClick={onClose}
        >
          <button className="absolute top-8 right-8 text-cream/50 hover:text-cream font-mono text-xs tracking-widest uppercase cursor-pointer">[ Close ]</button>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-6xl aspect-video bg-charcoal rounded-2xl overflow-hidden shadow-2xl ring-1 ring-cream/10 cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {type === 'video' ? (
              <video src={src || cinematicTrailer} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={src} alt="Expanded view" className="w-full h-full object-cover" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function App() {
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [media, setMedia] = useState({ isOpen: false, type: "video", src: "" });

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-ink text-cream selection:bg-amber selection:text-ink">
      <Cursor />
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      <Navigation />
      <Hero onPlay={() => setMedia({ isOpen: true, type: "video", src: "" })} />
      <Manifesto />
      <div id="try"><Engine /></div>
      <div id="library"><GaplessBento onOpenImage={(src) => setMedia({ isOpen: true, type: "image", src })} /></div>
      <InfiniteMarquee />
      <GsapSplitPinned onOpenDrawer={() => setIsDrawerOpen(true)} />
      <BigFooter />
      <CodeDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <MediaModal isOpen={media.isOpen} type={media.type} src={media.src} onClose={() => setMedia({ ...media, isOpen: false })} />
    </main>
  );
}
