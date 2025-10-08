// components/NumberField.tsx
"use client";
import { ChangeEvent } from "react";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  help?: string;
  suffix?: string;
};

export default function NumberField({ label, value, onChange, min, step, help, suffix }: Props) {
  function handle(e: ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    onChange(Number.isFinite(v) ? v : 0);
  }
  
  return (
    <label className="block">
      <span className="label">{label}{suffix ? ` (${suffix})` : ""}</span>
      <input 
        className="input mt-1" 
        type="number" 
        value={value} 
        onChange={handle} 
        min={min} 
        step={step ?? "any"} 
      />
      {help && <div className="help">{help}</div>}
    </label>
  );
}