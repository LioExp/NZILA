import { useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { ANGOLA_PLACES, findPlacesByNames, type AngolaPlace } from "@/data/angola-places";
import type { TravelData } from "@/hooks/use-chat-history";

interface TravelCardProps {
  travelData: TravelData;
}

function PlaceImage({ place }: { place: AngolaPlace }) {
  const [imgError, setImgError] = useState(false);

  const gradients: Record<string, string> = {
    cidade: "from-blue-900 to-slate-800",
    natureza: "from-green-900 to-emerald-800",
    praia: "from-cyan-900 to-teal-800",
    cultura: "from-amber-900 to-orange-800",
    parque: "from-lime-900 to-green-800",
  };

  const gradient = gradients[place.category] ?? "from-zinc-900 to-zinc-700";

  return (
    <div className="relative w-full h-32 overflow-hidden rounded-lg bg-muted shrink-0">
      {!imgError ? (
        <img
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <MapPin className="w-6 h-6 text-white/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <span className="absolute bottom-2 left-2.5 text-[10px] font-semibold text-white/80 uppercase tracking-wider">
        {place.category}
      </span>
    </div>
  );
}

export function TravelCard({ travelData }: TravelCardProps) {
  const { placeNames, focus } = travelData;

  const matchedPlaces = findPlacesByNames(placeNames);
  const displayPlaces = matchedPlaces.length > 0
    ? matchedPlaces
    : ANGOLA_PLACES.filter((p) => p.category === "cidade" || p.category === "natureza").slice(0, 4);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${focus.mapLng - 1.5},${focus.mapLat - 1.5},${focus.mapLng + 1.5},${focus.mapLat + 1.5}&layer=mapnik&marker=${focus.mapLat},${focus.mapLng}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mt-3 border border-border/60 rounded-2xl overflow-hidden bg-card"
    >
      {/* Map */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0 opacity-90"
          title={`Mapa — ${focus.name}`}
          loading="lazy"
        />
        <div className="absolute inset-0 pointer-events-none border-b border-border/40" />
        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold text-foreground">{focus.name}</span>
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${focus.mapLat}&mlon=${focus.mapLng}#map=${focus.mapZoom}/${focus.mapLat}/${focus.mapLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg p-1.5 hover:bg-background transition-colors"
          title="Abrir no OpenStreetMap"
        >
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
        </a>
      </div>

      {/* Places scroll */}
      {displayPlaces.length > 0 && (
        <div className="p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2.5 px-0.5">
            Lugares em destaque
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar snap-x snap-mandatory">
            {displayPlaces.map((place) => (
              <div
                key={place.id}
                className="shrink-0 w-44 snap-start"
              >
                <PlaceImage place={place} />
                <div className="mt-2 px-0.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
                    <p className="text-xs font-semibold text-foreground truncate">{place.name}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {place.description}
                  </p>
                  <span className="text-[10px] text-muted-foreground/50 mt-1 block">{place.province}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
