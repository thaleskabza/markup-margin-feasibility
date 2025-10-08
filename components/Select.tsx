"use client";
import Tooltip from "./Tooltip";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  help?: string;
  tooltip?: string;
};

export default function Select({ label, value, onChange, options, help, tooltip }: Props) {
  return (
    <label className="block">
      <span className="label flex items-center gap-1">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </span>
      <select className="input mt-1" value={value} onChange={(e)=>onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {help && <div className="help">{help}</div>}
    </label>
  );
}
