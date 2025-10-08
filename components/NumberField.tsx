"use client";
import { ChangeEvent } from "react";
import Tooltip from "./Tooltip";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  help?: string;
  suffix?: string;
  tooltip?: string;
};

export default function NumberField({
  label,
  value,
  onChange,
  min,
  step,
  help,
  suffix,
  tooltip,
}: Props) {
  function handle(e: ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    onChange(Number.isFinite(v) ? v : 0);
  }
  return (
    <label className="block">
      <span className="label flex items-center gap-1">
        {label}
        {suffix ? ` (${suffix})` : ""}
        {tooltip && <Tooltip text={tooltip} />}
      </span>
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
