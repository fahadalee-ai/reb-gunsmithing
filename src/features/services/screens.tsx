import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { MButton, TopBar } from "@/components/m3";
import { useStore } from "@/lib/store";
import type { ServiceId } from "@/lib/types";

export function ServicesScreen() {
  const { db } = useStore();
  const navigate = useNavigate();
  return (
    <div className="pb-4">
      <TopBar title="Services" back={() => navigate({ to: "/home" })} />
      <p className="px-4 pb-3 text-[16px] leading-6 text-[#d7e0ea]">Cleaning, repair, inspection, and appraisal. Nothing is sold from a shelf.</p>
      <div className="grid gap-3 px-4">
        {db.services.map((service) => (
          <button
            key={service.id}
            type="button"
            className="relative h-36 overflow-hidden text-left"
            onClick={() => navigate({ to: "/services/$id", params: { id: service.id } })}
          >
            <img src={service.image} alt="" className="absolute inset-0 size-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#0e1218]/95 via-[#0e1218]/75 to-[#0e1218]/20" />
            <span className="absolute inset-y-0 left-0 w-[3px] bg-tertiary" />
            <span className="relative flex h-full flex-col justify-end p-4 text-white">
              <span className="text-[20px] font-medium">{service.name}</span>
              <span className="mt-1 text-[15px] leading-5 text-white/85">{service.summary}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ServiceDetailScreen() {
  const { id } = useParams({ strict: false }) as { id: ServiceId };
  const { db } = useStore();
  const navigate = useNavigate();
  const service = db.services.find((s) => s.id === id);
  if (!service) return <p className="p-6 text-[16px]">That service is not listed.</p>;
  return (
    <div className="pb-8">
      <section className="relative h-56 overflow-hidden">
        <img src={service.image} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="banner-scrim absolute inset-0" />
        <div className="banner-copy relative z-10 flex h-full flex-col px-1 pt-1 pb-4">
          <button type="button" className="inline-flex h-12 w-fit items-center gap-0.5 px-2 text-[16px] font-medium text-white" onClick={() => navigate({ to: "/services" })}>
            <ChevronLeft className="pointer-events-none size-6" aria-hidden /> Back
          </button>
          <div className="mt-auto px-3">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">REB Gunsmithing</p>
            <h1 className="mt-1 text-[32px] leading-tight font-medium text-white">{service.name}</h1>
          </div>
        </div>
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tertiary" />
      </section>
      <div className="grid gap-5 px-4 pt-5">
        <p className="text-[16px] leading-7 text-white">{service.detail}</p>
        <section>
          <h2 className="text-[22px] font-medium">What is included</h2>
          <ul className="mt-3 grid gap-2">
            {service.included.map((item) => (
              <li key={item} className="border-l-[3px] border-tertiary bg-[var(--surface-low)] px-3 py-3 text-[16px] leading-6">
                {item}
              </li>
            ))}
          </ul>
        </section>
        <p className="text-[16px] text-white">Typical turnaround: {service.turnaround}</p>
        <section>
          <h2 className="text-[22px] font-medium">Before your visit</h2>
          <ul className="mt-3 grid gap-2">
            {service.tips.map((tip) => (
              <li key={tip} className="text-[16px] leading-6 text-[#d7e0ea]">
                {tip}
              </li>
            ))}
          </ul>
        </section>
        <MButton
          full
          onClick={() => {
            sessionStorage.setItem("reb.service", service.id);
            navigate({ to: "/book/new" });
          }}
        >
          Book this service
        </MButton>
      </div>
    </div>
  );
}
