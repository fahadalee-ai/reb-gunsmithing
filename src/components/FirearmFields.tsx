import { MChip, MSelect } from "@/components/m3";
import { calibersFor, makesFor, modelsFor } from "@/lib/firearms";
import type { FirearmType } from "@/lib/types";

const TYPES: FirearmType[] = ["Handgun", "Rifle", "Shotgun", "Other"];

export function FirearmFields({
  type,
  make,
  model,
  caliber,
  errors,
  onChange,
}: {
  type: FirearmType;
  make: string;
  model: string;
  caliber: string;
  errors?: { make?: string; model?: string; caliber?: string };
  onChange: (next: { type: FirearmType; make: string; model: string; caliber: string }) => void;
}) {
  const makes = makesFor(type);
  const models = modelsFor(type, make);
  const calibers = calibersFor(type, make, model);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {TYPES.map((item) => (
          <MChip
            key={item}
            selected={type === item}
            onClick={() => {
              const stillValid = makesFor(item).includes(make) && modelsFor(item, make).includes(model) && calibersFor(item, make, model).includes(caliber);
              onChange(stillValid ? { type: item, make, model, caliber } : { type: item, make: "", model: "", caliber: "" });
            }}
          >
            {item}
          </MChip>
        ))}
      </div>
      <MSelect label="Make" value={make} error={errors?.make} onChange={(next) => onChange({ type, make: next, model: "", caliber: "" })}>
        <option value="">Select make</option>
        {makes.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </MSelect>
      <MSelect
        label="Model"
        value={model}
        disabled={!make}
        error={errors?.model}
        hint={make ? undefined : "Choose a make first."}
        onChange={(next) => {
          const options = calibersFor(type, make, next);
          onChange({ type, make, model: next, caliber: options.length === 1 ? options[0] : "" });
        }}
      >
        <option value="">Select model</option>
        {models.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </MSelect>
      <MSelect label="Caliber or gauge" value={caliber} disabled={!model} error={errors?.caliber} hint={model ? undefined : "Choose a model first."} onChange={(next) => onChange({ type, make, model, caliber: next })}>
        <option value="">Select caliber or gauge</option>
        {calibers.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </MSelect>
    </div>
  );
}
