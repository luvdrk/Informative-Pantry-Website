"use client";

import { useEffect, useState, type CSSProperties } from "react";

const features = [
  {
    icon: "◎",
    title: "AI image recognition",
    text: "Take a photo of your groceries and let Panzi identify items for you.",
  },
  {
    icon: "↻",
    title: "Smart inventory",
    text: "Keep stock organized with automatic updates, manual editing, and search.",
  },
  {
    icon: "◴",
    title: "Freshness tracking",
    text: "Estimate remaining shelf life and receive reminders before food spoils.",
  },
  {
    icon: "⌁",
    title: "Recipe recommendations",
    text: "Discover meal ideas based on ingredients already available in your pantry.",
  },
  {
    icon: "✓",
    title: "Shopping made simple",
    text: "Spot low-stock items early and generate a practical shopping list.",
  },
  {
    icon: "✦",
    title: "AI pantry assistant",
    text: "Ask for cooking help, pantry guidance, and useful ingredient suggestions.",
  },
];

const steps = [
  {
    number: "01",
    title: "Snap your groceries",
    text: "Take one clear photo of the food items you want to add.",
  },
  {
    number: "02",
    title: "Let AI organize",
    text: "Panzi detects the items and adds them to your digital inventory.",
  },
  {
    number: "03",
    title: "Stay ahead",
    text: "Get freshness estimates, low-stock notices, and spoilage reminders.",
  },
  {
    number: "04",
    title: "Cook with confidence",
    text: "Choose a suggested recipe and automatically update used ingredients.",
  },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-leaf brand-leaf-one" />
      <span className="brand-leaf brand-leaf-two" />
      <span className="brand-dot" />
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [pantryScore, setPantryScore] = useState(0);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lightScrollThumb, setLightScrollThumb] = useState(false);

  useEffect(() => {
    let scoreFrame = 0;
    let scoreStart = 0;
    const introFrame = requestAnimationFrame(() => setIntroReady(true));

    const scoreTimer = window.setTimeout(() => {
      const countScore = (time: number) => {
        if (!scoreStart) scoreStart = time;
        const progress = Math.min((time - scoreStart) / 850, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setPantryScore(Math.round(86 * eased));
        if (progress < 1) scoreFrame = requestAnimationFrame(countScore);
      };
      scoreFrame = requestAnimationFrame(countScore);
    }, 1480);

    const revealItems = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -45px" },
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    return () => {
      cancelAnimationFrame(introFrame);
      cancelAnimationFrame(scoreFrame);
      window.clearTimeout(scoreTimer);
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const sectionTargets = Array.from(
      document.querySelectorAll<HTMLElement>("section[id], footer"),
    );
    let scrollLocked = false;
    let wheelAccumulator = 0;
    let accumulatorTimer = 0;
    let scrollFrame = 0;
    let unlockTimer = 0;
    let previousSnapType = "";

    const findCurrentSection = () => {
      const snapLine = 0;

      return sectionTargets.reduce((closestIndex, section, index) => {
        const currentDistance = Math.abs(
          section.getBoundingClientRect().top - snapLine,
        );
        const closestDistance = Math.abs(
          sectionTargets[closestIndex].getBoundingClientRect().top - snapLine,
        );

        return currentDistance < closestDistance ? index : closestIndex;
      }, 0);
    };

    const animateToSection = (section: HTMLElement) => {
      const root = document.documentElement;
      const startPosition = window.scrollY;
      const targetPosition = Math.max(
        0,
        startPosition + section.getBoundingClientRect().top,
      );
      const distance = targetPosition - startPosition;
      const duration = 760;
      let animationStart = 0;

      previousSnapType = root.style.scrollSnapType;
      root.style.scrollSnapType = "none";

      const animateScroll = (time: number) => {
        if (!animationStart) animationStart = time;

        const progress = Math.min((time - animationStart) / duration, 1);
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * eased);

        if (progress < 1) {
          scrollFrame = requestAnimationFrame(animateScroll);
          return;
        }

        window.scrollTo(0, targetPosition);
        root.style.scrollSnapType = previousSnapType;
        unlockTimer = window.setTimeout(() => {
          scrollLocked = false;
        }, 180);
      };

      scrollFrame = requestAnimationFrame(animateScroll);
    };

    const handleSectionWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
        event.deltaY === 0
      ) {
        return;
      }

      if (scrollLocked) {
        event.preventDefault();
        return;
      }

      const deltaMultiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      const normalizedDelta = event.deltaY * deltaMultiplier;

      if (
        wheelAccumulator !== 0 &&
        Math.sign(normalizedDelta) !== Math.sign(wheelAccumulator)
      ) {
        wheelAccumulator = 0;
      }

      wheelAccumulator += normalizedDelta;
      window.clearTimeout(accumulatorTimer);
      accumulatorTimer = window.setTimeout(() => {
        wheelAccumulator = 0;
      }, 180);

      if (Math.abs(wheelAccumulator) < 84) return;

      event.preventDefault();
      const direction = wheelAccumulator > 0 ? 1 : -1;
      wheelAccumulator = 0;
      const currentSection = findCurrentSection();
      const nextSection = Math.min(
        sectionTargets.length - 1,
        Math.max(0, currentSection + direction),
      );

      if (nextSection === currentSection) return;

      scrollLocked = true;
      animateToSection(sectionTargets[nextSection]);
    };

    window.addEventListener("wheel", handleSectionWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleSectionWheel);
      cancelAnimationFrame(scrollFrame);
      window.clearTimeout(accumulatorTimer);
      window.clearTimeout(unlockTimer);
      document.documentElement.style.scrollSnapType = previousSnapType;
    };
  }, []);

  useEffect(() => {
    let headerFrame = 0;

    const updateHeaderVisibility = () => {
      headerFrame = 0;
      const currentScrollPosition = window.scrollY;
      const maximumScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const homeSectionTop =
        document.getElementById("home")?.offsetTop ?? 0;
      const isPastHomeStart = currentScrollPosition > homeSectionTop + 8;
      const viewportCenter = document.elementFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2,
      );
      const activeSection = viewportCenter?.closest("section, footer");
      const isDarkSection =
        activeSection?.classList.contains("steps-section") ||
        activeSection?.classList.contains("vision-section") ||
        activeSection?.tagName === "FOOTER";

      setScrollProgress(
        maximumScroll > 0
          ? Math.min(1, Math.max(0, currentScrollPosition / maximumScroll))
          : 0,
      );
      setLightScrollThumb(Boolean(isDarkSection));
      setHeaderHidden(isPastHomeStart);
      setShowBackToTop(currentScrollPosition > window.innerHeight * 0.55);
      if (isPastHomeStart) setMenuOpen(false);
    };

    const scheduleHeaderUpdate = () => {
      if (headerFrame) return;
      headerFrame = requestAnimationFrame(updateHeaderVisibility);
    };

    updateHeaderVisibility();
    window.addEventListener("scroll", scheduleHeaderUpdate, { passive: true });
    window.addEventListener("resize", scheduleHeaderUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleHeaderUpdate);
      window.removeEventListener("resize", scheduleHeaderUpdate);
      cancelAnimationFrame(headerFrame);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const scrollBackToTop = () => {
    const root = document.documentElement;
    const startPosition = window.scrollY;
    const previousSnapType = root.style.scrollSnapType;
    const duration = Math.min(1600, Math.max(1000, startPosition * 0.14));
    let animationStart = 0;

    root.style.scrollSnapType = "none";

    const animateScroll = (time: number) => {
      if (!animationStart) animationStart = time;

      const progress = Math.min((time - animationStart) / duration, 1);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, startPosition * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
        return;
      }

      window.scrollTo(0, 0);
      root.style.scrollSnapType = previousSnapType;
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <main className={introReady ? "site-intro-ready" : "site-intro-pending"}>
      <header
        className={headerHidden ? "site-header header-hidden" : "site-header"}
      >
        <a className="brand header-brand" href="#home" aria-label="Panzi home">
          <span className="header-wordmark">panzi</span>
        </a>

        <button
          className="menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <nav className={menuOpen ? "site-nav nav-open" : "site-nav"}>
          <div className="nav-links">
            <a href="#features" onClick={closeMenu}>
              Features
            </a>
            <a href="#how-it-works" onClick={closeMenu}>
              How it works
            </a>
            <a href="#overview" onClick={closeMenu}>
              About
            </a>
            <a href="#vision" onClick={closeMenu}>
              Vision
            </a>
          </div>
          <a className="nav-cta" href="#vision" onClick={closeMenu}>
            <span className="nav-cta-label">Explore Panzi</span>
            <span className="nav-cta-arrow" aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <div
        className={`side-scrollbar${lightScrollThumb ? " is-light" : ""}`}
        style={{ "--scroll-progress": scrollProgress } as CSSProperties}
        aria-hidden="true"
      >
        <span />
      </div>

      <button
        className={showBackToTop ? "back-to-top is-visible" : "back-to-top"}
        type="button"
        aria-label="Back to top"
        tabIndex={showBackToTop ? 0 : -1}
        onClick={scrollBackToTop}
      >
        <span aria-hidden="true">↑</span>
      </button>

      <section className="hero section-shell" id="home">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="pulse-dot" />
            Your pantry, made intelligent
          </div>
          <h1>
            Less waste.
            <br />
            <em>More possibilities.</em>
          </h1>
          <p className="hero-intro">
            Panzi is an AI-powered smart pantry that knows what you have,
            helps you use it in time, and makes every meal easier to plan.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#overview">
              Explore Panzi <span>→</span>
            </a>
            <a className="text-link" href="#how-it-works">
              See how it works <span>↓</span>
            </a>
          </div>
          <div className="hero-proof" aria-label="Panzi key benefits">
            <span>AI-powered</span>
            <span>Waste-conscious</span>
            <span>Made for everyday kitchens</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Concept preview of the Panzi app">
          <div className="lime-orbit orbit-one" />
          <div className="lime-orbit orbit-two" />
          <div className="phone-card">
            <div className="phone-top">
              <span>9:41</span>
              <span>● ●●</span>
            </div>
            <div className="app-heading">
              <div>
                <span className="app-kicker">GOOD MORNING</span>
                <strong>Your pantry</strong>
              </div>
              <span className="avatar">C</span>
            </div>
            <div className="freshness-card">
              <div>
                <span className="mini-label">PANTRY HEALTH</span>
                <strong>Looking fresh!</strong>
                <p>Most items are ready to enjoy.</p>
              </div>
              <div className="health-ring">
                <span>{pantryScore}</span>
              </div>
            </div>
            <div className="scan-card">
              <div className="scan-icon">⌗</div>
              <div>
                <strong>Scan groceries</strong>
                <p>Add items with one photo</p>
              </div>
              <span className="circle-arrow">↗</span>
            </div>
            <div className="app-section-title">
              <strong>Use these soon</strong>
              <span>View all</span>
            </div>
            <div className="food-row">
              <article className="food-card">
                <span className="food-emoji">🥑</span>
                <strong>Avocado</strong>
                <small>2 days left</small>
              </article>
              <article className="food-card">
                <span className="food-emoji">🍅</span>
                <strong>Tomatoes</strong>
                <small>3 days left</small>
              </article>
            </div>
            <div className="phone-nav">
              <span className="active">⌂<small>Home</small></span>
              <span>▦<small>Pantry</small></span>
              <span>✦<small>Ideas</small></span>
              <span>☰<small>More</small></span>
            </div>
          </div>

          <div className="floating-card floating-recipe">
            <span className="float-icon">✦</span>
            <div>
              <small>RECIPE MATCH</small>
              <strong>3 ideas ready</strong>
            </div>
          </div>
          <div className="floating-card floating-saved">
            <span className="float-icon warm">↓</span>
            <div>
              <small>WASTE PREVENTED</small>
              <strong>Use it in time</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="problem-section section-shell" id="overview">
        <div className="section-heading scroll-reveal">
          <span className="section-number">01 / THE PROBLEM</span>
          <h2>
            Good food gets forgotten.
            <br />
            <em>Panzi remembers.</em>
          </h2>
        </div>
        <div className="problem-grid">
          <div className="problem-copy scroll-reveal reveal-left">
            <p>
              Busy households often lose track of what is already in the
              pantry. Food expires, the same groceries are bought twice, and
              meal planning becomes harder than it needs to be.
            </p>
            <p>
              Panzi brings inventory, freshness, meal ideas, and shopping
              support into one thoughtful experience.
            </p>
          </div>
          <div
            className="problem-path scroll-reveal stagger-group"
            aria-label="From pantry problem to Panzi solution"
          >
            <div className="path-card muted-card">
              <span className="path-symbol">?</span>
              <strong>What do I have?</strong>
              <small>Forgotten items and duplicate purchases</small>
            </div>
            <span className="path-arrow">→</span>
            <div className="path-card solution-card">
              <BrandMark />
              <strong>Panzi knows.</strong>
              <small>A clear, intelligent view of your pantry</small>
            </div>
          </div>
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="section-shell">
          <div className="section-heading split-heading scroll-reveal">
            <div>
              <span className="section-number light-number">02 / HOW IT WORKS</span>
              <h2>
                From grocery bag
                <br />
                <em>to dinner idea.</em>
              </h2>
            </div>
            <p>
              Panzi turns a simple photo into a pantry that stays useful,
              current, and ready to help.
            </p>
          </div>
          <div className="steps-grid scroll-reveal stagger-group">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <div className="step-visual" aria-hidden="true">
                  {step.number === "01" && <span className="camera-shape">◎</span>}
                  {step.number === "02" && (
                    <span className="organize-shape">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                  {step.number === "03" && <span className="clock-shape">◴</span>}
                  {step.number === "04" && <span className="bowl-shape">⌣</span>}
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section section-shell" id="features">
        <div className="section-heading feature-heading scroll-reveal">
          <div>
            <span className="section-number">03 / WHAT PANZI DOES</span>
            <h2>
              One smart place for
              <br />
              <em>everything in your pantry.</em>
            </h2>
          </div>
          <p>
            Built to reduce daily guesswork—from the moment groceries enter
            your kitchen to the moment they become a meal.
          </p>
        </div>
        <div className="feature-grid scroll-reveal stagger-group">
          {features.map((feature, index) => (
            <article
              className={`feature-card feature-${index + 1}`}
              key={feature.title}
            >
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <span className="feature-index">0{index + 1}</span>
            </article>
          ))}
        </div>
        <div className="more-features scroll-reveal">
          <span>Also inside Panzi</span>
          <div>
            <span>Nutrition tracking</span>
            <span>Automatic ingredient deduction</span>
            <span>Activity logs</span>
            <span>Manual editing</span>
          </div>
        </div>
      </section>

      <section className="vision-section" id="vision">
        <div className="vision-glow" />
        <div className="vision-content scroll-reveal reveal-left">
          <span className="section-number light-number">04 / OUR VISION</span>
          <p className="vision-kicker">A smarter pantry can shape a better habit.</p>
          <h2>
            Buy with intention.
            <br />
            Cook with confidence.
            <br />
            <em>Waste less.</em>
          </h2>
          <p className="vision-copy">
            Panzi is designed to make food management feel effortless—so
            households can spend less time checking shelves and more time
            enjoying what they already have.
          </p>
          <a className="lime-button" href="#home">
            Meet Panzi <span>↑</span>
          </a>
        </div>
        <div className="vision-orbit scroll-reveal reveal-scale" aria-hidden="true">
          <div className="orbit-core">
            <BrandMark />
          </div>
          <span className="orbit-item item-photo">⌗</span>
          <span className="orbit-item item-fresh">◴</span>
          <span className="orbit-item item-recipe">✦</span>
          <span className="orbit-item item-shop">✓</span>
        </div>
      </section>

      <section className="contact-section section-shell" id="contact">
        <div className="contact-copy scroll-reveal reveal-left">
          <span className="section-number">05 / CONTACT</span>
          <h2>
            Let’s make your pantry
            <br />
            <em>work harder for you.</em>
          </h2>
          <p>
            Have a question, an idea, or want to follow Panzi’s progress? We’d
            love to hear from you.
          </p>
        </div>
        <div className="contact-card scroll-reveal reveal-scale">
          <span className="contact-label">GET IN TOUCH</span>
          <a href="mailto:hello@panzi.app">hello@panzi.app</a>
          <p>We’ll get back to you as soon as we can.</p>
          <a className="contact-button" href="mailto:hello@panzi.app">
            Send an email <span>→</span>
          </a>
        </div>
      </section>

      <footer id="footer">
        <div className="footer-main section-shell">
          <div>
            <a className="brand footer-brand" href="#home">
              <BrandMark />
              <span>panzi</span>
            </a>
            <p>Know what you have. Love what you make.</p>
          </div>
          <div className="footer-links">
            <a href="#overview">About</a>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div className="footer-bottom section-shell">
          <span>© 2026 Panzi. Smart pantry system concept.</span>
        </div>
      </footer>
    </main>
  );
}
