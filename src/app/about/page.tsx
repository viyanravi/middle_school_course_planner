"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Youtube, Lightbulb, Heart } from "lucide-react";

function RatingWidget() {
  const [thumbed, setThumbed] = React.useState(false);
  const [stars, setStars] = React.useState(0);
  const [hovered, setHovered] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);

  // Live counts from server
  const [thumbsCount, setThumbsCount] = React.useState<number | null>(null);
  const [starCounts, setStarCounts] = React.useState<Record<string, number> | null>(null);
  const [totalRaters, setTotalRaters] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch current counts on mount
  React.useEffect(() => {
    fetch('/api/ratings')
      .then(r => r.json())
      .then(data => {
        setThumbsCount(data.thumbsCount ?? 0);
        setStarCounts(data.starCounts ?? {});
        setTotalRaters(data.totalRaters ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (submitted || (!thumbed && stars === 0)) return;
    setSubmitted(true);

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbed, stars: stars > 0 ? stars : undefined }),
      });
      const data = await res.json();
      setThumbsCount(data.thumbsCount ?? 0);
      setStarCounts(data.starCounts ?? {});
      setTotalRaters(data.totalRaters ?? 0);
    } catch { }
  };

  // Compute average star rating
  const avgStar = (() => {
    if (!starCounts) return null;
    let total = 0, count = 0;
    for (let i = 1; i <= 5; i++) {
      total += i * (starCounts[String(i)] || 0);
      count += starCounts[String(i)] || 0;
    }
    return count > 0 ? (total / count).toFixed(1) : null;
  })();

  return (
    <section className="mb-12 border border-border rounded-2xl p-6 bg-card/60">
      <h3 className="text-lg font-bold text-primary mb-1">Was this helpful?</h3>
      <p className="text-sm text-muted-foreground mb-5">Let me know what you think of the planner!</p>

      <div className="flex items-center gap-6 flex-wrap">
        {/* Thumbs up */}
        <button
          onClick={() => { if (!submitted) setThumbed(t => !t); }}
          title="Thumbs up"
          disabled={submitted}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '999px', fontWeight: 700, fontSize: '13px',
            border: thumbed ? '2px solid #001f3f' : '2px solid #e2e8f0',
            backgroundColor: thumbed ? '#001f3f' : '#f8fafc',
            color: thumbed ? '#FFB81C' : '#64748b',
            cursor: submitted ? 'default' : 'pointer', transition: 'all 0.2s',
            opacity: submitted && !thumbed ? 0.5 : 1,
          }}
        >
          <span style={{ fontSize: '18px' }}>👍</span>
          {thumbed ? 'Thanks!' : 'Helpful'}
        </button>

        {/* Star rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => { if (!submitted) setStars(star); }}
              onMouseEnter={() => { if (!submitted) setHovered(star); }}
              onMouseLeave={() => setHovered(0)}
              title={`${star} star${star > 1 ? 's' : ''}`}
              disabled={submitted}
              style={{
                fontSize: '26px', background: 'none', border: 'none',
                cursor: submitted ? 'default' : 'pointer', transition: 'transform 0.15s',
                transform: (hovered >= star || stars >= star) ? 'scale(1.2)' : 'scale(1)',
                filter: (hovered >= star || stars >= star) ? 'none' : 'grayscale(1)',
              }}
            >
              ⭐
            </button>
          ))}
          {stars > 0 && !submitted && (
            <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 700, color: '#001f3f' }}>
              {stars === 5 ? 'Amazing! 🎉' : stars >= 3 ? 'Thanks! 😊' : "Got it, I'll improve! 🙏"}
            </span>
          )}
        </div>
      </div>

      {/* Submit button */}
      {!submitted && (thumbed || stars > 0) && (
        <button
          onClick={handleSubmit}
          style={{
            marginTop: '16px', padding: '8px 20px', borderRadius: '999px',
            backgroundColor: '#001f3f', color: '#FFB81C', fontWeight: 800,
            fontSize: '13px', border: 'none', cursor: 'pointer',
            letterSpacing: '0.04em', transition: 'opacity 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          Submit Rating
        </button>
      )}

      {submitted && (
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#22c55e', fontWeight: 700 }}>
          ✅ Your rating has been recorded — thank you!
        </p>
      )}

      {/* Live community stats */}
      <div style={{
        marginTop: '20px', padding: '14px 16px', borderRadius: '12px',
        backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
      }}>
        {loading ? (
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Loading stats…</span>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>👍</span>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#001f3f', lineHeight: 1 }}>
                  {thumbsCount ?? 0}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  found it helpful
                </div>
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: '#e2e8f0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⭐</span>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#001f3f', lineHeight: 1 }}>
                  {avgStar ?? '—'}
                  {avgStar && <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>/5</span>}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  avg rating
                </div>
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: '#e2e8f0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🧑‍🎓</span>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#001f3f', lineHeight: 1 }}>
                  {totalRaters ?? 0}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  total raters
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background border-t-2 border-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tight text-primary">
              Middle School Course Planner
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/70 transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Planner
        </Link>

        {/* Page Title */}
        <h2 className="text-4xl font-black tracking-tight text-primary mb-2">About</h2>
        <div className="w-16 h-1 bg-primary rounded-full mb-10" />

        {/* Why I Built This */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary">Why I Built This</h3>
          </div>
          <div className="pl-12 space-y-4 text-muted-foreground leading-relaxed text-[15px]">
            <p>
              When I started looking at middle school elective options, I realized there were a lot of great choices to explore.
              It took me some time to see how everything fit together, and I figured other students might be looking for a simpler
              way to see their options, too.
            </p>
            <p>
              I wanted to create something that helps our community by making the planning process a little smoother.
            </p>
          </div>
        </section>

        {/* My Goal */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary">My Goal</h3>
          </div>
          <div className="pl-12 space-y-4 text-muted-foreground leading-relaxed text-[15px]">
            <p>
              I built this planner to give my peers a simple, clear, easy-to-use view of their potential schedules.
              My hope is that this project helps students at our school and others feel confident and ready for the year ahead.
            </p>
          </div>
        </section>

        {/* Fun Facts */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Youtube className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-primary">Fun Facts</h3>
          </div>
          <div className="pl-12 space-y-4">
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              I also make videos when I have time! You can check out my YouTube channel below.
            </p>
            <a
              href="https://www.youtube.com/@ViyanRavi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold px-5 py-3 rounded-xl transition-colors text-sm"
            >
              <Youtube className="w-5 h-5" />
              @ViyanRavi on YouTube
            </a>
          </div>
        </section>

        {/* Rating Widget */}
        <RatingWidget />

        {/* Footer note */}
        <div className="mt-14 pt-8 border-t border-border text-xs text-muted-foreground text-center">
          Built by a student, for students. 🎓
        </div>
      </div>
    </main>
  );
}
