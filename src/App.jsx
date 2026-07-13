import { useMemo, useState } from "react";
import heroImage from "./assets/cinematch-hero.png";

const moods = ["Slow burn", "Comfort", "Mind-bending", "Date night"];
const genres = ["Drama", "Thriller", "Sci-fi", "Comedy"];
const lengths = ["Under 90 min", "Two episodes", "Weekend binge"];

const picks = {
  "Slow burn": "A quiet mystery with patient tension and a final act that rewards attention.",
  Comfort: "A warm ensemble watch with low stakes, sharp dialogue, and familiar emotional rhythm.",
  "Mind-bending": "A puzzle-box story with layered timelines, clean reveals, and late-night momentum.",
  "Date night": "A polished crowd-pleaser with charm, chemistry, and enough edge to keep it memorable."
};

export function App() {
  const [mood, setMood] = useState(moods[0]);
  const [genre, setGenre] = useState(genres[1]);
  const [length, setLength] = useState(lengths[1]);

  const preview = useMemo(() => {
    return `${picks[mood]} Tuned for ${genre.toLowerCase()} and ${length.toLowerCase()}.`;
  }, [mood, genre, length]);

  return (
    <main className="site-shell">
      <section className="hero-section" aria-label="CineMatch introduction">
        <img
          className="hero-backdrop"
          src={heroImage}
          alt=""
          aria-hidden="true"
        />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />

        <nav className="hero-nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="CineMatch home">
            <span className="brand-mark" aria-hidden="true">C</span>
            <span>CineMatch</span>
          </a>
          <div className="nav-actions">
            <a href="#engine">Engine</a>
            <a href="#catalog">Catalog</a>
            <a className="nav-cta" href="#try">Try it</a>
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy reveal reveal-one">
            <p className="hero-kicker">AI movie and series recommendation engine</p>
            <h1>Find your next watch by mood.</h1>
            <p className="hero-subcopy">
              CineMatch reads your mood, time, and taste to suggest a sharper shortlist.
            </p>
            <div className="hero-buttons" aria-label="Hero actions">
              <a className="button primary-button" href="#try">
                <span>Try it</span>
                <span className="button-orb" aria-hidden="true">→</span>
              </a>
              <a className="button secondary-button" href="#engine">
                View demo
              </a>
            </div>
          </div>

          <div className="hero-experience reveal reveal-two" id="try">
            <div className="poster-stack" aria-hidden="true">
              <span className="poster-card poster-card-one" />
              <span className="poster-card poster-card-two" />
              <span className="poster-card poster-card-three" />
            </div>

            <form className="recommender-panel" id="engine">
              <div className="panel-header">
                <span className="panel-title">Tonight's brief</span>
                <span className="panel-status">Live preview</span>
              </div>

              <label>
                <span>Mood</span>
                <select value={mood} onChange={(event) => setMood(event.target.value)}>
                  {moods.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Genre</span>
                <select value={genre} onChange={(event) => setGenre(event.target.value)}>
                  {genres.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Time</span>
                <select value={length} onChange={(event) => setLength(event.target.value)}>
                  {lengths.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <output className="recommendation-preview" aria-live="polite">
                <span className="preview-label">First match</span>
                <strong>{mood} {genre}</strong>
                <span>{preview}</span>
              </output>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
