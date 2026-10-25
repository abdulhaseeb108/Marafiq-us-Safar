import { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import SiteHeader from "./components/SiteHeader.jsx";
import HomePage from "./components/HomePage.jsx";
import ComingSoonPage from "./components/ComingSoonPage.jsx";
import UmrahWizard from "./components/UmrahWizard.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";
import { LeadForm, RequestConfirmation } from "./components/LeadForm.jsx";
import {
  API, EMPTY_HOTELS, FIRST_DAY, JSON_H, LAST_DAY, ROOM_NAME, ROUTES, TRANSPORTS, WHATSAPP_NUMBER,
} from "./data/calculator.jsx";
import { APP_PATHS, resolvePage } from "./routes.js";
import { allocateRoomBeds, fmt, planStays, plural, showDate, validDate } from "./utils/travel.js";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = resolvePage(location.pathname);
  const mode = page === "umrah" || page === "calculator"
    ? "umrah"
    : page === "home"
      ? null
      : "other";
  const [bookingDays, setBookingDays] = useState(10);
  const [bookingPassengers, setBookingPassengers] = useState(1);
  const [bookingRoom, setBookingRoom] = useState("");
  const [bookingDeparture, setBookingDeparture] = useState("");
  const [customDeparture, setCustomDeparture] = useState("");
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [hotelLoad, setHotelLoad] = useState({ key: "", status: "idle", hotels: EMPTY_HOTELS });
  const [form, setForm] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    infantBed: "",
    roomType: null,
    primaryRoomCount: 1,
    additionalRoomType: 4,
    startDate: "",
    departureCity: "",
    transport: "bus",
    route: "",
    customRoute: "",
    makkahNights: 4,
    madinahNights: 3,
    makkahHotelId: "",
    madinahHotelId: "",
    ziyarat: [],
  });
  const [estimate, setEstimate] = useState({ key: "", result: null, error: "" });
  const [lead, setLead] = useState({ name: "", phone: "", note: "", consent: false });
  const [sent, setSent] = useState(null);
  const [leadError, setLeadError] = useState("");
  const [sending, setSending] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [sumOpen, setSumOpen] = useState(false);

  const headingRef = useRef(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, mode, location.pathname]);

  // Route changes clear stale confirmation state and reset the Umrah wizard when entered.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setSent(null);
    setLeadError("");
    if (page === "umrah" || page === "calculator") {
      setStep(0);
      setShowErrors(false);
      setSumOpen(false);
    }
  }, [page]);

  useEffect(() => {
    const pageTitles = {
      home: "Marafiq us Safar | Your Journey Partner",
      umrah: "Umrah Packages | Marafiq us Safar",
      calculator: "Umrah Package Calculator | Marafiq us Safar",
      hajj: "Hajj Journeys Coming Soon | Marafiq us Safar",
      tours: "Guided Tours Coming Soon | Marafiq us Safar",
      flights: "Flight Bookings Coming Soon | Marafiq us Safar",
      visa: "Visa Assistance Coming Soon | Marafiq us Safar",
      "not-found": "Page Not Found | Marafiq us Safar",
    };
    document.title = pageTitles[page] || pageTitles["not-found"];
  }, [page]);

  const updateForm = (patch) => {
    setSent(null);
    setForm((current) => {
      const next = { ...current, ...patch };
      if (next.infants === 0 && next.children === 0) next.infantBed = "";
      const roomType = Number(next.roomType);
      const roomOccupants = next.adults + next.children + (next.infantBed === "required" ? next.infants : 0);
      if ([2, 3, 4].includes(roomType)) {
        const maxPrimaryRooms = Math.max(1, Math.floor(roomOccupants / roomType));
        next.primaryRoomCount = Math.min(Math.max(1, next.primaryRoomCount), maxPrimaryRooms);
      }
      return next;
    });
  };
  const plan = validDate(form.startDate) ? planStays(form) : null;
  const inRange = validDate(form.startDate) && form.startDate >= FIRST_DAY && form.startDate <= LAST_DAY;
  const makkahIn = plan?.stays.makkah.checkIn;
  const madinahIn = plan?.stays.madinah.checkIn;
  const hotelRequestKey = mode === "umrah" && inRange && makkahIn && madinahIn
    ? `${makkahIn}|${madinahIn}`
    : "";
  const hotels = hotelLoad.key === hotelRequestKey && hotelRequestKey
    ? hotelLoad.hotels
    : EMPTY_HOTELS;
  const hotelStatus = !hotelRequestKey
    ? "idle"
    : hotelLoad.key === hotelRequestKey
      ? hotelLoad.status
      : "loading";

  useEffect(() => {
    if (!hotelRequestKey) return undefined;
    let cancelled = false;
    Promise.all([
      fetch(`${API}/api/hotels?city=makkah&date=${makkahIn}`).then((response) => {
        if (!response.ok) throw new Error("Could not load Makkah hotels.");
        return response.json();
      }),
      fetch(`${API}/api/hotels?city=madinah&date=${madinahIn}`).then((response) => {
        if (!response.ok) throw new Error("Could not load Madinah hotels.");
        return response.json();
      }),
    ])
      .then(([makkahHotels, madinahHotels]) => {
        if (cancelled) return;
        if (!Array.isArray(makkahHotels) || !Array.isArray(madinahHotels)) {
          throw new Error("Hotel response was invalid.");
        }
        setHotelLoad({
          key: hotelRequestKey,
          status: "ready",
          hotels: { makkah: makkahHotels, madinah: madinahHotels },
        });
        const isSelectable = (list, id) => list.some((hotel) =>
          hotel._id === id && !hotel.onRequest && !hotel.noRate);
        setForm((current) => ({
          ...current,
          makkahHotelId: isSelectable(makkahHotels, current.makkahHotelId) ? current.makkahHotelId : "",
          madinahHotelId: isSelectable(madinahHotels, current.madinahHotelId) ? current.madinahHotelId : "",
        }));
      })
      .catch(() => {
        if (!cancelled) setHotelLoad({ key: hotelRequestKey, status: "error", hotels: EMPTY_HOTELS });
      });
    return () => { cancelled = true; };
  }, [hotelRequestKey, makkahIn, madinahIn]);

  const roomOccupants = form.adults + form.children + (form.infantBed === "required" ? form.infants : 0);
  const quoteReasons = [
    form.roomType === 5 && "Quint supplier rates have not been added yet.",
    form.infants > 0 && form.infantBed === "required" && "An infant bed rate has not been added yet.",
    ["route3", "route4", "custom"].includes(form.route) &&
      "This itinerary needs a visit-by-visit hotel and transport quote from our team.",
  ].filter(Boolean);
  const quoteOnly = quoteReasons.length > 0;
  const roomAllocations = allocateRoomBeds(
    roomOccupants,
    form.roomType,
    form.primaryRoomCount,
    form.additionalRoomType,
    form.children > 2 ? 2 : 1
  );
  const canCalculate = mode === "umrah" && !quoteOnly && Boolean(
    plan && inRange && form.route && form.roomType && form.makkahHotelId && form.madinahHotelId &&
    form.infants <= form.adults
  );
  const estimatePayload = JSON.stringify({
    ...form,
    ...(form.roomType !== "sharing" ? { roomAllocations } : {}),
    preview: true,
  });
  const currentEstimate = canCalculate && estimate.key === estimatePayload ? estimate : null;
  const result = currentEstimate?.result ?? null;
  const calcError = currentEstimate?.error ?? "";
  const busy = canCalculate && !currentEstimate;

  useEffect(() => {
    if (!canCalculate) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API}/api/calculate`, {
          method: "POST",
          headers: JSON_H,
          body: estimatePayload,
        });
        const data = await response.json();
        if (cancelled) return;
        setEstimate({
          key: estimatePayload,
          result: response.ok ? data : null,
          error: response.ok ? "" : data.error || "Something went wrong",
        });
      } catch {
        if (!cancelled) {
          setEstimate({
            key: estimatePayload,
            result: null,
            error: "Cannot reach the server. Is it running?",
          });
        }
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [canCalculate, estimatePayload]);

  function stepErrors(index) {
    const errors = {};
    if (index === 0) {
      if (!Number.isInteger(form.adults) || form.adults < 1 || form.adults > 30) {
        errors.adults = "Enter between 1 and 30 adults.";
      }
      if (form.infants > form.adults) {
        errors.infants = "Each infant needs an adult. Reduce the infants or add an adult.";
      }
      if (!Number.isInteger(form.children) || form.children < 0 || form.children > 30) {
        errors.children = "Enter between 0 and 30 children.";
      }
      if ((form.infants > 0 || form.children > 0) && !form.infantBed) {
        errors.infantBed = "Choose whether infants and children need a separate mattress.";
      }
      if (!form.roomType) errors.roomType = "Select a room type to continue.";
      if (!validDate(form.startDate)) errors.date = "Choose your arrival date.";
      else if (!inRange) {
        errors.date = `We have supplier rates for nights from ${showDate(FIRST_DAY)} to ${showDate(LAST_DAY)}. Choose an arrival date in that range.`;
      }
    }
    if (index === 1 && !form.makkahHotelId) errors.hotel = "Select a hotel in Makkah to continue.";
    if (index === 2 && !form.madinahHotelId) errors.hotel = "Select a hotel in Madinah to continue.";
    if (index === 3) {
      if (!form.route) errors.route = "Choose a route to continue.";
      if (form.route === "custom" && !form.customRoute.trim()) {
        errors.customRoute = "Enter your preferred itinerary.";
      }
    }
    return errors;
  }
  const hasErrors = (index) => Object.keys(stepErrors(index)).length > 0;
  const canReach = (target) => {
    for (let index = 0; index < target; index += 1) {
      if (hasErrors(index)) return false;
    }
    return true;
  };
  const errors = showErrors ? stepErrors(step) : {};

  function next() {
    if (hasErrors(step)) {
      setShowErrors(true);
      return;
    }
    if (step === 4) {
      const incompleteStep = [1, 2].find(hasErrors);
      if (incompleteStep !== undefined) {
        setShowErrors(true);
        setStep(incompleteStep);
        return;
      }
    }
    setShowErrors(false);
    setStep((current) => Math.min(5, current + 1));
  }
  function back() {
    setShowErrors(false);
    setStep((current) => Math.max(0, current - 1));
  }
  function goToStep(index) {
    if (index <= step || canReach(index)) {
      setShowErrors(false);
      setStep(index);
    }
  }

  async function downloadPdf() {
    setPdfBusy(true);
    setPdfError("");
    try {
      const response = await fetch(`${API}/api/estimate-pdf`, {
        method: "POST",
        headers: JSON_H,
        body: JSON.stringify({ ...form, roomAllocations, routeText: route.text, referenceNo: sent }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not create the PDF.");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "umrah-estimate.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setPdfError(error.message === "Failed to fetch"
        ? "Cannot reach the server. Is it running?"
        : error.message);
    } finally {
      setPdfBusy(false);
    }
  }

  async function submitLead(event) {
    event.preventDefault();
    setLeadError("");
    if (mode !== "umrah") {
      setLeadError("Enquiries are currently available for Umrah packages only.");
      return;
    }
    setSending(true);
    try {
      let response;
      if (quoteOnly) {
        const note = [
          `Route: ${route.text}`,
          `Transport: ${transport.name}`,
          `Room preference: ${ROOM_NAME[form.roomType] || "Not selected"}`,
          form.children > 2 && "More than two children: an additional room is required.",
          roomAllocations.length > 0 && `Room allocation: ${roomAllocations.join(" + ")} bed(s) per room`,
          `Infant/child mattress: ${form.infants + form.children === 0 ? "Not applicable" : form.infantBed === "required" ? "Required" : form.infantBed === "none" ? "Not required" : "Preference not selected"}`,
          `Makkah: ${form.makkahNights} total night(s)${form.route === "route3" || form.route === "route4" ? "; nights per visit to be confirmed" : ""}`,
          `Madinah: ${form.madinahNights} night(s)`,
          `Ziyarat requested: ${form.ziyarat.length ? form.ziyarat.join(", ") : "None"}`,
          `Makkah hotel: ${nameOf("makkah") || "Not selected"}`,
          `Madinah hotel: ${nameOf("madinah") || "Not selected"}`,
          lead.note,
        ].filter(Boolean).join("\n");
        response = await fetch(`${API}/api/enquiries`, {
          method: "POST",
          headers: JSON_H,
          body: JSON.stringify({
            ...lead,
            destination: "Umrah package",
            tripType: "Umrah",
            adults: form.adults,
            children: form.children,
            infants: form.infants,
            startDate: form.startDate,
            nights: form.makkahNights + form.madinahNights,
            departureCity: form.departureCity,
            services: ["Hotels", "Visa assistance", "Ground transport"],
            route: form.route,
            routeText: route.text,
            customRoute: form.customRoute,
            routeSegments: ROUTES[form.route].order.map((city, index) => ({ city, visit: index + 1 })),
            transport: form.transport,
            roomType: form.roomType,
            roomAllocations,
            makkahNights: form.makkahNights,
            madinahNights: form.madinahNights,
            ziyarat: form.ziyarat,
            infantBed: form.infants > 0 || form.children > 0 ? form.infantBed : "none",
            note,
          }),
        });
      } else {
        const calculation = await fetch(`${API}/api/calculate`, {
          method: "POST",
          headers: JSON_H,
          body: JSON.stringify({
            ...form,
            ...(form.roomType !== "sharing" ? { roomAllocations } : {}),
          }),
        });
        const saved = await calculation.json();
        if (!calculation.ok) {
          setLeadError(saved.error || "Something went wrong");
          return;
        }
        response = await fetch(`${API}/api/leads`, {
          method: "POST",
          headers: JSON_H,
          body: JSON.stringify({ ...lead, snapshotId: saved.snapshotId }),
        });
      }
      const data = await response.json();
      if (!response.ok) {
        setLeadError(data.error || "Something went wrong");
        return;
      }
      setSent(data.referenceNo);
    } catch {
      setLeadError("Cannot reach the server. Is it running?");
    } finally {
      setSending(false);
    }
  }

  const nameOf = (city) => hotels[city].find((hotel) =>
    hotel._id === form[`${city}HotelId`])?.name;
  const transport = TRANSPORTS.find((item) => item.id === form.transport);
  const fxSarToPkr = result?.fxSarToPkr ||
    hotels.makkah[0]?.fxSarToPkr ||
    hotels.madinah[0]?.fxSarToPkr;
  const selectedRoute = ROUTES[form.route] || ROUTES.route2;
  const route = !form.route
    ? { ...selectedRoute, title: "", text: "Not selected" }
    : form.route === "custom"
      ? { ...selectedRoute, title: "Custom Route", text: form.customRoute || selectedRoute.text }
      : selectedRoute;
  const totalText = result ? `PKR ${fmt(result.totalPkr)} to ${fmt(result.highPkr)}` : "Not yet priced";
  const liveMessage = result && !busy ? `Estimate updated: ${totalText}` : "";

  let message = "Assalamu alaikum. I would like to plan a trip.";
  if (mode === "umrah" && result) {
    message = `Assalamu alaikum. I would like a confirmed quote for Umrah.\n` +
      `${plural(form.adults, "adult")}${form.children ? `, ${plural(form.children, "child")}` : ""}${form.infants ? `, ${plural(form.infants, "infant")}` : ""}, ${route.text}, ` +
      `${showDate(form.startDate)} to ${showDate(plan.end)}.\nEstimate: ${totalText}` +
      (sent ? `\nReference: ${sent}` : "");
  } else if (mode === "umrah" && quoteOnly) {
    message = `Assalamu alaikum. I would like a confirmed Umrah package quote.\n` +
      `${plural(form.adults, "adult")}${form.children ? `, ${plural(form.children, "child")}` : ""}${form.infants ? `, ${plural(form.infants, "infant")}` : ""}, ${route.text}.` +
      (sent ? `\nReference: ${sent}` : "");
  }
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const selectedDeparture = bookingDeparture === "Other" ? customDeparture.trim() : bookingDeparture;

  function openService(service) {
    setSent(null);
    setLeadError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (service === "umrah" || service === "calculator") {
      setStep(0);
      navigate(APP_PATHS[service]);
      return;
    }
    const path = APP_PATHS[service];
    if (!path) {
      throw new Error(`Unknown travel service: ${service}`);
    }
    navigate(path);
  }

  function searchPackages(event) {
    event.preventDefault();
    openService("umrah");

    const totalNights = bookingDays - 1;
    const makkahNights = Math.ceil(totalNights * 0.55);
    setForm((current) => ({
      ...current,
      adults: bookingPassengers,
      roomType: bookingRoom ? (bookingRoom === "sharing" ? "sharing" : Number(bookingRoom)) : null,
      departureCity: selectedDeparture,
      makkahNights,
      madinahNights: totalNights - makkahNights,
      makkahHotelId: "",
      madinahHotelId: "",
    }));
  }

  const leadForm = (
    <LeadForm
      lead={lead}
      setLead={setLead}
      onSubmit={submitLead}
      error={leadError}
      sending={sending}
      disabled={mode === "umrah" && !result && !quoteOnly}
    />
  );
  const doneBox = <RequestConfirmation reference={sent} waLink={waLink} />;
  const homePage = (
    <HomePage
      bookingDays={bookingDays}
      setBookingDays={setBookingDays}
      bookingPassengers={bookingPassengers}
      setBookingPassengers={setBookingPassengers}
      bookingRoom={bookingRoom}
      setBookingRoom={setBookingRoom}
      bookingDeparture={bookingDeparture}
      setBookingDeparture={setBookingDeparture}
      customDeparture={customDeparture}
      setCustomDeparture={setCustomDeparture}
      onSearch={searchPackages}
      onOpenService={openService}
      waLink={waLink}
    />
  );
  const comingSoonPage = (
    <ComingSoonPage
      service={page}
      onHome={() => navigate(APP_PATHS.home)}
      onUmrah={() => openService("umrah")}
    />
  );
  const umrahWizard = (
    <UmrahWizard
      step={step}
      form={form}
      updateForm={updateForm}
      errors={errors}
      canReach={canReach}
      plan={plan}
      hotels={hotels}
      hotelStatus={hotelStatus}
      result={result}
      calcError={calcError}
      busy={busy}
      onDownloadPdf={downloadPdf}
      pdfBusy={pdfBusy}
      pdfError={pdfError}
      sent={sent}
      doneBox={doneBox}
      leadForm={leadForm}
      headingRef={headingRef}
      onHome={() => navigate(APP_PATHS.home)}
      onBack={back}
      onNext={next}
      onGoToStep={goToStep}
      nameOf={nameOf}
      route={route}
      transport={transport}
      fxSarToPkr={fxSarToPkr}
      totalText={totalText}
      liveMessage={liveMessage}
      sumOpen={sumOpen}
      setSumOpen={setSumOpen}
      inRange={inRange}
      quoteOnly={quoteOnly}
      quoteReason={quoteReasons.join(" ")}
      roomAllocations={roomAllocations}
    />
  );

  return (
    <>
      <SiteHeader page={page} waLink={waLink} />
      <main id="main" className="wrap">
        <Routes>
          <Route path={APP_PATHS.home} element={homePage} />
          <Route path={APP_PATHS.umrah} element={umrahWizard} />
          <Route path={APP_PATHS.calculator} element={umrahWizard} />
          <Route path={APP_PATHS.hajj} element={comingSoonPage} />
          <Route path={APP_PATHS.tours} element={comingSoonPage} />
          <Route path={APP_PATHS.flights} element={comingSoonPage} />
          <Route path={APP_PATHS.visa} element={comingSoonPage} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <p className="footer">Estimates only. Final prices and availability are confirmed in writing by our team.</p>
    </>
  );
}
