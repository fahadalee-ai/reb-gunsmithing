import { useNavigate, useParams } from "@tanstack/react-router";
import { HeroImage, MButton, TopBar } from "@/components/m3";
import { useStore } from "@/lib/store";
import type { ServiceId } from "@/lib/types";

export function ServicesScreen() {
  const { db } = useStore();
  const navigate = useNavigate();
  return (
    <div>
      <TopBar large title="Services" />
      <div className="grid gap-3 px-4">
        {db.services.map((service) => (
          <article key={service.id} className="overflow-hidden rounded-2xl bg-card">
            <img src={service.image} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <h2 className="text-[22px]">{service.name}</h2>
              <p className="mt-1 text-[14px] leading-6 text-[var(--on-surface-variant)]">{service.summary}</p>
              <MButton className="mt-3" variant="text" onClick={() => navigate({ to: "/services/$id", params: { id: service.id } })}>
                Learn More
              </MButton>
            </div>
          </article>
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
  if (!service) return <p className="p-6">That service is not listed.</p>;
  return (
    <div>
      <HeroImage src={service.image} alt="" className="h-64">
        <TopBar back={() => navigate({ to: "/services" })} />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h1 className="text-[32px] leading-tight">{service.name}</h1>
        </div>
      </HeroImage>
      <div className="grid gap-4 px-4 py-5">
        <p className="text-[16px] leading-7">{service.detail}</p>
        <section>
          <h2 className="text-[22px]">What is included</h2>
          <ul className="mt-2 grid gap-2 text-[14px] leading-6">
            {service.included.map((item) => (
              <li key={item} className="rounded-xl bg-card px-3 py-3">{item}</li>
            ))}
          </ul>
        </section>
        <p className="text-[14px]">Typical turnaround: {service.turnaround}</p>
        <section>
          <h2 className="text-[22px]">Before your visit</h2>
          <ul className="mt-2 list-disc pl-5 text-[14px] leading-6 text-[var(--on-surface-variant)]">
            {service.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
        <MButton full onClick={() => { sessionStorage.setItem("reb.service", service.id); navigate({ to: "/book/new" }); }}>
          Book This Service
        </MButton>
      </div>
    </div>
  );
}
