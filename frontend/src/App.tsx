import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, AlertTriangle, ArrowRight, Crosshair, HeartPulse, Hospital, LogOut, MapPin, Radio, ShieldCheck, Siren, Users, X } from "lucide-react";
import { getDashboard, getHealth, login, register, reportEmergency, type DashboardSummary, type Emergency, type User } from "./services/api";

type AuthMode = "login" | "register";
type View = "overview" | "report" | "incident";

const fallbackLocation = { latitude: 40.7128, longitude: -74.006 };
type Location = { latitude: number; longitude: number };

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("safenet_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [view, setView] = useState<View>("overview");
  const [incident, setIncident] = useState<Emergency | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location>(fallbackLocation);
  const [gpsStatus, setGpsStatus] = useState("Requesting current GPS");

  useEffect(() => {
    getHealth().then(() => setBackendOnline(true)).catch(() => setBackendOnline(false));
  }, []);

  useEffect(() => {
    if (!user || !navigator.geolocation) {
      setGpsStatus("GPS unavailable · demo coordinates active");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGpsStatus("Live GPS location active");
      },
      () => setGpsStatus("GPS permission denied · demo coordinates active"),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);

  useEffect(() => {
    if (user) getDashboard().then(setDashboard).catch(() => setDashboard(null));
  }, [user, incident]);

  function onAuthenticated(nextUser: User) {
    localStorage.setItem("safenet_user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("safenet_user");
    setUser(null);
    setIncident(null);
  }

  if (!user) return <AuthScreen backendOnline={backendOnline} onAuthenticated={onAuthenticated} />;

  return (
    <div className="min-h-screen bg-[#07111d] text-slate-100">
      <header className="border-b border-white/10 bg-[#0b1725]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => setView("overview")}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 text-[#07111d]"><ShieldCheck size={23} /></div>
            <div className="text-left"><div className="font-black tracking-[0.22em] text-white">SAFENET</div><div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">Response network</div></div>
          </button>
          <div className="flex items-center gap-4">
            <span className={`hidden items-center gap-2 text-xs md:flex ${backendOnline ? "text-emerald-300" : "text-rose-300"}`}><span className={`h-2 w-2 rounded-full ${backendOnline ? "bg-emerald-300" : "bg-rose-300"}`} />{backendOnline ? "Systems online" : "Offline"}</span>
            <div className="hidden text-right sm:block"><div className="text-sm font-semibold">{user.name}</div><div className="text-xs text-slate-400">{user.role}</div></div>
            <button aria-label="Sign out" title="Sign out" onClick={logout} className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-white/30 hover:text-white"><LogOut size={17} /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-300"><Activity size={14} /> Live coordination</div><h1 className="text-3xl font-black tracking-tight md:text-5xl">Good to see you, {user.name.split(" ")[0]}.</h1><p className="mt-2 max-w-xl text-slate-400">One place to report an emergency, coordinate response, and keep the people who matter informed.</p></div>
          <button onClick={() => { setView("report"); setIncident(null); }} className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 font-bold text-white shadow-lg shadow-rose-950/30 transition hover:bg-rose-400"><Siren size={18} /> Report emergency <ArrowRight size={17} /></button>
        </div>
        {view === "report" && <ReportPanel currentLocation={currentLocation} gpsStatus={gpsStatus} onComplete={(next) => { setIncident(next); setView("incident"); }} onCancel={() => setView("overview")} />}
        {view === "incident" && incident && <IncidentPanel incident={incident} onBack={() => setView("overview")} />}
        {view === "overview" && <Overview dashboard={dashboard} onSelectIncident={(next) => { setIncident(next); setView("incident"); }} />}
        <GoogleMapPanel location={incident && view === "incident" ? { latitude: incident.latitude, longitude: incident.longitude } : currentLocation} gpsStatus={gpsStatus} />
      </main>
    </div>
  );
}

function AuthScreen({ backendOnline, onAuthenticated }: { backendOnline: boolean; onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("Demo Citizen");
  const [email, setEmail] = useState("demo@safenet.ai");
  const [password, setPassword] = useState("safenet");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { const response = mode === "login" ? await login(email, password) : await register(name, email, password); onAuthenticated(response.user); }
    catch (requestError: unknown) { setError(getRequestError(requestError, "Unable to connect. Check that the backend is running.")); }
    finally { setBusy(false); }
  }

  return <div className="min-h-screen bg-[#07111d] text-slate-100 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
    <section className="relative hidden overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_25%_15%,rgba(16,185,129,.18),transparent_32%),linear-gradient(145deg,#0a1927,#07111d)] p-12 lg:flex lg:flex-col lg:justify-between"><div><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400 text-[#07111d]"><ShieldCheck /></div><span className="font-black tracking-[0.25em]">SAFENET AI</span></div><div className="mt-28 max-w-xl"><p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">Intelligent emergency response</p><h1 className="text-6xl font-black leading-[.98] tracking-tight">When seconds matter, clarity matters more.</h1><p className="mt-7 max-w-md text-lg leading-8 text-slate-400">A connected response layer for citizens, dispatchers, responders, and hospitals.</p></div></div><div className="flex items-center gap-3 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Protected demo environment <span className="mx-1">·</span> {backendOnline ? "API connected" : "API connecting"}</div></section>
    <section className="flex min-h-screen items-center justify-center px-6 py-12"><form onSubmit={submit} className="w-full max-w-md"><div className="mb-10 lg:hidden"><div className="mb-6 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 text-[#07111d]"><ShieldCheck /></div><span className="font-black tracking-[0.25em]">SAFENET AI</span></div></div><p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Secure access</p><h2 className="text-4xl font-black">{mode === "login" ? "Welcome back." : "Create your account."}</h2><p className="mt-3 text-slate-400">{mode === "login" ? "Enter the response network." : "Join your local response network."}</p><div className="mt-8 space-y-4">{mode === "register" && <Field label="Full name" value={name} onChange={setName} />}{<Field label="Email address" type="email" value={email} onChange={setEmail} />}{<Field label="Password" type="password" value={password} onChange={setPassword} />}</div>{error && <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}<button disabled={busy} className="mt-7 w-full rounded-xl bg-emerald-400 py-3.5 font-bold text-[#07111d] transition hover:bg-emerald-300 disabled:opacity-60">{busy ? "Connecting..." : mode === "login" ? "Enter dashboard" : "Create account"}</button><button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-5 w-full text-sm text-slate-400 hover:text-white">{mode === "login" ? "New to SafeNet? Create an account" : "Already registered? Sign in"}</button><p className="mt-8 text-center text-xs leading-5 text-slate-600">Demo login: demo@safenet.ai / safenet</p></form></section>
  </div>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">{label}</span><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3.5 outline-none transition placeholder:text-slate-600 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10" /></label>; }

function Overview({ dashboard, onSelectIncident }: { dashboard: DashboardSummary | null; onSelectIncident: (incident: Emergency) => void }) { return <div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<AlertTriangle />} label="Active incidents" value={dashboard?.active_incidents ?? 0} accent="text-rose-300" /><Metric icon={<Siren />} label="Critical priority" value={dashboard?.critical_incidents ?? 0} accent="text-amber-300" /><Metric icon={<Users />} label="Responders available" value={dashboard?.responders_available ?? 0} accent="text-cyan-300" /><Metric icon={<Hospital />} label="Hospitals receiving" value={dashboard?.hospitals_receiving ?? 0} accent="text-emerald-300" /></div><div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><section className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">Recent response activity</h2><p className="mt-1 text-sm text-slate-500">Every incident stays visible from report to resolution.</p></div><Radio className="text-emerald-300" size={20} /></div>{dashboard?.recent.length ? <div className="space-y-3">{dashboard.recent.map((item) => <button key={item.id} onClick={() => onSelectIncident(item)} className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-black/10 p-4 text-left transition hover:border-emerald-400/40 hover:bg-emerald-400/[.04]"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-lg ${item.priority === "CRITICAL" ? "bg-rose-400/15 text-rose-300" : "bg-amber-400/15 text-amber-300"}`}><AlertTriangle size={17} /></span><div><div className="font-semibold">{item.id} <span className="ml-2 text-xs font-normal text-slate-500">{item.category}</span></div><div className="mt-1 max-w-md truncate text-sm text-slate-400">{item.description}</div></div></div><div className="text-right"><div className="text-xs font-bold uppercase text-emerald-300">{item.status}</div><div className="mt-1 text-xs text-slate-500">{item.responder.eta} ETA</div></div></button>)}</div> : <EmptyState />}</section><section className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(16,185,129,.13),rgba(255,255,255,.025))] p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Response map</p><h2 className="mt-2 text-xl font-bold">Network coverage</h2></div><MapPin className="text-emerald-300" /></div><div className="relative mt-6 h-52 overflow-hidden rounded-xl border border-emerald-300/10 bg-[#0b1d29]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px)", backgroundSize: "32px 32px" }}><div className="absolute left-[46%] top-[40%] h-20 w-20 animate-pulse rounded-full bg-emerald-400/10" /><span className="absolute left-[52%] top-[47%] h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_25px_8px_rgba(110,231,183,.35)]" /><span className="absolute left-[25%] top-[26%] h-2 w-2 rounded-full bg-cyan-300" /><span className="absolute left-[73%] top-[67%] h-2 w-2 rounded-full bg-amber-300" /><span className="absolute bottom-3 left-3 text-xs text-slate-500">Live service area · GPS enabled</span></div><div className="mt-5 flex items-center gap-4 text-xs text-slate-400"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-300" /> Dispatch center</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-cyan-300" /> Resources</span></div></section></div></div>; }

function Metric({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><div className={`mb-5 ${accent}`}>{icon}</div><div className="text-3xl font-black">{value}</div><div className="mt-1 text-sm text-slate-500">{label}</div></div>; }
function EmptyState() { return <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-white/10 text-center"><div><p className="font-medium text-slate-300">No incidents yet</p><p className="mt-1 text-sm text-slate-500">Your next report will appear here.</p></div></div>; }

function ReportPanel({ currentLocation, gpsStatus, onComplete, onCancel }: { currentLocation: Location; gpsStatus: string; onComplete: (incident: Emergency) => void; onCancel: () => void }) { const [description, setDescription] = useState(""); const [category, setCategory] = useState("Medical"); const [location, setLocation] = useState(currentLocation); const [locationState, setLocationState] = useState(gpsStatus); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  function locate() { if (!navigator.geolocation) { setLocationState("GPS unavailable · demo coordinates active"); return; } setLocationState("Requesting GPS permission..."); navigator.geolocation.getCurrentPosition((position) => { setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }); setLocationState("Live GPS location captured"); }, () => setLocationState("Permission denied · demo coordinates active"), { enableHighAccuracy: true }); }
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { onComplete(await reportEmergency({ description, category, ...location })); } catch (requestError: unknown) { setError(getRequestError(requestError, "Could not submit the emergency report.")); } finally { setBusy(false); } }
  return <form onSubmit={submit} className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[.035] p-6 md:p-8"><div className="mb-8 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-rose-300">Citizen report</p><h2 className="mt-2 text-3xl font-black">What is happening?</h2><p className="mt-2 text-slate-400">Our triage engine will prioritize the report and coordinate the nearest response.</p></div><button type="button" onClick={onCancel} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"><X size={20} /></button></div><div className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Emergency category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0b1725] px-4 py-3.5 outline-none focus:border-emerald-400/70"><option>Medical</option><option>Fire</option><option>Road accident</option><option>Safety concern</option></select></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Describe the situation</span><textarea required minLength={8} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Example: Someone is unconscious and not breathing..." rows={5} className="w-full resize-none rounded-xl border border-white/10 bg-black/10 px-4 py-3.5 outline-none placeholder:text-slate-600 focus:border-emerald-400/70" /></label><div className="flex flex-col justify-between gap-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[.04] p-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-300/10 text-cyan-300"><Crosshair size={19} /></div><div><div className="text-sm font-semibold">Emergency location</div><div className="mt-1 text-xs text-slate-400">{locationState}<br />{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</div></div></div><button type="button" onClick={locate} className="rounded-lg border border-cyan-300/30 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-300/10">Use live GPS</button></div></div>{error && <div className="mt-5 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}<div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-xl px-5 py-3 font-semibold text-slate-400 hover:text-white">Cancel</button><button disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 font-bold hover:bg-rose-400 disabled:opacity-60">{busy ? "Analyzing report..." : "Send emergency report"} <ArrowRight size={17} /></button></div></form>; }

function IncidentPanel({ incident, onBack }: { incident: Emergency; onBack: () => void }) { return <div><button onClick={onBack} className="mb-5 text-sm font-semibold text-slate-400 hover:text-white">← Back to overview</button><div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-emerald-300"><ShieldCheck size={14} /> Coordination active</div><h2 className="text-3xl font-black">Incident {incident.id}</h2><p className="mt-2 text-slate-400">{incident.description}</p></div><span className="w-fit rounded-full bg-amber-400/15 px-4 py-2 text-sm font-bold text-amber-200">{incident.priority} priority</span></div><div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><section className="space-y-4"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><div className="mb-5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"><Siren size={19} /></div><div><h3 className="font-bold">AI triage complete</h3><p className="text-sm text-slate-400">{incident.recommendation}</p></div></div><div className="grid gap-3 sm:grid-cols-2"><Info label="Responder" value={`${incident.responder.name} · ${incident.responder.eta}`} /><Info label="Hospital" value={incident.hospital.status} /><Info label="Dispatch status" value={incident.status} /><Info label="Location" value={`${incident.latitude.toFixed(3)}, ${incident.longitude.toFixed(3)}`} /></div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><h3 className="mb-5 font-bold">Response timeline</h3><div className="space-y-4">{incident.timeline.map((event) => <div key={`${event.label}-${event.time}`} className="flex gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.6)]" /><div><div className="text-sm font-semibold">{event.label}</div><div className="text-xs text-slate-500">{new Date(event.time).toLocaleTimeString()}</div></div></div>)}</div></div></section><section className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold">Nearby resources</h3><p className="mt-1 text-sm text-slate-500">Route recommendation based on live position.</p></div><MapPin className="text-cyan-300" /></div><div className="space-y-3">{incident.nearby_resources.map((resource) => <div key={resource.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/10 p-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-300/10 text-cyan-300">{resource.type === "Hospital" ? <HeartPulse size={17} /> : <Radio size={17} />}</div><div><div className="font-semibold">{resource.name}</div><div className="mt-1 text-xs text-slate-500">{resource.type} · {resource.status}</div></div></div><div className="text-right"><div className="font-bold text-cyan-200">{resource.eta}</div><div className="text-xs text-slate-500">{resource.distance_km} km</div></div></div>)}</div><div className="relative mt-6 h-48 overflow-hidden rounded-xl border border-white/10 bg-[#0b1d29]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px)", backgroundSize: "30px 30px" }}><div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10" /><span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-300 shadow-[0_0_24px_8px_rgba(253,164,175,.35)]" /><span className="absolute left-[28%] top-[26%] h-2.5 w-2.5 rounded-full bg-cyan-300" /><span className="absolute right-[25%] bottom-[26%] h-2.5 w-2.5 rounded-full bg-emerald-300" /><span className="absolute bottom-3 left-3 text-xs text-slate-500">Recommended route · live dispatch view</span></div></section></div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-black/10 p-3"><div className="text-xs uppercase tracking-wider text-slate-500">{label}</div><div className="mt-1 text-sm font-semibold text-slate-200">{value}</div></div>; }

function getRequestError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) return error.response?.data?.detail || fallback;
  return fallback;
}

function GoogleMapPanel({ location, gpsStatus }: { location: Location; gpsStatus: string }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const query = `${location.latitude},${location.longitude}`;
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${query}&zoom=15&maptype=roadmap`
    : `https://www.google.com/maps?q=${query}&z=15&output=embed`;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[.035]">
    <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center">
      <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-emerald-300"><MapPin size={14} /> Google Maps live view</div><p className="mt-1 text-sm text-slate-400">{gpsStatus} · {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p></div>
      <a href={externalUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-300/50 hover:text-emerald-200">Open in Google Maps <ArrowRight size={15} /></a>
    </div>
    <iframe title="Google Maps current location" src={mapUrl} className="h-72 w-full border-0 grayscale-[.15] sm:h-96" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
    {!apiKey && <div className="border-t border-amber-300/10 bg-amber-300/[.04] px-5 py-3 text-xs text-amber-100/70">Add `VITE_GOOGLE_MAPS_API_KEY` to `frontend/.env.local` for the Google Maps Embed API view with full Google controls.</div>}
  </section>;
}

export default App;
