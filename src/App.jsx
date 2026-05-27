import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, supabaseError, supabaseUrl, supabaseKeySet } from "./supabaseClient";

// Lazy load the Globe to reduce initial bundle size
const Globe = lazy(() => import("react-globe.gl"));

import InfoModal from "./InfoModal";

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

const triviaItems = [
  {
    question: "What inspired Sri Datta Swamiji to develop the concept of Music for Healing and Meditation?",
    insight: `During 1980–1981, Sri Datta Swamiji began exploring and presenting celestial music whose vibrations were believed to aid healing. He dedicated 18 years to researching the therapeutic effects of sound and music. His mother and Guru, Sri Jayalakshmi Mata, taught Him how musical vibrations positively influenced nature — helping crops grow better, cows produce more milk, and flowers bloom beautifully. She blessed Him with the mission of sharing this divine music for the welfare of humanity. Inspired by this vision, Sri Datta Swamiji undertook the task of helping people suffering from chronic illnesses who relied solely on medication, by introducing music as a means to support and accelerate the healing process. Thus, “Music for Healing & Meditation” is not a musical concert, but a spiritual and therapeutic experience where celestial sounds (Nada) are used to promote healing and inner well-being.`,
  },
  {
    question: "What is Nada Chikitsa and Music Therapy, and why does Sri Datta Swamiji incorporate crystals and mudras into the sessions?",
    insight: `Music resonates through pure crystals, through Akasha (space), through colours, earth, and water. That is why Sri Datta Swamiji says, “After music, drink water.” Music responds to the Panchabhutas — the five elements — and these vibrations also exist within the human body, which itself is made of these elements: water, fire, earth, air, and space. When music is combined with crystals, especially pure and clear crystals symbolizing purity like Lord Shiva, it helps channel these vibrations more effectively. Mudras also play an important role by helping people focus and concentrate. When attention is centered on the crystal and the music, the healing vibrations can deeply reach the body and nervous system.`,
  },
  {
    question: "What is Raga Ragini Vidya?",
    insight: `The science of Raga and Ragini has emerged from the Vedas. It is a vast and profound subject, not something that can be explained in just a few minutes. Entire scriptures and books have been written on it. Sri Datta Swamiji Himself conducted extensive research and authored a book on this subject. By studying it, one can understand what Raga Ragini Vidya truly is, how it contributes to physical and mental well-being, and how it can be practiced. This knowledge is ancient and rooted in traditional wisdom. It does not belong to just one era, but has existed since the times of the Treta and Dwapara Yugas. It is deeply connected with the science of sound — the true nature of vibration and Nada (sacred sound) — as well as the principles of sound-based pranayama. The entire nervous system is linked through prana, the life force. Through this pranic energy, sound vibrations travel within the nerve channels. These sound waves carry messages throughout the body. Different types of sounds create different effects within the human system. Some nerves become inactive or “dead,” while others remain active and connected. Through pranic sound vibrations, these inactive nerves can be stimulated and revitalized. However, only those who deeply understand life energy and sound can truly comprehend this subtle science.`,
  },
  {
    question: "How does Sri Datta Swamiji conduct a Music for Healing & Meditation session?",
    insight: `When Sri Datta Swamiji offers music to people, He carefully calculates and aligns the rhythm, melodies, vibrations, and the needs of the individuals listening — especially those suffering from illness. Sri Datta Swamiji first prepares and tunes Himself inwardly before bringing everything together through music. It involves immense effort and dedication. On nights before such musical offerings, Sri Datta Swamiji often remains awake, fully immersed in receiving countless vibrations and inspirations. His role is to channel these vibrations in a positive and beneficial way. At the same time, Sri Datta Swamiji guides the musicians, the audience, and Himself, while ultimately allowing the music itself to guide everything. This music does not belong to Him; it is entirely the grace of the Almighty. It is through God’s blessing that this music manifests.`,
  },
  {
    question: "How can one learn more about Music for Healing and Meditation by H.H. Dr. Sri Ganapathy Sachchidananda Swamiji?",
    insight: `Please refer to the Quick Links section on the main page to explore relevant resources available online. You may also obtain a copy of the book Raga Ragini Nada Yoga, available in both English and Telugu. The links are provided below.`,
  },
  {
    question: "How can one purchase Sri Datta Swamiji’s Music for Healing and Meditation, and how can one attend a session?",
    insight: `HH Dr. Sri Ganapathy Sachchidananda Swamiji’s music is available on iMusic, Amazon Music, Spotify, YouTube and other platforms for listening. One can explore albums to purchase on https://ragaraginistore.com/. To attend a Music for Healing and Meditation session by H.H. Dr. Sri Ganapathy Sachchidananda Swamiji, please refer to HH Dr. Sri Ganapathy Sachchidananda Swamiji’s calendar on www.dattapeetham.org to stay updated on upcoming sessions.`,
  },
];

export default function App({ leftLogoUrl = "https://i.imgur.com/lPDE0zB.jpeg", rightLogoUrl = "https://i.imgur.com/opWvuCC.jpeg" }) {
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
  const [activeInfoModal, setActiveInfoModal] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
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

  // Mock data fallback
  const getMockData = () => {
    return [
      {
        no: 1,
        eventNumber: 1,
        eventName: "Raga Sagara - Opening Ceremony",
        continent: "Asia",
        lat: 28.6139,
        lng: 77.2090,
        date: "2025-01-15",
        year: 2025,
        location: "Delhi, India",
        place: "Rashtrapati Bhavan",
        description: "Grand opening ceremony celebrating classical Indian music",
        images: ["https://i.imgur.com/lPDE0zB.jpeg"],
        audioUrl: "",
        raga: "Bhairav",
        city: "Delhi",
        country: "India",
      },
      {
        no: 2,
        eventNumber: 2,
        eventName: "European Classical Concert",
        continent: "Europe",
        lat: 48.8566,
        lng: 2.3522,
        date: "2025-02-20",
        year: 2025,
        location: "Paris, France",
        place: "Palais Garnier",
        description: "International fusion of Indian and Western classical music",
        images: ["https://i.imgur.com/opWvuCC.jpeg"],
        audioUrl: "",
        raga: "Yaman",
        city: "Paris",
        country: "France",
      },
      {
        no: 3,
        eventNumber: 3,
        eventName: "African Rhythms Festival",
        continent: "Africa",
        lat: -33.9249,
        lng: 18.4241,
        date: "2025-03-10",
        year: 2025,
        location: "Cape Town, South Africa",
        place: "Artscape Theatre",
        description: "Celebration of African percussion and classical Indian ragas",
        images: [],
        audioUrl: "",
        raga: "Ahir Bhairav",
        city: "Cape Town",
        country: "South Africa",
      },
      {
        no: 4,
        eventNumber: 4,
        eventName: "Americas Tour",
        continent: "North America",
        lat: 40.7128,
        lng: -74.0060,
        date: "2025-04-05",
        year: 2025,
        location: "New York, USA",
        place: "Carnegie Hall",
        description: "Classical Indian music concert series",
        images: [],
        audioUrl: "",
        raga: "Tilak Kamod",
        city: "New York",
        country: "United States",
      },
    ];
  };

  const fetchEvents = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase not configured, loading mock data");
      setEvents(getMockData());
      setLoading(false);
      setAppError(null);
      return;
    }

    const tryTableNames = async (tableNames, tableType) => {
      for (const tableName of tableNames) {
        try {
          const { data, error } = await supabase.from(tableName).select("*");
          if (!error && data) {
            console.log(`Found ${tableType} table: ${tableName}`);
            return { data, tableName };
          }

          const message = error?.message || "";
          if (
            message.includes("Could not find the table") ||
            message.includes("does not exist") ||
            message.includes("No table found") ||
            message.includes("schema cache")
          ) {
            console.warn(`Table not found: ${tableName}`, error);
            continue;
          }

          return { error, tableName };
        } catch (err) {
          console.warn(`Error trying table ${tableName}:`, err);
          continue;
        }
      }

      return {
        error: new Error(
          `Could not find any ${tableType} table. Tried: ${tableNames.join(", ")}`
        ),
      };
    };

    try {
      setLoading(true);
      console.log("Fetching events from Supabase...");

      const eventTableCandidates = [
        "Events",
        "events_365",
        "events365",
        "events",
        "concerts",
      ];
      const mediaTableCandidates = [
        "events365_media",
        "events_365_media",
        "events_media",
        "media",
      ];

      const { data: eventsData, error: eventsError } =
        await tryTableNames(eventTableCandidates, "events");

      if (eventsError || !eventsData || eventsData.length === 0) {
        console.warn("Could not load events from Supabase, using mock data");
        setEvents(getMockData());
        setLoading(false);
        setAppError(null);
        return;
      }

      console.log(`Loaded ${eventsData?.length || 0} events from Supabase`);

      const { data: mediaData } =
        await tryTableNames(mediaTableCandidates, "media");

      const mediaDataOrEmpty = mediaData || [];
      console.log(`Loaded ${mediaDataOrEmpty?.length || 0} media records`);

      const mapped = eventsData.map((row) => {
        // Parse date - handle various formats
        let dateValue = null;
        if (row.Date) {
          dateValue = new Date(row.Date);
          // If invalid, try parsing manually for formats like "27-Oct-1990"
          if (isNaN(dateValue.getTime())) {
            dateValue = new Date(row.Date.replace('-', ' '));
          }
        }
        const yearValue = dateValue && !isNaN(dateValue.getTime()) ? dateValue.getFullYear() : null;

        return {
          no: row.No != null ? Number(row.No) : null,
          eventNumber: row.No != null ? Number(row.No) : null,
          eventName: getField(row, [
            "Raga Sagara Name (Event)",
            "raga_sagara_name_event",
            "event_name",
            "eventname",
          ]) || null,
          continent: row.Continent,
          lat: (() => {
            const val = parseFloat(row.Latitude);
            return !isNaN(val) ? val : null;
          })(),
          lng: (() => {
            const val = parseFloat(row.Longitude);
            return !isNaN(val) ? val : null;
          })(),
          date: row.Date,
          year: yearValue,
          location: row.City || row.Country,
          place: row.Venue,
          description: getField(row, ["Description", "description", "details", "event_description"]),
          images: mediaDataOrEmpty.filter((m) => m.Event === row.No).map((m) => m.URL),
          audioUrl: getField(row, [
            "Audio/Video Link",
            "link_for_audio_or_video",
            "audio",
            "audio_url",
            "media_url",
          ]) || "",
          raga: getField(row, [
            "Healing Ragas",
            "Healing_ragas",
            "healing_ragas",
            "main_raga",
            "raga",
            "main_raga_name",
          ]) || null,
          city: row.City,
          country: row.Country,
        };
      });

      setEvents(mapped);
      setLoading(false);
      setAppError(null);
    } catch (error) {
      console.error("Error fetching events:", error);
      console.warn("Falling back to mock data");
      setEvents(getMockData());
      setLoading(false);
      setAppError(null);
    }
  }, [supabase]);

  // Fetch events once on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(
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
      setFilteredCountries(allCountries);
      setShowCountrySuggestions(true);
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
    setActiveInfoModal(null);
    setShowMenu(false);
  }, []);

  const openInfoModal = useCallback((modalKey) => {
    setActiveInfoModal(modalKey);
    setShowMenu(false);
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
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: "600px" }}>
          <h1>⚠️ Unable to load the app</h1>
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>{appError}</p>
          
          <div style={{
            background: "#111",
            color: "#ffd700",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "20px",
            textAlign: "left",
            fontSize: "13px",
          }}>
            <h3 style={{ margin: "0 0 10px 0" }}>Troubleshooting:</h3>
            <ul style={{ margin: "0", paddingLeft: "20px" }}>
              <li>Check that .env file exists in the project root</li>
              <li>Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set</li>
              <li>Check your internet connection</li>
              <li>Ensure Supabase service is running</li>
              <li>Check browser console for more details (F12)</li>
            </ul>
          </div>

          <div style={{
            background: "#111",
            color: "#fff",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "20px",
            textAlign: "left",
            fontSize: "12px",
          }}>
            <p style={{ margin: "0 0 8px 0" }}><strong>Config check:</strong></p>
            <p style={{ margin: "0 0 4px 0" }}>
              Supabase URL: {supabaseUrl ? <span style={{ color: "#0f0" }}>{supabaseUrl}</span> : <span style={{ color: "#f00" }}>not set</span>}
            </p>
            <p style={{ margin: "0" }}>
              Supabase key: {supabaseKeySet ? <span style={{ color: "#0f0" }}>set</span> : <span style={{ color: "#f00" }}>missing</span>}
            </p>
          </div>

          <p style={{ fontSize: "12px", marginBottom: "20px" }}>
            Create or update a <code style={{ background: "#222", padding: "2px 6px", borderRadius: "3px" }}>.env</code> file in the project root using your own Supabase project values:
          </p>
          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "20px",
              textAlign: "left",
              fontSize: "12px",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
            <br />
            VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
          </pre>

          <button
            onClick={() => {
              setAppError(null);
              fetchEvents();
            }}
            style={{
              background: "#ffd700",
              color: "#000",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            🔄 Retry
          </button>
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

        html {
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          box-sizing: border-box;
        }

        body {
          font-family: 'Philosopher', serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          position: relative;
          background: #000;
          overflow-x: hidden;
          overflow-y: auto;
          box-sizing: border-box;
        }

        *, *::before, *::after {
          box-sizing: inherit;
        }

        #root, #app {
          width: 100%;
          min-height: 100%;
          max-width: 100%;
          overflow-x: hidden;
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
          html, body, #root, #app {
            min-height: 100svh;
            height: auto !important;
            overflow-x: hidden;
          }

          body {
            padding: 0;
            margin: 0;
          }

          #app {
            min-height: 100svh;
            max-width: 100%;
            overflow-x: hidden;
          }

          button[data-mobile-menu-button] {
            display: block !important;
          }

          div[data-mobile-overlay] {
            display: block !important;
          }
        }

        @media (min-width: 1025px) {
          button[data-mobile-menu-button], div[data-mobile-overlay] {
            display: none !important;
          }
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
          background: transparent;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.28);
        }
      `}</style>

      {/* 🌌 STARS */}
      <div style={styles.stars}></div>
      <div style={styles.stars2}></div>
      <div style={styles.stars3}></div>


      {/* ✨ TITLE + LOGOS */}
      <div style={styles.titleRow}>
        {leftLogoUrl && (
          <img
            src={leftLogoUrl}
            alt="Left Logo"
            style={styles.titleLogo}
            data-logo-left
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}

        <div style={styles.title} data-title>
          SGS Raga Ragini Atlas
        </div>

        {rightLogoUrl && (
          <img
            src={rightLogoUrl}
            alt="Right Logo"
            style={styles.titleLogo}
            data-logo-right
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
      </div>


      {/* 🌍 GLOBE */}
      <Globe
        ref={globeRef}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          pointerEvents: activeInfoModal || showMenu || selectedEvent ? "none" : "auto",
          opacity: activeInfoModal || selectedEvent ? 0.6 : 1,
        }}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        pointsData={filteredEvents}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.02}
        pointRadius={0.5}
        pointColor={() => "#ffcc00"}
        pointResolution={4}
        pointLabel={(point) =>
          `<div style="background: rgba(0,0,0,0.95); padding: 12px 16px; border-radius: 10px; color: #ffd700; font-size: 14px; font-family: Philosopher, serif; white-space: normal; max-width: 240px; word-wrap: break-word; overflow-wrap: anywhere; border: 2px solid #ffd700; box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);">
            <div style="font-weight: bold; margin-bottom: 4px;">${point.eventName}</div>
            <div style="font-size: 12px; color: #fff; margin-bottom: 2px;">📍 ${point.place || point.location || 'Venue'}</div>
            <div style="font-size: 12px; color: #fff;">📌 ${point.city || 'City'}</div>
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

      {/* ☰ TOP LEFT MENU */}
      <button
        type="button"
        style={styles.menuButton}
        aria-expanded={showMenu}
        aria-label={showMenu ? "Close menu" : "Open menu"}
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu((current) => !current);
        }}
      >
        {showMenu ? "✕" : "☰"}
      </button>

      {showMenu && <div style={styles.menuBackdrop} onClick={() => setShowMenu(false)} />}

      {showMenu && (
        <div 
          style={styles.filterStack}
          data-filter-stack="desktop"
          onClick={(e) => e.stopPropagation()}
        >
        <div style={styles.filterPanelHeader}>
          <div>
            <div style={styles.menuSectionLabel}>Menu</div>
            <div style={styles.menuHelpText}>Open a modal to view About, Trivia, Quick Links, or App Demo.</div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setShowMenu(false)}
              style={styles.panelIconButton}
              aria-label="Close menu"
              title="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        <div style={styles.infoMenuInline}>
          <button style={styles.infoMenuItem} onClick={() => openInfoModal("about")}>About</button>
          <button style={styles.infoMenuItem} onClick={() => openInfoModal("trivia")}>Trivia</button>
          <button style={styles.infoMenuItem} onClick={() => openInfoModal("quick-links")}>Quick Links</button>
          <button style={styles.infoMenuItem} onClick={() => openInfoModal("app-demo")}>App Demo</button>
        </div>
        </div>
      )}

      <div style={{
          ...styles.filterPanel,
          top: showMenu
            ? "calc(clamp(80px, 10vh, 100px) + 420px)"
            : "calc(clamp(80px, 10vh, 100px) + 240px)",
        }}>
        <div style={styles.filterPanelHeader}>
          <div>
            <div style={styles.menuSectionLabel}>Filters</div>
            <div style={styles.menuHelpText}>Filter events by year, number, country or name.</div>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            style={styles.clearIconButton}
            aria-label="Clear filters"
            title="Clear filters"
          >
            🧹
          </button>
        </div>

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

        <div style={styles.filterRow}>
          <label style={styles.label}>Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: "clamp(6px, 0.9vw, 9px) clamp(8px, 1.2vw, 10px)",
              fontSize: "clamp(9px, 1vw, 11px)",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#fff",
              color: selectedYear ? "#000" : "#999",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
              touchAction: "manipulation",
              cursor: "pointer",
              fontFamily: "'Philosopher', serif",
              fontWeight: "500",
            }}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

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
      </div>


      {/* 🌍 CONTINENT FILTER - BOTTOM */}
      <div style={styles.continentFilter} data-continent-filter>
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
            data-continent-button
          >
            {continent}
          </button>
        ))}
      </div>

      {/*  MODAL */}
      <InfoModal
        title="About"
        isOpen={activeInfoModal === "about"}
        onClose={() => setActiveInfoModal(null)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
            The SGS Raga Ragini Atlas is an interactive globe that presents Music for Healing & Meditation events led by His Holiness Dr. Sri Ganapathy Sachchidananda Swamiji. Users can filter events by name, location, continent, or event number and explore photographs, artist details, ragas performed, and audio/video clips that recreate the experience.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
            This archive brings together available Raga Sagara resources from 1987 to the present, honoring the 28th Anniversary of the Nada Mantapam and the 365th Raga Sagara event held at Indraprastha in 2026. It is offered with humility and devotion to Pujya Datta Swamiji to preserve every precious gem of Raga Sagara for future generations.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
            We are deeply grateful to Sri Datta Swamiji, Sri Balaswamiji, and the extended Datta Peetham team for their guidance, grace, support, and technical assistance. For feedback or contributions, contact 365concertsgs@gmail.com.
          </p>
        </div>
      </InfoModal>

      <InfoModal
        title="Trivia"
        isOpen={activeInfoModal === "trivia"}
        onClose={() => setActiveInfoModal(null)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {triviaItems.map((item, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#ffd700", margin: 0, lineHeight: 1.3 }}>
                {item.question}
              </h4>
              <div style={{ fontSize: "11px", color: "rgba(255, 215, 0, 0.8)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "600" }}>
                Insight
              </div>
              <p style={{ fontSize: "14px", color: "#f7f2e7", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>
                {item.insight}
              </p>
            </div>
          ))}
        </div>
      </InfoModal>

      <InfoModal
        title="Quick Links"
        isOpen={activeInfoModal === "quick-links"}
        onClose={() => setActiveInfoModal(null)}
      >
        <div style={styles.quickLinksList}>
          <a href="https://www.dattapeetham.org/" target="_blank" rel="noreferrer" style={styles.quickLinkItem}>
            <span style={styles.quickLinkIcon}>🕉️</span>
            Datta Peetam Official
          </a>
          <a href="https://www.yogasangeeta.org/" target="_blank" rel="noreferrer" style={styles.quickLinkItem}>
            <span style={styles.quickLinkIcon}>🎶</span>
            YogaSangeeta
          </a>
          <a href="https://youtu.be/gwraGV4o4VY?si=hqO-Gc9U7r8fMmjY" target="_blank" rel="noreferrer" style={styles.quickLinkItem}>
            <span style={styles.quickLinkIcon}>🎥</span>
            Raga Ragini Vidya - Documentary
          </a>
          <a href="https://www.sgsragasagara.com/" target="_blank" rel="noreferrer" style={styles.quickLinkItem}>
            <span style={styles.quickLinkIcon}>🌐</span>
            SGS Raga Sagara
          </a>
        </div>
      </InfoModal>

      <InfoModal
        title="App Demo"
        isOpen={activeInfoModal === "app-demo"}
        onClose={() => setActiveInfoModal(null)}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "14px" }}>
            A demo video will be available here soon, showcasing how to navigate and use this interactive globe application.
          </div>
        </div>
      </InfoModal>

      {/*  EVENT MODAL */}
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
    width: "100%",
    minHeight: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    maxWidth: "100%",
    background:
      "radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)",
  },


  logoTopLeft: {
    position: "absolute",
    top: "clamp(10px, 2vh, 30px)",
    left: "clamp(10px, 2vw, 30px)",
    height: "clamp(50px, 10vh, 100px)",
    width: "auto",
    zIndex: 18,
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
    zIndex: 18,
    background: "transparent",
    filter: "drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))",
    objectFit: "contain",
  },


  title: {
    color: "#00ff00",
    fontSize: "clamp(14px, 2.5vw, 20px)",
    fontFamily: "'Philosopher', serif",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    textShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
  },

  titleRow: {
    position: "absolute",
    top: "clamp(20px, 4vh, 28px)",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "clamp(10px, 2vw, 14px)",
    zIndex: 19,
    maxWidth: "min(90vw, 760px)",
    padding: "0 clamp(16px, 4vw, 24px)",
  },

  titleLogo: {
    height: "clamp(40px, 9vh, 70px)",
    width: "auto",
    maxWidth: "clamp(70px, 8vw, 120px)",
    objectFit: "contain",
    filter: "drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))",
  },

  infoButton: {
    position: "absolute",
    top: "clamp(15px, 3vh, 25px)",
    left: "clamp(15px, 3vw, 25px)",
    zIndex: 21,
    background: "rgba(0, 0, 0, 0.55)",
    border: "1px solid rgba(255, 255, 255, 0.32)",
    color: "#ffd700",
    borderRadius: "14px",
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1.2rem",
    boxShadow: "0 0 18px rgba(0,0,0,0.3)",
  },

  infoButtonIcon: {
    display: "block",
    lineHeight: 1,
    fontSize: "1.5rem",
  },

  menuButton: {
    position: "fixed",
    top: "clamp(15px, 3vh, 25px)",
    left: "clamp(15px, 3vw, 25px)",
    zIndex: 21,
    background: "rgba(0, 0, 0, 0.7)",
    border: "1px solid rgba(255, 215, 0, 0.3)",
    color: "#ffd700",
    borderRadius: "12px",
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1.8rem",
    fontWeight: "bold",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
    transition: "all 0.2s ease",
  },

  menuBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.4)",
    zIndex: 35,
    backdropFilter: "blur(2px)",
  },

  filterStack: {
    position: "fixed",
    top: "clamp(80px, 10vh, 100px)",
    left: "clamp(15px, 3vw, 25px)",
    maxWidth: "clamp(260px, 20vw, 340px)",
    maxHeight: "calc(100vh - 200px)",
    overflowY: "auto",
    background: "rgba(0, 0, 0, 0.92)",
    border: "1px solid rgba(255, 215, 0, 0.2)",
    borderRadius: "16px",
    padding: "16px 12px",
    zIndex: 36,
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.6)",
    WebkitOverflowScrolling: "touch",
  },

  filterPanel: {
    position: "fixed",
    top: "calc(clamp(80px, 10vh, 100px) + 280px)",
    left: "clamp(15px, 3vw, 25px)",
    width: "clamp(260px, 22vw, 340px)",
    maxHeight: "calc(100vh - 180px)",
    overflowY: "auto",
    background: "rgba(0, 0, 0, 0.92)",
    border: "1px solid rgba(255, 215, 0, 0.2)",
    borderRadius: "16px",
    padding: "16px 14px",
    zIndex: 36,
    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.6)",
    WebkitOverflowScrolling: "touch",
  },

  filterPanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(255, 215, 0, 0.15)",
  },

  menuSectionLabel: {
    color: "#ffd700",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "4px",
  },

  menuHelpText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "11px",
    lineHeight: 1.4,
  },

  panelIconButton: {
    border: "none",
    background: "rgba(255, 215, 0, 0.1)",
    color: "#ffd700",
    borderRadius: "10px",
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    minWidth: "40px",
    lineHeight: 1,
    transition: "all 0.2s ease",
  },

  clearIconButton: {
    border: "none",
    background: "rgba(255, 215, 0, 0.1)",
    color: "#ffd700",
    borderRadius: "10px",
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    minWidth: "40px",
    lineHeight: 1,
    transition: "all 0.2s ease",
  },

  infoMenu: {
    position: "absolute",
    top: "clamp(70px, 6vh, 80px)",
    right: "clamp(15px, 3vw, 25px)",
    zIndex: 22,
    background: "rgba(0, 0, 0, 0.96)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    padding: "10px",
    borderRadius: "16px",
    boxShadow: "0 16px 30px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "180px",
  },

  infoMenuInline: {
    position: "relative",
    zIndex: 20,
    background: "rgba(0, 0, 0, 0.75)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    padding: "10px",
    borderRadius: "14px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    marginTop: "8px",
  },

  infoMenuItem: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    border: "none",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
    fontFamily: "'Philosopher', serif",
    fontSize: "clamp(10px, 1vw, 12px)",
    transition: "background 0.2s ease",
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

  panelIconButtonMobile: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    border: "none",
    background: "#000",
    color: "#ffd700",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    fontSize: "1.2rem",
    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
  },

  filterPanelHeaderMobile: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  },

  infoSelector: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  infoSelectorMobile: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  infoDropdown: {
    width: "100%",
    borderRadius: "8px",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    background: "#fff",
    color: "#000",
    padding: "10px 12px",
    fontSize: "clamp(10px, 1vw, 12px)",
    outline: "none",
    cursor: "pointer",
    fontFamily: "'Philosopher', serif",
    fontWeight: 500,
  },

  infoPanel: {
    background: "rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "10px",
    padding: "12px",
    maxHeight: "32vh",
    overflowY: "auto",
    lineHeight: 1.5,
  },

  infoPanelTitle: {
    color: "#000",
    fontSize: "clamp(11px, 1vw, 13px)",
    fontWeight: "bold",
    marginBottom: "8px",
  },

  infoPanelText: {
    color: "#000",
    fontSize: "clamp(10px, 1vw, 12px)",
    margin: 0,
    marginBottom: "10px",
  },

  infoPanelTextBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  aboutOpenButton: {
    marginTop: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#000",
    color: "#ffd700",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: "'Philosopher', serif",
  },

  quickLinksList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  quickLinkItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "12px",
    backgroundColor: "#000",
    color: "#ffd700",
    textDecoration: "none",
    fontSize: "clamp(11px, 1vw, 13px)",
    fontWeight: "700",
    border: "1px solid rgba(255,215,0,0.35)",
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
  },

  quickLinkIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.08)",
    fontSize: "1rem",
  },

  infoLink: {
    display: "block",
    color: "#000",
    textDecoration: "underline",
    wordBreak: "break-all",
    fontSize: "clamp(10px, 1vw, 12px)",
  },

  demoPlaceholder: {
    minHeight: "110px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    border: "1px dashed rgba(0,0,0,0.25)",
    padding: "16px",
    background: "rgba(255,255,255,0.6)",
  },

  demoPlaceholderText: {
    color: "#000",
    fontSize: "clamp(10px, 1vw, 12px)",
    textAlign: "center",
    fontWeight: "600",
  },

  filterStackMobile: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    maxHeight: "80vh",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    zIndex: 1000,
    backgroundColor: "#ffcc00",
    padding: "clamp(15px, 4vw, 20px)",
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
    boxShadow: "0 -8px 16px rgba(0,0,0,0.3)",
    fontSize: "clamp(11px, 1.5vw, 14px)",
    touchAction: "manipulation",
  },

  mobileMenuButton: {
    display: "block",
    position: "fixed",
    top: "clamp(15px, 3vh, 20px)",
    right: "clamp(15px, 3vw, 20px)",
    left: "auto",
    zIndex: 51,
    background: "#ffcc00",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "clamp(8px, 2vw, 12px)",
    fontSize: "clamp(14px, 2vw, 18px)",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    touchAction: "manipulation",
    width: "auto",
    height: "auto",
  },

  mobileMenuOverlay: {
    display: "block",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    zIndex: 900,
    touchAction: "manipulation",
  },

  filterRow: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  label: {
    color: "#000",
    fontSize: "clamp(8px, 0.9vw, 10px)",
    fontFamily: "'Philosopher', serif",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  mediaLinksSection: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    paddingTop: "4px",
    borderTop: "1px solid rgba(0, 0, 0, 0.1)",
    marginTop: "4px",
  },

  mediaLinksLabel: {
    color: "#000",
    fontSize: "clamp(8px, 0.9vw, 10px)",
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
    gap: "4px",
    padding: "clamp(3px, 0.7vw, 6px) clamp(4px, 1vw, 8px)",
    backgroundColor: "#000",
    color: "#ffd700",
    textDecoration: "none",
    borderRadius: "4px",
    fontSize: "clamp(8px, 0.9vw, 10px)",
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
    padding: "clamp(4px, 0.7vw, 8px) clamp(6px, 1vw, 10px)",
    fontSize: "clamp(9px, 1vw, 11px)",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#000",
    outline: "none",
    cursor: "pointer",
    touchAction: "manipulation",
  },

  textInput: {
    padding: "clamp(6px, 0.9vw, 9px) clamp(8px, 1.2vw, 10px)",
    fontSize: "clamp(9px, 1vw, 11px)",
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
    width: "clamp(60px, 12vw, 90px)",
    minWidth: "60px",
    padding: "clamp(4px, 0.7vw, 6px) clamp(6px, 1vw, 8px)",
    fontSize: "clamp(9px, 1vw, 10px)",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#000",
    outline: "none",
    touchAction: "manipulation",
  },

  clearButton: {
    padding: "clamp(6px, 1vw, 10px) clamp(8px, 1.5vw, 12px)",
    fontSize: "clamp(9px, 1vw, 11px)",
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
    padding: "clamp(4px, 0.7vw, 8px) clamp(6px, 1vw, 10px)",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    fontSize: "clamp(9px, 1vw, 11px)",
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
    zIndex: 19,
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









