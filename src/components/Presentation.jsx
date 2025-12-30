import { useState, useEffect, useRef, Suspense } from "react";
import HoveraCore from "./HoveraCore";
import "./Presentation.css";

const Presentation = ({ slides }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [revealState, setRevealState] = useState(0); // 0: initial, 1: revealing, 2: revealed, 3: secondary, 4: tertiary
  const [textColor, setTextColor] = useState("#000"); // Dynamic text color based on image brightness
  const imageRefs = useRef({});
  const videoRef = useRef(null);

  const handleNext = () => {
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;

    // Special handling for video slides
    if (currentSlide.video) {
      goToNextSlide();
      return;
    }

    const hasSecondary = !!(
      currentSlide.tools ||
      currentSlide.topMessages ||
      currentSlide.chart ||
      currentSlide.users ||
      currentSlide.pricing ||
      currentSlide.competitors ||
      currentSlide.timeline ||
      currentSlide.founder
    );
    const hasTertiary = !!currentSlide.whyThem;

    // Navigation State Machine
    if (revealState === 0) {
      // Step 1: Start image scale-up
      setRevealState(1);
      // Wait for animation to finish before showing text (State 2)
      // Start text reveal slightly before scale ends for smoothness (2.5s)
      setTimeout(() => {
        setRevealState((prev) => (prev === 1 ? 2 : prev));
      }, 2500);
    } else if (revealState === 1) {
      // Skip animation if user clicks during scale
      setRevealState(2);
    } else if (revealState === 2) {
      if (hasSecondary) {
        setRevealState(3);
      } else {
        goToNextSlide();
      }
    } else if (revealState === 3) {
      if (hasTertiary) {
        setRevealState(4);
      } else {
        goToNextSlide();
      }
    } else if (revealState === 4) {
      goToNextSlide();
    } else {
      goToNextSlide();
    }
  };

  const goToNextSlide = () => {
    setCurrentSlideIndex((prevIndex) => {
      if (prevIndex >= slides.length - 1) return prevIndex;
      const nextIndex = prevIndex + 1;

      const nextSlide = slides[nextIndex];
      if (nextSlide.video) {
        setRevealState(2); // Videos show immediately
      } else {
        setRevealState(1); // Images start scaling
        setTimeout(() => {
          setRevealState((prev) => (prev === 1 ? 2 : prev));
        }, 2500);
      }
      return nextIndex;
    });
  };

  const handlePrev = () => {
    if (revealState === 4) {
      setRevealState(3);
    } else if (revealState === 3) {
      setRevealState(2);
    } else if (revealState === 2 || revealState === 1) {
      setRevealState(0);
    } else if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prevIndex) => {
        const nextIndex = prevIndex - 1;
        const prevSlide = slides[nextIndex];

        // Restore the furthest state of the previous slide
        if (prevSlide.whyThem) {
          setRevealState(4);
        } else if (
          prevSlide.tools ||
          prevSlide.topMessages ||
          prevSlide.chart ||
          prevSlide.users
        ) {
          setRevealState(3);
        } else {
          setRevealState(2);
        }
        return nextIndex;
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        const currentSlide = slides[currentSlideIndex];
        if (currentSlide.video && videoRef.current) {
          e.preventDefault();
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlideIndex, revealState, slides]);

  // Video Autoplay logic
  useEffect(() => {
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide && currentSlide.video && videoRef.current) {
      videoRef.current.load();
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((e) => {
        console.warn("Autoplay blocked, waiting for interaction", e);
        const playOnInteraction = () => {
          if (videoRef.current) videoRef.current.play();
          document.removeEventListener("click", playOnInteraction);
        };
        document.addEventListener("click", playOnInteraction);
      });
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [currentSlideIndex, slides]);

  const handleVideoEnd = () => handleNext();

  // Dynamic text color adjustment
  useEffect(() => {
    if (revealState < 2) {
      setTextColor("#000");
      return;
    }

    const detectBrightness = (imgElement) => {
      if (!imgElement || !imgElement.complete || imgElement.naturalWidth === 0)
        return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
      ctx.drawImage(imgElement, 0, 0);

      const headerHeight = Math.floor(canvas.height * 0.15);
      const footerHeight = Math.floor(canvas.height * 0.15);
      const headerSample = ctx.getImageData(0, 0, canvas.width, headerHeight);
      const footerSample = ctx.getImageData(
        0,
        canvas.height - footerHeight,
        canvas.width,
        footerHeight
      );

      const getAvg = (imgData) => {
        const d = imgData.data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) {
          sum += (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
        }
        return sum / (d.length / 4);
      };

      const avg = (getAvg(headerSample) + getAvg(footerSample)) / 2;
      setTextColor(avg < 128 ? "#fff" : "#000");
    };

    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;
    const imgElement = imageRefs.current[`slide-${currentSlide.id}`];

    if (imgElement) {
      if (imgElement.complete) detectBrightness(imgElement);
      else
        imgElement.addEventListener("load", () => detectBrightness(imgElement));
    }
  }, [currentSlideIndex, revealState, slides]);

  return (
    <div
      className={`presentation state-${revealState} slide-id-${
        slides[currentSlideIndex]?.id || 0
      }`}
      onClick={handleNext}
    >
      {/* Background Layer */}
      <div className="slides-layer">
        {slides.map((slide, index) => {
          const isCurrent = index === currentSlideIndex;
          const isPrevious = index < currentSlideIndex;
          const isSlide4BehindSlide5 =
            index === 3 && slides[currentSlideIndex].id === 5;

          let slideClass = "slide-container";
          if (slide.id === 5) slideClass += " slide-5";
          if (slide.id === 7) slideClass += " slide-7";
          if (slide.id === 8) slideClass += " slide-8";
          if (slide.id === 9) slideClass += " slide-9";
          if (slide.id === 10) slideClass += " slide-10";
          if (slide.id === 11) slideClass += " slide-11";
          if (isCurrent) {
            slideClass += ` current-slide ${
              revealState === 0
                ? "initial"
                : revealState === 1
                ? "revealing"
                : "revealed"
            }`;
            if (revealState === 3) slideClass += " darken";
            if (revealState >= 4) slideClass += " more-zoom";
          } else if (isPrevious || isSlide4BehindSlide5) {
            slideClass += " previous-slide";
          } else {
            slideClass += " hidden-slide";
          }

          return (
            <div key={`image-${slide.id}`} className={slideClass}>
              <div className="slide-image-wrapper">
                {slide.image && (
                  <img
                    ref={(el) => {
                      if (isCurrent)
                        imageRefs.current[`slide-${slide.id}`] = el;
                    }}
                    src={slide.image}
                    alt={`Slide ${slide.id}`}
                    className="slide-image"
                  />
                )}
                {slide.video && (
                  <video
                    ref={videoRef}
                    className="slide-video"
                    onEnded={handleVideoEnd}
                    playsInline
                    muted={false}
                    preload="auto"
                  >
                    <source src={slide.video} type="video/mp4" />
                  </video>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Text/UI Layer */}
      <div className="texts-layer">
        {slides.map((slide, index) => {
          const isCurrent = index === currentSlideIndex;
          const isPrevious = index < currentSlideIndex;

          const hasContent = !!(
            slide.title ||
            slide.subtitle ||
            slide.topMessages ||
            slide.tools ||
            slide.chart ||
            slide.users ||
            slide.whyThem ||
            slide.pricing ||
            slide.competitors
          );

          if (!hasContent) return null;

          // Render layer early for smooth transition
          const isVisible = (isCurrent && revealState >= 1) || isPrevious;
          if (!isVisible) return null;

          return (
            <div
              key={`text-${slide.id}`}
              className={`slide-content-wrapper slide-wrapper-${slide.id} ${
                isCurrent && revealState >= 2
                  ? "visible"
                  : isPrevious
                  ? "fading"
                  : ""
              } ${slide.id === 6 ? "is-final-logo" : ""}`}
            >
              {slide.chart && (
                <Suspense fallback={null}>
                  <HoveraCore
                    chartData={slide.chart}
                    large={slide.id === 6}
                    reduced={slide.id === 6 && revealState >= 3}
                    showSegments={
                      slide.id !== 6 &&
                      ((isCurrent && revealState >= 3) || isPrevious)
                    }
                    visible={
                      (isCurrent &&
                        (revealState >= 3 ||
                          (!slide.image && revealState >= 2))) ||
                      isPrevious
                    }
                  />
                </Suspense>
              )}

              {slide.id === 6 && isCurrent && revealState >= 3 && (
                <div className="donut-layout visible">
                  <div className="donut-graphic">
                    <svg viewBox="0 0 100 100" className="donut-svg">
                      {/* Left Segment (End-to-End) */}
                      <path
                        d="M 32,50 
                           A 18,18 0 0 1 41,34 
                           L 35,28 L 42,24 L 26,8 
                           A 48,48 0 0 0 26,92 
                           L 42,76 L 35,72 L 41,66 
                           A 18,18 0 0 1 32,50"
                        className="donut-segment-path"
                      />
                      {/* Top Right Segment (AI) */}
                      <path
                        d="M 41,34 
                           A 18,18 0 0 1 66,41 
                           L 72,35 L 76,42 L 92,26 
                           A 48,48 0 0 0 26,8 
                           L 42,24 L 35,28 L 41,34"
                        className="donut-segment-path"
                      />
                      {/* Bottom Right Segment (Learning Loop) */}
                      <path
                        d="M 66,41 
                           A 18,18 0 0 1 41,66 
                           L 35,72 L 42,76 L 26,92 
                           A 48,48 0 0 0 92,26 
                           L 76,42 L 72,35 L 66,41"
                        className="donut-segment-path"
                      />
                    </svg>

                    {/* Icons inside segments */}
                    <div className="donut-icon icon-left">
                      <div className="icon-wrapper">∞</div>
                    </div>
                    <div className="donut-icon icon-top-right">
                      <div className="icon-wrapper">
                        <svg
                          viewBox="0 0 24 24"
                          width="28"
                          height="28"
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="1.5"
                        >
                          <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            rx="2"
                            ry="2"
                          ></rect>
                          <rect x="9" y="9" width="6" height="6"></rect>
                          <line x1="9" y1="1" x2="9" y2="4"></line>
                          <line x1="15" y1="1" x2="15" y2="4"></line>
                          <line x1="9" y1="20" x2="9" y2="23"></line>
                          <line x1="15" y1="20" x2="15" y2="23"></line>
                          <line x1="20" y1="9" x2="23" y2="9"></line>
                          <line x1="20" y1="15" x2="23" y2="15"></line>
                          <line x1="1" y1="9" x2="4" y2="9"></line>
                          <line x1="1" y1="15" x2="4" y2="15"></line>
                        </svg>
                      </div>
                    </div>
                    <div className="donut-icon icon-bottom-right">
                      <div className="icon-wrapper">
                        <svg
                          viewBox="0 0 24 24"
                          width="28"
                          height="28"
                          stroke="currentColor"
                          fill="none"
                          strokeWidth="1.5"
                        >
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="donut-content-left">
                    <h2 className="donut-label">
                      {slide.chart.segments[0].label}
                    </h2>
                  </div>

                  <div className="donut-content-right-top">
                    <h2 className="donut-label">
                      {slide.chart.segments[1].label}
                    </h2>
                  </div>

                  <div className="donut-content-right-bottom">
                    <h2 className="donut-label">
                      {slide.chart.segments[2].label}
                    </h2>
                  </div>
                </div>
              )}

              {slide.users && (
                <div
                  className={`users-grid ${
                    (isCurrent && revealState === 3) || isPrevious
                      ? "visible"
                      : isCurrent && revealState >= 4
                      ? "disappearing"
                      : ""
                  }`}
                >
                  {slide.users.map((user, i) => (
                    <div key={i} className={`user-card user-delay-${i}`}>
                      <div className="user-image-wrapper">
                        <img src={user.image} alt={user.title} />
                        <div className="user-title-overlay">{user.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {slide.whyThem && (
                <div
                  className={`why-them-container ${
                    (isCurrent && revealState >= 4) || isPrevious
                      ? "visible"
                      : ""
                  }`}
                >
                  <div className="why-them-image-wrapper">
                    <img src={slide.whyThem.image} alt="Why Them" />
                    <div className="why-them-content">
                      <h2 className="why-them-title">{slide.whyThem.title}</h2>
                      <p className="why-them-subtitle">
                        {slide.whyThem.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {slide.topMessages && (
                <div
                  className={`top-messages ${
                    (isCurrent && revealState >= 3) || isPrevious
                      ? "visible"
                      : ""
                  }`}
                >
                  {slide.topMessages.map((msg, i) => (
                    <p key={i} className={`top-message msg-delay-${i}`}>
                      {msg}
                    </p>
                  ))}
                </div>
              )}

              {slide.tools && (
                <div
                  className={`tools-grid ${
                    (isCurrent && revealState >= 3) || isPrevious
                      ? "visible"
                      : ""
                  }`}
                >
                  {slide.tools.map((tool, i) => (
                    <img
                      key={i}
                      src={tool}
                      alt="tool"
                      className={`tool-logo reveal-scale ${
                        (isCurrent && revealState >= 3) || isPrevious
                          ? "animate"
                          : ""
                      } logo-delay-${i % 10}`}
                    />
                  ))}
                </div>
              )}

              {slide.pricing && (
                <div
                  className={`pricing-container ${
                    (isCurrent && revealState >= 3) || isPrevious
                      ? "visible"
                      : ""
                  }`}
                >
                  <div className="who-pays-banner">
                    <span>Who Pays:</span> {slide.pricing.whoPays}
                  </div>
                  <div className="pricing-grid">
                    {slide.pricing.plans.map((plan, i) => (
                      <div
                        key={i}
                        className={`pricing-card ${
                          plan.popular ? "popular" : ""
                        } delay-${i}`}
                      >
                        {plan.popular && (
                          <div className="popular-badge">Most Popular</div>
                        )}
                        <h3 className="plan-name">{plan.name}</h3>
                        <div className="plan-price">
                          <span className="amount">{plan.price}</span>
                          {plan.price !== "Free" && (
                            <span className="period">/mo</span>
                          )}
                        </div>
                        <div className="plan-meta">billed monthly</div>

                        <div className="credits-pill">
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M16 8l-4 4-4-4"></path>
                          </svg>
                          {plan.credits}
                        </div>

                        <ul className="plan-features">
                          {plan.features.map((feature, j) => {
                            const isString = typeof feature === "string";
                            const text = isString ? feature : feature.text;
                            const isDisabled = !isString && feature.disabled;

                            return (
                              <li
                                key={j}
                                className={isDisabled ? "disabled" : ""}
                              >
                                <span className="feature-icon">
                                  {j === 0 && "⟨⟩"}
                                  {j === 1 && "⚯"}
                                  {j === 2 && "⚡"}
                                  {j === 3 && "📖"}
                                  {j === 4 && "📷"}
                                  {j === 5 && "🧊"}
                                  {j === 6 && "⚙️"}
                                  {j === 7 && "↥"}
                                </span>
                                {text}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {slide.competitors && (
                <div
                  className={`competitors-container ${
                    (isCurrent && revealState >= 3) || isPrevious
                      ? "visible"
                      : ""
                  }`}
                >
                  <div className="competitors-list">
                    {slide.competitors.map((comp, i) => (
                      <div key={i} className={`competitor-item delay-${i}`}>
                        <div className="competitor-left-section">
                          <div className="competitor-logo-wrapper">
                            <img src={comp.logo} alt={comp.name} />
                          </div>
                          <h3 className="competitor-name">{comp.name}</h3>
                        </div>

                        <div className="competitor-divider"></div>

                        <div className="competitor-right-section">
                          <div className="gap-indicator">
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              stroke="currentColor"
                              fill="none"
                              strokeWidth="2.5"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            CRITICAL GAP
                          </div>
                          <p className="competitor-desc">{comp.description}</p>
                        </div>

                        <div className="competitor-card-glow"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {slide.timeline && (
                <div
                  className={`timeline-container ${
                    (isCurrent && revealState >= 3) || isPrevious
                      ? "visible"
                      : ""
                  }`}
                >
                  <div className="timeline-track">
                    <div className="timeline-progress"></div>
                  </div>

                  <div className="timeline-stages">
                    {/* Stage: NOW */}
                    <div className="timeline-stage now">
                      <div className="stage-marker">
                        <div className="marker-pulse"></div>
                      </div>
                      <div className="stage-header">
                        <span className="stage-tag">CURRENT PHASE</span>
                        <h2 className="stage-title">Now</h2>
                      </div>
                      <div className="stage-content">
                        {slide.timeline.now.map((item, i) => (
                          <div
                            key={i}
                            className={`timeline-item now-item delay-${i}`}
                          >
                            <div className="item-bullet"></div>
                            <p>{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage: NEXT */}
                    <div className="timeline-stage next">
                      <div className="stage-marker"></div>
                      <div className="stage-header">
                        <span className="stage-tag gray">UPCOMING</span>
                        <h2 className="stage-title">Next</h2>
                      </div>
                      <div className="stage-content">
                        {slide.timeline.next.map((item, i) => (
                          <div
                            key={i}
                            className={`timeline-item next-item delay-${i + 3}`}
                          >
                            <div className="item-bullet"></div>
                            <p>{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {slide.founder && (
                <div
                  className={`founder-container ${
                    (isCurrent && revealState >= 3) || isPrevious
                      ? "visible"
                      : ""
                  }`}
                >
                  <div className="founder-list">
                    {slide.founder.map((item, i) => (
                      <div key={i} className={`founder-item delay-${i}`}>
                        <div className="founder-bullet"></div>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`slide-text ${
                  isCurrent && revealState === 2
                    ? "visible"
                    : (isCurrent &&
                        revealState >= 3 &&
                        (slide.image || slide.id === 6)) ||
                      isPrevious
                    ? "fade-out"
                    : isCurrent && revealState >= 3 && !slide.image
                    ? "visible"
                    : ""
                }`}
              >
                {slide.title && <h1 className="slide-title">{slide.title}</h1>}
                {slide.subtitle && (
                  <p className="slide-subtitle">{slide.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Persistent UI */}
      <div
        className="header"
        style={{
          color: textColor,
          opacity:
            slides[currentSlideIndex] && slides[currentSlideIndex].video
              ? 0
              : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        <div className="header-left">DUBAI</div>
        <div className="header-center">HOVERA</div>
        <div className="header-right">JANUARY 4, 2026</div>
      </div>

      <div
        className="footer"
        style={{
          color: textColor,
          opacity:
            slides[currentSlideIndex] && slides[currentSlideIndex].video
              ? 0
              : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        <div className="footer-left">©2026 HOVERA, ALL RIGHT RESERVED.</div>
        <div className="footer-right">EKI BAGAS</div>
      </div>
    </div>
  );
};

export default Presentation;
