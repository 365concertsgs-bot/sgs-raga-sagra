import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, supabaseError } from "./supabaseClient";

// Lazy load the Globe to reduce initial bundle size
const Globe = lazy(() => import("react-globe.gl"));

// Lazy load EventModal component to reduce main bundle
const EventModal = lazy(() => import("./EventModal"));

/* 🌍 CONTINENT LIST */
const continents = [
  "Asia",
  "Europe",
  "Africa",
  "North America",
  "South America",
  "Australia",
];

export default function App() {
  const globeRef = useRef();
  const carouselRef = useRef();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedEventNumber, setSelectedEventNumber] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [searchEventName, setSearchEventName] = useState("");
  const [filteredEventNames, setFilteredEventNames] = useState([]);
  const [showEventNameSuggestions, setShowEventNameSuggestions] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isUserActive, setIsUserActive] = useState(false);
  const [appError, setAppError] = useState(supabaseError || null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const hasValue = (value) =>
    value != null &&
    String(value).trim() !== "" &&
    String(value).trim().toUpperCase() !== "NULL";

  const getField = (row, keys) => {
    for (const key of keys) {
      const value = row[key];
      if (hasValue(value)) return String(value).trim();
    }
    return null;
  };

  const fetchEvents = useCallback(async () => {
    if (!supabase) {
      setAppError(
        "Supabase is not configured. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: eventsData, error: eventsError } = await supabase
      .from("events_365")
      .select("*");

    if (eventsError) {
      // console.error("Error loading events_365:", eventsError.message);
      setAppError(`Supabase error: ${eventsError.message}`);
      setEvents([]);
      setLoading(false);
      return;
    }

    const { data: mediaData, error: mediaError } = await supabase
      .from("events365_media")
      .select("*");

    if (mediaError) {
      // console.error("Error loading events365_media:", mediaError.message);
      setAppError(`Supabase error: ${mediaError.message}`);
      setEvents([]);
      setLoading(false);
      return;
    }

    const mapped = eventsData.map((row) => {
      const dateValue = row.date ? new Date(row.date) : null;
      const yearValue = dateValue ? dateValue.getFullYear() : null;

      return {
        no: row.no != null ? Number(row.no) : null,
        eventName: getField(row, [
          "raga_sagara_name_event",
          "event_name",
          "eventname",
          "venue",
        ]) || null,
        continent: row.continent,
        lat: row.latitude ? parseFloat(row.latitude) : null,
        lng: row.longitude ? parseFloat(row.longitude) : null,
        date: row.date,
        year: yearValue,
        location: row.city || row.country,
        place: row.venue,
        description: getField(row, ["description", "details", "event_description"]),
        images: mediaData.filter((m) => m.Event === row.no).map((m) => m.URL),
        audio:
          getField(row, [
            "link_for_audio_or_video",
            "audio",
            "audio_url",
            "media_url",
          ]) || "",
        raga:
          getField(row, [
            "Healing_ragas",
            "healing_ragas",
            "main_raga",
            "raga",
            "main_raga_name",
          ]) || null,
        city: row.city,
        country: row.country,
      };
    });

    setEvents(mapped);
    setLoading(false);
  }, []);

  // Fetch events once on component mount
  useEffect(() => {
    fetchEvents();
  }, []);


  const years = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.year).filter(Boolean))).sort(
        (a, b) => a - b
      ),
    [events]
  );

  const allCountries = useMemo(
    () => Array.from(new Set(events.map((event) => event.country).filter(Boolean))).sort(),
    [events]
  );

  const allEventNames = useMemo(
    () =>
      Array.from(
        new Set(events.map((event) => event.eventName).filter(Boolean))
      ).sort(),
    [events]
  );

  const filteredData = useMemo(
    () =>
      events.filter((event) => {
        if (selectedYear && event.year !== Number(selectedYear)) {
          return false;
        }
        if (selectedEventNumber && event.no !== Number(selectedEventNumber)) {
          return false;
        }
        if (selectedContinent && event.continent !== selectedContinent) {
          return false;
        }
        if (searchCountry && event.country !== searchCountry) {
          return false;
        }
        if (
          searchEventName &&
          !event.eventName?.toLowerCase().includes(searchEventName.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [events, selectedYear, selectedEventNumber, selectedContinent, searchCountry, searchEventName]
  );

  // Handle country search with autocomplete (optimized with useCallback)
  const handleCountryChange = useCallback((value) => {
    setSearchCountry(value);
    if (value.length > 0) {
      const matches = allCountries.filter((country) =>
        country.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCountries(matches);
      setShowCountrySuggestions(true);
    } else {
      setFilteredCountries([]);
      setShowCountrySuggestions(false);
    }
  }, [allCountries]);

  const selectCountry = (country) => {
    setSearchCountry(country);
    setShowCountrySuggestions(false);
    // Focus globe on selected country
    const countryEvent = events.find((e) => e.country === country);
    if (countryEvent) {
      focusEventOnGlobe(countryEvent);
    }
  };

  // Focus globe when filters change
  const focusEventOnGlobe = (event) => {
    if (!globeRef.current || !event) return;
    globeRef.current.pointOfView(
      { lat: event.lat, lng: event.lng, altitude: 2 },
      1500
    );
  };

  // Handle year change and focus globe
  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (year) {
      const yearEvent = events.find((e) => e.year === Number(year));
      if (yearEvent) {
        focusEventOnGlobe(yearEvent);
      }
    }
  };

  // Handle event number change and focus globe
  const handleEventNumberChange = (number) => {
    setSelectedEventNumber(number);
    if (number) {
      const event = events.find((e) => e.no === Number(number));
      if (event) {
        focusEventOnGlobe(event);
      }
    }
  };

  // Handle continent change and focus globe
  const handleContinentSelect = (continent) => {
    setSelectedContinent(continent);
    if (continent) {
      const continentEvent = events.find((e) => e.continent === continent);
      if (continentEvent) {
        const center = getContinentCenter(continent);
        globeRef.current.pointOfView(
          { lat: center.lat, lng: center.lng, altitude: 2 },
          1500
        );
      }
    }
  };

  const clearFilters = useCallback(() => {
    setSelectedYear("");
    setSelectedEventNumber("");
    setSearchCountry("");
    setSearchEventName("");
    setSelectedContinent("");
    setFilteredCountries([]);
    setShowCountrySuggestions(false);
    setFilteredEventNames([]);
    setShowEventNameSuggestions(false);
    setSelectedEvent(null);
  }, []);

  const countryLabels = [
    { lat: 20.5937, lng: 78.9629, text: "India" },
    { lat: 37.0902, lng: -95.7129, text: "USA" },
    { lat: 55.3781, lng: -3.4360, text: "UK" },
    { lat: 48.8566, lng: 2.3522, text: "France" },
    { lat: 40.7128, lng: -74.006, text: "USA" },
    { lat: -25.2744, lng: 133.7751, text: "Australia" },
    { lat: -14.2350, lng: -51.9253, text: "Brazil" },
    { lat: 35.8617, lng: 104.1954, text: "China" },
    { lat: 55.7558, lng: 37.6173, text: "Russia" },
    { lat: -30.5595, lng: 22.9375, text: "South Africa" },
  ];


  /* 🌍 AUTO ROTATE */
  useEffect(() => {
    let frame;


    const rotate = () => {
      if (!globeRef.current || isUserActive) return;


      const pov = globeRef.current.pointOfView();
      globeRef.current.pointOfView({
        lat: pov.lat,
        lng: pov.lng + 0.05,
        altitude: pov.altitude,
      });


      frame = requestAnimationFrame(rotate);
    };


    rotate();
    return () => cancelAnimationFrame(frame);
  }, [isUserActive]);


  /* 👆 USER ACTIVITY */
  const activityTimer = useRef(null);
  const isUserActiveRef = useRef(false);

  useEffect(() => {
    const handleActivity = () => {
      if (!isUserActiveRef.current) {
        isUserActiveRef.current = true;
        setIsUserActive(true);
      }
      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }
      activityTimer.current = window.setTimeout(() => {
        isUserActiveRef.current = false;
        setIsUserActive(false);
      }, 5000);
    };

    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("mousemove", handleActivity);

    return () => {
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }
    };
  }, []);

  // Auto-advance carousel for event images
  useEffect(() => {
    if (!selectedEvent?.images || selectedEvent.images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % selectedEvent.images.length;
        
        // Scroll carousel to next slide
        if (carouselRef.current) {
          const slideWidth = carouselRef.current.clientWidth;
          carouselRef.current.scrollLeft = nextIndex * slideWidth;
        }
        
        return nextIndex;
      });
    }, 4000); // 4 seconds per image

    return () => clearInterval(interval);
  }, [selectedEvent]);

  // Stop audio/video when event modal is closed (not when switching events)
  useEffect(() => {
    if (!selectedEvent) {
      // Only stop music/video when modal closes completely
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }, [selectedEvent ? null : selectedEvent]); // Only trigger when closing, not opening


  if (appError) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div>
          <h1>Unable to load the app</h1>
          <p>{appError}</p>
          <p>
            Create a <code>.env</code> file in the project root with your
            Supabase credentials.
          </p>
          <pre
            style={{
              background: "#111",
              color: "#ffd700",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            VITE_SUPABASE_URL=your_supabase_url
            <br />
            VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
          </pre>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
        }}
      >
        Loading events…
      </div>
    );
  }


  return (
    <div style={styles.container}>
      <style>{`
        @keyframes healingPulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.4;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }
        
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }

        input, select, textarea {
          -webkit-user-select: text;
          user-select: text;
        }

        body {
          font-family: 'Philosopher', serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow: hidden;
        }

        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          position: fixed;
        }
        
        a[href]:hover {
          color: #000 !important;
        }
        
        .footer-link {
          color: #ffd700;
          font-size: 14px;
          text-decoration: none;
          font-family: 'Philosopher', serif;
          font-weight: bold;
          padding: 8px 12px;
          border: 1px solid #ffd700;
          border-radius: 6px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .footer-link:hover {
          background-color: #ffd700;
          color: #000;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        }

        /* Responsive design for tablets and mobile */
        @media (max-width: 1024px) {
          /* Optimize layout for tablets and smaller laptops */
        }

        @media (max-width: 768px) {
          /* Mobile-first responsive adjustments */
          /* Filters will stack better on smaller screens */
        }

        @media (max-width: 480px) {
          /* Extra small devices */
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button, input[type="range"], select, input[type="text"], input[type="number"] {
            min-height: 44px;
            min-width: 44px;
          }
          
          button {
            padding: max(10px, 5vw) max(12px, 7vw) !important;
          }
        }

        /* Large touchscreen 65"+ */
        @media (min-width: 2560px) {
          html { font-size: 18px; }
        }

        /* Scrollbar styling for dark theme */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #ffd700;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #ffed4e;
        }
      `}</style>

      {/* 🌌 STARS */}
      <div style={styles.stars}></div>
      <div style={styles.stars2}></div>
      <div style={styles.stars3}></div>


      {/* ✨ TITLE */}
      <div style={styles.title}>Ragini Ragini Atlas</div>

      {/* 🪔 SWAMIJI LOGO - TOP LEFT */}
      <img
        src="/swamiji-left.svg"
        alt="Swamiji Left"
        style={styles.logoTopLeft}
      />

      {/* 🪔 SWAMIJI ICON - TOP RIGHT */}
      <img
        src="/swamiji-right.svg"
        alt="Swamiji Right"
        style={styles.logoTopRight}
      />

      {/* 🌍 GLOBE */}
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        pointsData={filteredData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.02}
        pointRadius={0.5}
        pointColor={() => "#ffcc00"}
        pointResolution={4}
        pointLabel={(point) =>
          `<div style="background: rgba(0,0,0,0.95); padding: 12px 16px; border-radius: 10px; color: #ffd700; font-size: 14px; font-family: Philosopher, serif; white-space: nowrap; border: 2px solid #ffd700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);">
            <div style="font-weight: bold; margin-bottom: 4px;">${point.eventName}</div>
            <div style="font-size: 12px; color: #fff;">📍 ${point.place || point.location || 'Venue'} [${point.city || 'City'}]</div>
          </div>`
        }
        onPointClick={(point) => {
          setSelectedEvent(point);
          focusEventOnGlobe(point);
        }}
        labelsData={countryLabels}
        labelLat="lat"
        labelLng="lng"
        labelText="text"
        labelSize={0.9}
        labelColor={() => "rgba(255,255,255,0.85)"}
        labelResolution={2}
        labelAltitude={0.02}
      />

      {/* 🔽 FILTERS */}
      <div style={styles.filterStack}>
        {/* Clear Filters Button */}
        <button onClick={(e) => {
          e.stopPropagation();
          clearFilters();
        }} style={styles.clearButton}>
          Clear Filters
        </button>

        {/* Event Number - Slider and Input */}
        <div style={styles.filterRow}>
          <label style={styles.label}>Event Number</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="range"
              min="1"
              max="365"
              value={selectedEventNumber}
              onChange={(e) => handleEventNumberChange(e.target.value)}
              style={styles.slider}
            />
            <input
              type="number"
              min="1"
              max="365"
              value={selectedEventNumber}
              onChange={(e) => handleEventNumberChange(e.target.value)}
              placeholder="Type #"
              style={styles.numberInput}
            />
          </div>
        </div>

        {/* Year Dropdown */}
        {years.length > 0 && (
          <div style={styles.filterRow}>
            <label style={styles.label}>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              style={styles.selectInput}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Country Search with Autocomplete */}
        <div style={styles.filterRow}>
          <label style={styles.label}>Country</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search country..."
              value={searchCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              onFocus={() => {
                if (searchCountry.length > 0) {
                  setShowCountrySuggestions(true);
                }
              }}
              style={styles.textInput}
            />
            {showCountrySuggestions && filteredCountries.length > 0 && (
              <div style={styles.dropdown}>
                {filteredCountries.map((country) => (
                  <div
                    key={country}
                    style={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectCountry(country);
                    }}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event Name Search with Autocomplete */}
        <div style={styles.filterRow}>
          <label style={styles.label}>Event Name</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search event name..."
              value={searchEventName}
              onChange={(e) => {
                const val = e.target.value;
                setSearchEventName(val);
                if (val.length > 0) {
                  const filtered = allEventNames.filter((name) =>
                    name.toLowerCase().includes(val.toLowerCase())
                  );
                  setFilteredEventNames(filtered);
                  setShowEventNameSuggestions(true);
                } else {
                  setFilteredEventNames([]);
                  setShowEventNameSuggestions(false);
                }
              }}
              onFocus={() => {
                if (searchEventName.length > 0) {
                  setShowEventNameSuggestions(true);
                }
              }}
              style={styles.textInput}
            />
            {showEventNameSuggestions && filteredEventNames.length > 0 && (
              <div style={styles.dropdown}>
                {filteredEventNames.map((eventName) => (
                  <div
                    key={eventName}
                    style={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      const selectedEvent = events.find((e) => e.eventName === eventName);
                      setSearchEventName(eventName);
                      setShowEventNameSuggestions(false);
                      setFilteredEventNames([]);
                      if (selectedEvent) {
                        focusEventOnGlobe(selectedEvent);
                      }
                    }}
                  >
                    {eventName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🎵 Media Links Section */}
        <div style={styles.mediaLinksSection}>
          <div style={styles.mediaLinksLabel}>📁 Quick Access</div>
          <div style={styles.mediaLinksContainer}>
            <a
              href="https://www.dattapeetham.org"
              target="_blank"
              rel="noreferrer"
              style={styles.mediaLink}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.mediaLinkHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "#000", color: "#ffd700", boxShadow: "none", transform: "translateY(0)" })}
            >
              🔗 Dattapeetham
            </a>
            <a
              href="https://www.yogasangeeta.org"
              target="_blank"
              rel="noreferrer"
              style={styles.mediaLink}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.mediaLinkHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "#000", color: "#ffd700", boxShadow: "none", transform: "translateY(0)" })}
            >
              🎶 YogaSangeeta
            </a>
            <a
              href="https://www.sgsragasagara.com"
              target="_blank"
              rel="noreferrer"
              style={styles.mediaLink}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.mediaLinkHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: "#000", color: "#ffd700", boxShadow: "none", transform: "translateY(0)" })}
            >
              🌐 Ragini Atlas
            </a>
          </div>
        </div>
      </div>

      {/* 🌍 CONTINENT FILTER - BOTTOM */}
      <div style={styles.continentFilter}>
        {continents.map((continent) => (
          <button
            key={continent}
            onClick={(e) => {
              e.stopPropagation();
              handleContinentSelect(continent === selectedContinent ? "" : continent);
            }}
            style={{
              ...styles.continentButton,
              backgroundColor: selectedContinent === continent ? "#ffd700" : "rgba(0,0,0,0.6)",
              color: selectedContinent === continent ? "#000" : "#ffd700",
            }}
          >
            {continent}
          </button>
        ))}
      </div>


      {/* 📸 MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <Suspense fallback={<div>Loading...</div>}>
            <EventModal 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)}
              carouselRef={carouselRef}
              currentSlideIndex={currentSlideIndex}
              setCurrentSlideIndex={setCurrentSlideIndex}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}


/* 🎨 STYLES */
const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)",
  },


  logoTopLeft: {
    position: "absolute",
    top: "clamp(10px, 2vh, 30px)",
    left: "clamp(10px, 2vw, 30px)",
    height: "clamp(50px, 10vh, 100px)",
    width: "auto",
    zIndex: 20,
    background: "transparent",
    filter: "drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))",
    objectFit: "contain",
  },

  logoTopRight: {
    position: "absolute",
    top: "clamp(10px, 2vh, 30px)",
    right: "clamp(10px, 2vw, 30px)",
    height: "clamp(50px, 10vh, 100px)",
    width: "auto",
    zIndex: 20,
    background: "transparent",
    filter: "drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))",
    objectFit: "contain",
  },


  title: {
    position: "absolute",
    top: "clamp(15px, 3vh, 25px)",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#ffd700",
    fontSize: "clamp(18px, 4vw, 28px)",
    fontFamily: "'Philosopher', serif",
    fontWeight: "bold",
    zIndex: 15,
    whiteSpace: "nowrap",
    textShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
  },


  filter: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    alignItems: "center",
  },

  filterRowTop: {
    position: "absolute",
    bottom: 230,
    left: 30,
    right: 30,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 20,
    zIndex: 20,
  },

  filterStack: {
    position: "absolute",
    bottom: 80,
    left: "clamp(15px, 3vw, 30px)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    zIndex: 20,
    backgroundColor: "#ffcc00",
    padding: "clamp(12px, 2vw, 16px)",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
    minWidth: "clamp(250px, 25vw, 380px)",
    maxWidth: "clamp(280px, 30vw, 400px)",
    maxHeight: "80vh",
    overflowY: "auto",
    fontSize: "clamp(12px, 1.5vw, 14px)",
    touchAction: "manipulation",
  },

  filterRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    color: "#000",
    fontSize: "clamp(10px, 1.2vw, 13px)",
    fontFamily: "'Philosopher', serif",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  mediaLinksSection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingTop: "8px",
    borderTop: "1px solid rgba(0, 0, 0, 0.1)",
    marginTop: "8px",
  },

  mediaLinksLabel: {
    color: "#000",
    fontSize: "clamp(10px, 1.1vw, 12px)",
    fontFamily: "'Philosopher', serif",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  mediaLinksContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  mediaLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "clamp(5px, 1vw, 8px) clamp(6px, 1.5vw, 10px)",
    backgroundColor: "#000",
    color: "#ffd700",
    textDecoration: "none",
    borderRadius: "4px",
    fontSize: "clamp(10px, 1.2vw, 12px)",
    fontFamily: "'Philosopher', serif",
    fontWeight: "500",
    cursor: "pointer",
    border: "1px solid #ffd700",
    transition: "all 0.2s ease",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    touchAction: "manipulation",
  },

  mediaLinkHover: {
    backgroundColor: "#ffd700",
    color: "#000",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    transform: "translateY(-1px)",
  },

  selectInput: {
    padding: "clamp(6px, 1vw, 10px) clamp(8px, 1.5vw, 12px)",
    fontSize: "clamp(11px, 1.3vw, 13px)",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#000",
    outline: "none",
    cursor: "pointer",
    touchAction: "manipulation",
  },

  textInput: {
    padding: "clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)",
    fontSize: "clamp(12px, 1.3vw, 14px)",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#000",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    touchAction: "manipulation",
  },

  slider: {
    flex: 1,
    height: "6px",
    borderRadius: "3px",
    background: "#ddd",
    outline: "none",
    cursor: "pointer",
    accentColor: "#ffd700",
  },

  numberInput: {
    width: "clamp(80px, 15vw, 120px)",
    minWidth: "80px",
    padding: "clamp(6px, 1vw, 10px) clamp(8px, 1.5vw, 12px)",
    fontSize: "clamp(12px, 1.3vw, 13px)",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#000",
    outline: "none",
    touchAction: "manipulation",
  },

  clearButton: {
    padding: "clamp(10px, 1.5vw, 14px) clamp(12px, 2vw, 16px)",
    fontSize: "clamp(12px, 1.3vw, 14px)",
    borderRadius: "6px",
    border: "none",
    background: "#ffd700",
    color: "#000",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: "'Philosopher', serif",
    touchAction: "manipulation",
  },

  musicToggle: {
    position: "absolute",
    bottom: 30,
    right: 30,
    zIndex: 20,
  },

  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "100%",
    background: "#000",
    color: "#fff",
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
  },


  modalHeader: {
    position: "relative",
    top: "auto",
    left: "auto",
    right: "auto",
    padding: "clamp(12px, 2vw, 20px) clamp(20px, 3vw, 30px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid rgba(255, 215, 0, 0.1)",
    flexShrink: 0,
  },


  contentWrapper: {
    position: "relative",
    top: "auto",
    bottom: "auto",
    left: "auto",
    right: "auto",
    flex: 1,
    display: "flex",
    gap: 20,
    padding: "clamp(12px, 2vw, 20px)",
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
  },


  leftPane: {
    flex: 2,
    borderRadius: "12px",
    overflow: "hidden",
    minHeight: "300px",
    display: "flex",
    alignItems: "stretch",
  },


  rightPane: {
    flex: 1,
    background: "rgba(0,0,0,0.75)",
    padding: "clamp(12px, 2vw, 20px)",
    borderRadius: "12px",
    maxHeight: "100%",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  },


  sectionTitle: {
    color: "#ffd700",
    marginBottom: "10px",
    marginTop: "20px",
    fontSize: "clamp(14px, 2vw, 18px)",
  },


  description: {
    fontSize: "clamp(14px, 1.8vw, 18px)",
    marginBottom: "20px",
    lineHeight: "1.6",
  },


  raga: {
    fontSize: "clamp(14px, 1.8vw, 18px)",
    marginBottom: "20px",
    lineHeight: "1.6",
  },


  carousel: {
    display: "flex",
    height: "100%",
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    WebkitOverflowScrolling: "touch",
    scrollSnapType: "x mandatory",
    scrollBehavior: "smooth",
  },


  slide: {
    minWidth: "100%",
    height: "100%",
    scrollSnapAlign: "start",
    displaying: "flex",
  },


  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },


  stars: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background:
      "transparent url('https://www.transparenttextures.com/patterns/stardust.png') repeat",
  },
  stars2: { position: "absolute", width: "100%", height: "100%", opacity: 0.5 },
  stars3: { position: "absolute", width: "100%", height: "100%", opacity: 0.3 },

  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "6px",
    maxHeight: "200px",
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },

  dropdownItem: {
    padding: "clamp(8px, 1vw, 12px) clamp(10px, 1.5vw, 14px)",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    fontSize: "clamp(12px, 1.3vw, 13px)",
    color: "#000",
    touchAction: "manipulation",
  },

  continentFilter: {
    position: "absolute",
    bottom: 50,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
    zIndex: 20,
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: "800px",
    padding: "10px 0",
  },

  continentButton: {
    padding: "clamp(6px, 1vw, 10px) clamp(8px, 1.5vw, 12px)",
    fontSize: "clamp(11px, 1.2vw, 13px)",
    borderRadius: "6px",
    border: "1px solid #ffd700",
    cursor: "pointer",
    fontFamily: "'Philosopher', serif",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    touchAction: "manipulation",
  },

  swamijiBg: {
    position: "absolute",
    top: -350,
    left: 40,
    width: "1050px",
    height: "1050px",
    zIndex: 18,
    pointerEvents: "none",
    opacity: 0.75,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maskImage: "radial-gradient(ellipse 80% 100% at 50% 100%, transparent 0%, rgba(0,0,0,1) 40%)",
    WebkitMaskImage: "radial-gradient(ellipse 80% 100% at 50% 100%, transparent 0%, rgba(0,0,0,1) 40%)",
  },

  healingRays: {
    position: "absolute",
    width: "250%",
    height: "250%",
    right: "-75%",
    bottom: "-75%",
    background: "conic-gradient(from 260deg at 30% 30%, rgba(255, 215, 0, 0.6) 0deg, rgba(255, 215, 0, 0.4) 30deg, rgba(255, 215, 0, 0.2) 60deg, rgba(255, 215, 0, 0) 120deg, transparent 180deg)",
    filter: "blur(35px)",
    animation: "healingPulse 5s ease-in-out infinite",
    zIndex: 0,
    opacity: 0.8,
  },

  swamikiImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    filter: "drop-shadow(0 0 35px rgba(255, 215, 0, 0.4)) brightness(1.1) contrast(1.05) saturate(1.15)",
    zIndex: 2,
    position: "relative",
    maskImage: "radial-gradient(ellipse 100% 80% at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0) 100%)",
    WebkitMaskImage: "radial-gradient(ellipse 100% 80% at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0) 100%)",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "25px",
    zIndex: 10,
    padding: "12px 20px 8px 20px",
    flexWrap: "wrap",
  },

  footerLink: {
    color: "#ffd700",
    fontSize: "12px",
    textDecoration: "none",
    fontFamily: "'Philosopher', serif",
    fontWeight: "bold",
    padding: "6px 10px",
    border: "1px solid #ffd700",
    borderRadius: "4px",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
};


/* 🌍 CONTINENT CENTER */
function getContinentCenter(continent) {
  switch (continent) {
    case "Asia":
      return { lat: 34, lng: 100 };
    case "Europe":
      return { lat: 54, lng: 15 };
    case "Africa":
      return { lat: 0, lng: 20 };
    case "North America":
      return { lat: 40, lng: -100 };
    case "South America":
      return { lat: -15, lng: -60 };
    case "Australia":
      return { lat: -25, lng: 135 };
    default:
      return { lat: 20, lng: 0 };
  }
}






