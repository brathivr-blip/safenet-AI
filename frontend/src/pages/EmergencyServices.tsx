import { motion } from "framer-motion";
import {
  Ambulance, AlertTriangle, Building2, Check, ChevronLeft, Clipboard, Copy,
  Flame, HeartPulse, Hospital, MapPin, Navigation, Phone, Radio, Shield,
  Siren, UserRoundCheck, type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type Service = { name: string; number: string; legacy?: string; description: string; icon: LucideIcon; tone: string };
type Place = { name: string; phone: string; distance: string; time?: string; available?: boolean };

const emergencyServices: Service[] = [
  { name: "Police", number: "112", legacy: "100", description: "All-in-one emergency assistance and police response.", icon: Shield, tone: "from-blue-500/25 via-cyan-400/10 to-transparent text-cyan-200" },
  { name: "Ambulance", number: "108", description: "Free emergency ambulance and medical transport.", icon: Ambulance, tone: "from-rose-500/30 via-orange-400/10 to-transparent text-rose-200" },
  { name: "Fire & Rescue", number: "101", description: "Fire, rescue, and hazardous incident response.", icon: Flame, tone: "from-orange-500/30 via-rose-400/10 to-transparent text-orange-200" },
  { name: "Cyber Crime Helpline", number: "1930", description: "Report financial fraud and cybercrime immediately.", icon: Radio, tone: "from-violet-500/25 via-blue-400/10 to-transparent text-violet-200" },
  { name: "Women Helpline", number: "1091", description: "Emergency support and safety assistance for women.", icon: UserRoundCheck, tone: "from-pink-500/25 via-fuchsia-400/10 to-transparent text-pink-200" },
  { name: "Child Helpline", number: "1098", description: "24/7 support and protection for children in need.", icon: HeartPulse, tone: "from-emerald-500/25 via-cyan-400/10 to-transparent text-emerald-200" },
  { name: "Disaster Management", number: "1078", description: "State emergency helpline where applicable.", icon: AlertTriangle, tone: "from-amber-500/30 via-orange-400/10 to-transparent text-amber-200" },
];

const hospitals: Place[] = [
  { name: "Government Rajaji Hospital", phone: "0452 253 2535", distance: "2.1 km", time: "8 min", available: true },
  { name: "Apollo Speciality Hospitals, Madurai", phone: "0452 258 0892", distance: "3.8 km", time: "13 min", available: true },
  { name: "Velammal Medical College Hospital", phone: "0452 711 3333", distance: "7.4 km", time: "19 min", available: true },
];
const policeStations: Place[] = [
  { name: "Tallakulam Police Station", phone: "0452 253 1000", distance: "1.6 km" },
  { name: "Anna Nagar Police Station", phone: "0452 253 9000", distance: "3.2 km" },
  { name: "Thallakulam All Women Police Station", phone: "0452 253 1515", distance: "2.5 km" },
];
const fireStations: Place[] = [
  { name: "Madurai Fire & Rescue Station", phone: "0452 253 3101", distance: "2.8 km" },
  { name: "Tallakulam Fire Station", phone: "0452 253 4201", distance: "3.7 km" },
];

const reveal = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

function callHref(phone: string) { return `tel:${phone.replace(/[^+\d]/g, "")}`; }
function directionsHref(name: string) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ", Tamil Nadu")}`; }

function CopyButton({ number }: { number: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(number); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* Calling remains the primary emergency action. */ } }
  return <button onClick={copy} aria-label={`Copy ${number}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[.045] px-3 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">{copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}<span>{copied ? "Copied" : "Copy"}</span></button>;
}

function PlaceCard({ place, kind }: { place: Place; kind: "hospital" | "police" | "fire" }) {
  const Icon = kind === "hospital" ? Hospital : kind === "police" ? Shield : Flame;
  const color = kind === "hospital" ? "text-emerald-300 bg-emerald-400/10" : kind === "police" ? "text-cyan-300 bg-cyan-400/10" : "text-orange-300 bg-orange-400/10";
  return <motion.article variants={reveal} className="rounded-2xl border border-white/10 bg-white/[.045] p-4 shadow-xl shadow-black/10 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[.07]">
    <div className="flex items-start gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${color}`}><Icon size={21} /></span><div className="min-w-0 flex-1"><h3 className="font-bold text-white">{place.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-400"><Phone size={13} /> {place.phone}</p><div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold"><span className="rounded-full bg-white/[.07] px-2.5 py-1 text-slate-300">{place.distance} away</span>{place.time && <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-cyan-200">~{place.time}</span>}{place.available && <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-emerald-200">Open / Available</span>}</div></div></div>
    <div className="mt-4 grid grid-cols-2 gap-2"><a href={directionsHref(place.name)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] text-sm font-bold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-100"><Navigation size={16} /> Navigate</a><a href={callHref(place.phone)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 text-sm font-bold text-white shadow-lg shadow-rose-950/30 transition hover:bg-rose-400"><Phone size={16} /> Call</a></div>
  </motion.article>;
}

export default function EmergencyServices({ onBack }: { onBack: () => void }) {
  return <div className="pb-4">
    <section className="relative overflow-hidden rounded-3xl border border-rose-300/20 bg-[#0b1729] px-5 py-8 shadow-2xl shadow-black/30 sm:px-8 sm:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(239,68,68,.22),transparent_24%),radial-gradient(circle_at_88%_25%,rgba(34,211,238,.14),transparent_25%)]" />
      <div className="absolute right-[11%] top-8 h-28 w-28 animate-ping rounded-full border border-rose-300/15" /><div className="absolute right-[11%] top-8 h-28 w-28 rounded-full bg-rose-500/5" />
      <div className="relative"><button onClick={onBack} className="mb-7 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><ChevronLeft size={18} /> Back to dashboard</button><div className="max-w-3xl"><div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[.24em] text-rose-200"><span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" /> Emergency command center</div><h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Emergency Help <span className="text-rose-300">in One Tap</span></h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Instant access to Police, Ambulance, Fire, Cyber Crime, and nearby emergency services.</p></div></div>
    </section>

    <section aria-label="Quick emergency actions" className="relative z-10 mx-auto -mt-5 grid max-w-5xl grid-cols-2 gap-2 px-3 sm:grid-cols-5 sm:gap-3"><a href="tel:112" className="col-span-2 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 font-black text-white shadow-xl shadow-rose-950/40 transition hover:-translate-y-0.5 hover:bg-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:col-span-1"><Siren size={19} /> SOS</a><a href="tel:112" className="quick-action"><Phone size={17} /> Call 112</a><a href="tel:108" className="quick-action"><Ambulance size={17} /> Ambulance</a><a href="tel:101" className="quick-action"><Flame size={17} /> Fire</a><a href="tel:112" className="quick-action"><Shield size={17} /> Police</a></section>

    <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: .15 }} transition={{ staggerChildren: .06 }} className="mt-12"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-rose-300">Official national helplines</p><h2 className="mt-2 text-2xl font-black text-white">Call the right service, fast.</h2></div><Clipboard className="hidden text-slate-500 sm:block" /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{emergencyServices.map((service) => { const Icon = service.icon; return <motion.article key={service.name} variants={reveal} whileHover={{ y: -5 }} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${service.tone} p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition-colors hover:border-white/30`}><div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-current opacity-[.06] blur-xl" /><div className="relative"><div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#07111d]/50"><Icon size={25} /></span>{service.legacy && <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-xs font-semibold text-slate-300">Legacy: {service.legacy}</span>}</div><h3 className="mt-5 text-lg font-bold text-white">{service.name}</h3><p className="mt-1.5 min-h-10 text-sm leading-5 text-slate-300">{service.description}</p><div className="mt-4 font-mono text-4xl font-black tracking-[.12em] text-white drop-shadow-[0_0_14px_rgba(255,255,255,.2)]">{service.number}</div><div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><a href={`tel:${service.number}`} aria-label={`Call ${service.name} at ${service.number}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-[#0b1729] shadow-lg transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><Phone size={16} /> Call now</a><CopyButton number={service.number} /></div></div></motion.article>; })}</div></motion.section>

    <ResourceSection eyebrow="Tamil Nadu demonstration data" title="Nearby Hospitals" icon={Hospital} places={hospitals} kind="hospital" />
    <ResourceSection eyebrow="Closest response points" title="Nearby Police Stations" icon={Shield} places={policeStations} kind="police" />
    <ResourceSection eyebrow="Closest response points" title="Nearby Fire Stations" icon={Flame} places={fireStations} kind="fire" />

    <section className="mt-10 overflow-hidden rounded-3xl border border-cyan-300/15 bg-[#0b1828] p-5 sm:p-7"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Live service map</p><h2 className="mt-2 text-2xl font-black">Emergency resources around you</h2></div><MapPin className="text-cyan-300" /></div><div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(rgba(148,163,184,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.09)_1px,transparent_1px),radial-gradient(circle_at_50%_52%,rgba(34,211,238,.16),transparent_28%)] bg-[size:30px_30px,30px_30px,auto]"><div className="absolute left-[48%] top-[46%] h-16 w-16 animate-ping rounded-full bg-cyan-400/15" /><MapPin aria-label="Your location" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-cyan-300 text-cyan-300" /><span className="absolute left-[25%] top-[27%] grid h-9 w-9 place-items-center rounded-full bg-emerald-400/20 text-emerald-300 shadow-[0_0_22px_rgba(52,211,153,.25)]"><Hospital size={18} /></span><span className="absolute right-[23%] top-[31%] grid h-9 w-9 place-items-center rounded-full bg-blue-400/20 text-blue-300"><Shield size={18} /></span><span className="absolute bottom-[19%] right-[34%] grid h-9 w-9 place-items-center rounded-full bg-orange-400/20 text-orange-300"><Flame size={18} /></span><div className="absolute bottom-3 left-3 rounded-lg bg-[#07111d]/80 px-3 py-2 text-xs text-slate-300 backdrop-blur">Markers: your location, hospitals, police & fire stations</div></div><p className="mt-3 text-xs text-slate-500">The dashboard’s Google Map remains available below for live location and full navigation.</p></section>
  </div>;
}

function ResourceSection({ eyebrow, title, icon: Icon, places, kind }: { eyebrow: string; title: string; icon: LucideIcon; places: Place[]; kind: "hospital" | "police" | "fire" }) { return <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: .15 }} transition={{ staggerChildren: .08 }} className="mt-12"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{eyebrow}</p><h2 className="mt-2 text-2xl font-black text-white">{title}</h2></div><Icon className="text-slate-500" /></div><div className="grid gap-4 lg:grid-cols-3">{places.map((place) => <PlaceCard key={place.name} place={place} kind={kind} />)}</div></motion.section>; }
