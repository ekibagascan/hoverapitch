import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import HoveraCore from "./HoveraCore";
import "./Presentation.css";

const Presentation = ({ slides }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [revealState, setRevealState] = useState(0); // 0: initial, 1: revealing, 2: revealed, 3: secondary, 4: tertiary
  const [textColor, setTextColor] = useState("#000"); // Dynamic text color based on image brightness
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const screenStreamRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const voiceStreamRef = useRef(null);
  const imageRefs = useRef({});
  const videoRef = useRef(null);
  const notesWindowRef = useRef(null);

  const goToNextSlide = useCallback(() => {
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
        }, 800);
      }
      return nextIndex;
    });
  }, [slides]);

  const handleNext = useCallback(() => {
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

    if (!startTime) setStartTime(Date.now());

    // Navigation State Machine
    if (revealState === 0) {
      setRevealState(1);
      setTimeout(() => {
        setRevealState((prev) => (prev === 1 ? 2 : prev));
      }, 800);
    } else if (revealState === 1) {
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
  }, [currentSlideIndex, revealState, slides, goToNextSlide]);

  const handlePrev = useCallback(() => {
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
  }, [currentSlideIndex, revealState, slides]);

  // Sync speaker notes when slide or state changes (COMMUNICATION ONLY)
  useEffect(() => {
    const syncNotes = () => {
      if (notesWindowRef.current && !notesWindowRef.current.closed) {
        const slide = slides[currentSlideIndex];
        const nextSlide = slides[currentSlideIndex + 1];

        notesWindowRef.current.postMessage(
          {
            type: "update",
            currentSlideIndex,
            revealState,
            startTime,
            notes: slide.notes || "No notes for this slide.",
            nextSlideImage: nextSlide?.image || null,
            nextSlideTitle: nextSlide?.title || "Untitled",
            slides: slides.map((s, i) => ({
              image: s.image,
              id: s.id,
              hasMoreSteps: !!(
                s.tools ||
                s.topMessages ||
                s.chart ||
                s.users ||
                s.pricing ||
                s.competitors ||
                s.timeline ||
                s.founder ||
                s.whyThem ||
                s.isStep
              ),
            })),
          },
          "*"
        );
      }
    };

    syncNotes();
    const interval = setInterval(syncNotes, 1000);
    return () => clearInterval(interval);
  }, [currentSlideIndex, revealState, slides, startTime]);

  // Handle messages from Speaker View
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data === "next") handleNext();
      if (e.data === "prev") handlePrev();
      if (e.data === "reset-timer") setStartTime(null);
      if (e.data === "start-timer" && !startTime) setStartTime(Date.now());
      if (e.data && e.data.type === "goto") {
        setCurrentSlideIndex(e.data.index);
        setRevealState(2);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleNext, handlePrev, startTime]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const openSpeakerNotes = () => {
    if (notesWindowRef.current && !notesWindowRef.current.closed) {
      notesWindowRef.current.focus();
      return;
    }

    const win = window.open("", "HoveraNotes", "width=1200,height=800");
    notesWindowRef.current = win;

    const initialHtml = `
      <html>
        <head>
          <title>Hovera - Presenter View</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              background: #0a0a0c; 
              color: #fff; 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              display: flex; 
              flex-direction: column; 
              height: 100vh; 
              overflow: hidden; 
            }
            .top-bar { height: 60px; background: #16161a; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .timer { font-family: monospace; font-size: 28px; color: #00f2ff; }
            .main-content { flex: 1; display: flex; padding: 40px; gap: 40px; overflow: hidden; }
            .notes-section { flex: 3; overflow-y: auto; padding-right: 20px; }
            .preview-section { flex: 2; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 40px; }
            .notes-text { font-size: 24px; line-height: 1.5; font-family: 'Georgia', serif; white-space: pre-wrap; color: #eee; }
            .status { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.3); margin-bottom: 10px; }
            .next-preview { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
            .next-preview img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; }
            .bottom-bar { height: 180px; background: #16161a; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; padding: 0 20px; gap: 20px; }
            .slides-strip { display: flex; gap: 15px; overflow-x: auto; flex: 1; padding: 10px 0; scrollbar-width: thin; }
            .slide-thumb { min-width: 160px; height: 90px; background: #000; border-radius: 8px; border: 2px solid transparent; cursor: pointer; position: relative; overflow: hidden; transition: all 0.2s ease; }
            .slide-thumb.active { border-color: #00f2ff; transform: scale(1.05); }
            .slide-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.4; }
            .slide-thumb.active img { opacity: 1; }
            .step-indicator { 
              position: absolute; 
              top: 5px; 
              right: 5px; 
              background: #00f2ff; 
              color: #000; 
              width: 18px; 
              height: 18px; 
              border-radius: 50%; 
              font-size: 11px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: 900; 
              box-shadow: 0 0 10px rgba(0,242,255,0.5);
              z-index: 10;
            }
            .nav-btn { width: 50px; height: 50px; border-radius: 50%; background: #fff; border: none; cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center; }
            .nav-btn:hover { background: #00f2ff; }
            button { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 5px 15px; border-radius: 4px; cursor: pointer; }
            button:hover { background: rgba(255,255,255,0.2); }
          </style>
        </head>
        <body>
          <div class="top-bar">
            <div class="timer" id="timer">00:00:00</div>
            <div style="display:flex; gap:10px;">
              <button onclick="window.opener.postMessage('start-timer', '*')">Start Timer</button>
              <button onclick="window.opener.postMessage('reset-timer', '*')">Reset Timer</button>
            </div>
          </div>
          <div class="main-content">
            <div class="notes-section">
              <div class="status" id="slide-status">Speaker Notes</div>
              <div class="notes-text" id="notes-content">Ready to present.</div>
            </div>
            <div class="preview-section">
              <div class="status">Next Slide</div>
              <div class="next-preview" id="next-preview"></div>
              <div id="next-title" style="margin-top: 15px; font-size: 18px; color: rgba(255,255,255,0.6); font-family: 'Georgia', serif;"></div>
            </div>
          </div>
          <div class="bottom-bar">
            <button class="nav-btn" onclick="window.opener.postMessage('prev', '*')">‹</button>
            <div class="slides-strip" id="strip"></div>
            <button class="nav-btn" onclick="window.opener.postMessage('next', '*')">›</button>
          </div>

          <script>
            let currentStartTime = null;
            let timerInterval = null;

            window.addEventListener('message', (e) => {
              const data = e.data;
              if (data.type === 'update') {
                // Update Notes & Status
                document.getElementById('notes-content').innerText = data.notes;
                document.getElementById('slide-status').innerText = 'Speaker Notes - Slide ' + (data.currentSlideIndex + 1);
                
                // Update Preview
                const nextPreview = document.getElementById('next-preview');
                nextPreview.innerHTML = data.nextSlideImage ? '<img src="' + data.nextSlideImage + '">' : '<div style="padding:40px; color: #333;">No Preview</div>';
                document.getElementById('next-title').innerText = data.nextSlideTitle;

                // Update Strip
                const strip = document.getElementById('strip');
                strip.innerHTML = data.slides.map((s, i) => \`
                  <div class="slide-thumb \${i === data.currentSlideIndex ? 'active' : ''}" onclick="window.opener.postMessage({type: 'goto', index: \${i}}, '*')">
                    \${s.image ? '<img src="' + s.image + '">' : '<div style="height:100%; background:#222;"></div>'}
                    \${s.hasMoreSteps ? '<div class="step-indicator">2</div>' : ''}
                  </div>
                \`).join('');

                // Auto Scroll
                const active = strip.querySelector('.slide-thumb.active');
                if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

                // Robust Timer Logic (Persistent)
                if (data.startTime) {
                  if (data.startTime !== currentStartTime) {
                    currentStartTime = data.startTime;
                    if (timerInterval) clearInterval(timerInterval);
                    timerInterval = setInterval(updateTimerDisplay, 1000);
                    updateTimerDisplay();
                  }
                } else if (!data.startTime) {
                  document.getElementById('timer').innerText = '00:00:00';
                  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
                  currentStartTime = null;
                }
              }
            });

            // Keyboard Navigation (FIXED)
            window.focus();
            window.addEventListener('keydown', (e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                window.opener.postMessage('next', '*');
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                window.opener.postMessage('prev', '*');
              }
            }, true);

            // Timer display helper
            function updateTimerDisplay() {
              if (!currentStartTime) {
                document.getElementById('timer').innerText = '00:00:00';
                return;
              }
              const elapsed = Math.floor((Date.now() - currentStartTime) / 1000);
              const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
              const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
              const s = String(elapsed % 60).padStart(2, '0');
              document.getElementById('timer').innerText = h + ':' + m + ':' + s;
            }
          </script>
        </body>
      </html>
    `;
    win.document.write(initialHtml);
    win.document.close();
  };

  const toggleWebcam = async () => {
    if (!isWebcamActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 480, frameRate: { ideal: 30 } },
          audio: false,
        });
        webcamStreamRef.current = stream;
        if (webcamRef.current) webcamRef.current.srcObject = stream;
        setIsWebcamActive(true);
      } catch (err) {
        console.error("Webcam error:", err);
        alert("Could not access webcam. Please check permissions.");
      }
    } else {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsWebcamActive(false);
    }
  };

  const startRecording = async () => {
    if (
      isRecording ||
      (mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive")
    )
      return;

    try {
      // 🎤 Capture Microphone Audio (Voice) FIRST to ensure prompt
      let voiceStream = null;
      try {
        voiceStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        voiceStreamRef.current = voiceStream;
      } catch (err) {
        console.warn("Microphone access denied or not found:", err);
      }

      // 🚀 Capture Screen & System Audio
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 60, max: 60 },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true, // Capture system audio
      });
      screenStreamRef.current = screenStream;

      // 💎 Mix Audio Tracks (System Audio + Microphone)
      const tracks = [...screenStream.getVideoTracks()];
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const dest = audioContext.createMediaStreamDestination();

      let hasAudio = false;

      // Add System Audio to Mix
      if (screenStream.getAudioTracks().length > 0) {
        const source = audioContext.createMediaStreamSource(
          new MediaStream([screenStream.getAudioTracks()[0]])
        );
        source.connect(dest);
        hasAudio = true;
      }

      // Add Microphone to Mix
      if (voiceStream && voiceStream.getAudioTracks().length > 0) {
        const source = audioContext.createMediaStreamSource(
          new MediaStream([voiceStream.getAudioTracks()[0]])
        );
        source.connect(dest);
        hasAudio = true;
      }

      if (hasAudio) {
        tracks.push(...dest.stream.getAudioTracks());
      }

      const combinedStream = new MediaStream(tracks);

      // 💎 Ultra-HD Bitrate & Codec Selection
      const types = [
        "video/webm;codecs=h264",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
      ];
      const mimeType =
        types.find((type) => MediaRecorder.isTypeSupported(type)) ||
        "video/webm";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 20000000,
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Hovera-UltraHD-Pitch-${new Date().toISOString()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          recordedChunksRef.current = [];
        }

        setIsRecording(false);
        setIsPaused(false);
        setRecordingStartTime(null);

        // Clean up tracks
        [screenStreamRef, voiceStreamRef].forEach((ref) => {
          if (ref.current) {
            ref.current.getTracks().forEach((t) => t.stop());
            ref.current = null;
          }
        });

        if (audioContext.state !== "closed") {
          audioContext.close();
        }
      };

      // Handle browser's own "Stop sharing" bar
      screenStream.getTracks()[0].onended = () => {
        if (recorder.state !== "inactive") recorder.stop();
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingStartTime(Date.now());
    } catch (err) {
      console.error("Recording error:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  useEffect(() => {
    if (isWebcamActive && webcamRef.current && webcamStreamRef.current) {
      webcamRef.current.srcObject = webcamStreamRef.current;
    }
  }, [isWebcamActive]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "f") {
        toggleFullscreen();
      } else if (e.key === "n") {
        openSpeakerNotes();
      } else if (e.shiftKey && e.key.toLowerCase() === "r") {
        isRecording ? stopRecording() : startRecording();
      } else if (e.shiftKey && e.key.toLowerCase() === "p") {
        if (isRecording) {
          isPaused ? resumeRecording() : pauseRecording();
        }
      } else if (e.shiftKey && e.key.toLowerCase() === "w") {
        toggleWebcam();
      } else if (e.shiftKey && e.key.toLowerCase() === "h") {
        setIsMenuVisible((prev) => !prev);
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
  }, [
    currentSlideIndex,
    revealState,
    slides,
    handleNext,
    handlePrev,
    isRecording,
    isWebcamActive,
  ]);

  // Video Autoplay logic
  useEffect(() => {
    const currentSlide = slides[currentSlideIndex];
    let playTimeout;

    if (currentSlide && currentSlide.video && videoRef.current) {
      videoRef.current.load();
      videoRef.current.currentTime = 0;
      videoRef.current.pause();

      // Wait for the slide transition (1s in CSS) to complete before playing
      playTimeout = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch((e) => {
            console.warn("Autoplay blocked, waiting for interaction", e);
            const playOnInteraction = () => {
              if (videoRef.current) videoRef.current.play();
              document.removeEventListener("click", playOnInteraction);
            };
            document.addEventListener("click", playOnInteraction);
          });
        }
      }, 1000); // 1s delay to match CSS transition
    } else if (videoRef.current) {
      videoRef.current.pause();
    }

    return () => {
      if (playTimeout) clearTimeout(playTimeout);
    };
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
          if (slide.id === 1) slideClass += " slide-1";
          if (slide.id === 2) slideClass += " slide-2";
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

      {/* Presentation Controls (Speaker Only) */}
      <div className="presentation-controls">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          title="Toggle Fullscreen (F)"
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openSpeakerNotes();
          }}
          title="Open Speaker Notes (N)"
        >
          Speaker View
        </button>
      </div>

      {/* Webcam Bubble Overlay */}
      {isWebcamActive && (
        <div className="webcam-bubble">
          <video
            ref={webcamRef}
            autoPlay
            playsInline
            muted
            className="webcam-video"
          />
        </div>
      )}

      {/* Recording Indicator & Controls */}
      {(isRecording || isWebcamActive) && isMenuVisible && (
        <div className="recording-controls">
          {isRecording && (
            <div className="recording-status">
              <div
                className={`recording-dot ${isPaused ? "paused" : ""}`}
              ></div>
              <span>{isPaused ? "PAUSED" : "RECORDING"}</span>
            </div>
          )}
          <div className="control-buttons">
            <button onClick={toggleWebcam} title="Toggle Webcam (Shift+W)">
              {isWebcamActive ? "Hide Camera" : "Show Camera"}
            </button>
            {isRecording && (
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                title="Pause/Resume (Shift+P)"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? "stop-btn" : "record-btn"}
              title="Toggle Record (Shift+R)"
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
            <button
              onClick={() => setIsMenuVisible(false)}
              title="Hide Menu (Shift+H)"
            >
              Hide Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Presentation;
