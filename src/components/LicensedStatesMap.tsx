'use client';
import { useState } from 'react';

interface StateData {
  abbr: string;
  name: string;
  path: string;
}

interface TooltipState {
  x: number;
  y: number;
  name: string;
  licensed: boolean;
}

interface Props {
  states: StateData[];
  licensedStates: string[];
}

export default function LicensedStatesMap({ states, licensedStates }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const licensedSet = new Set(licensedStates);
  const count = licensedStates.length;

  return (
    <section className="py-24 bg-jbs-dark relative overflow-hidden">
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-heading text-sm uppercase tracking-widest text-jbs-blue mb-3">
            Where We Build
          </p>
          <h2 className="font-heading text-5xl md:text-6xl font-800 text-white mb-6">
            Licensed Across the Nation
          </h2>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 border border-jbs-blue/40 bg-jbs-blue/10">
            <span className="w-2 h-2 bg-jbs-blue inline-block" />
            <span className="font-heading text-jbs-blue text-sm uppercase tracking-widest">
              Licensed in {count} State{count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Map */}
        <div
          className="relative w-full max-w-5xl mx-auto"
          onMouseLeave={() => setTooltip(null)}
        >
          <svg
            viewBox="0 0 960 600"
            className="w-full h-auto"
            style={{ display: 'block' }}
          >
            {states.map(({ abbr, name, path }) => {
              const isLicensed = licensedSet.has(abbr);
              return (
                <path
                  key={abbr}
                  d={path}
                  fill={isLicensed ? '#00A0E0' : '#1e2a35'}
                  stroke="#0d1a24"
                  strokeWidth="0.6"
                  style={{ cursor: 'pointer', transition: 'fill 0.15s ease' }}
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
                    setTooltip({
                      x: ((e.clientX - rect.left) / rect.width) * 100,
                      y: ((e.clientY - rect.top) / rect.height) * 100,
                      name,
                      licensed: isLicensed,
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect();
                    setTooltip((prev) =>
                      prev
                        ? { ...prev, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }
                        : prev
                    );
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-20"
              style={{
                left: `${tooltip.x}%`,
                top: `${tooltip.y}%`,
                transform: 'translate(-50%, -130%)',
              }}
            >
              <div
                className="px-3 py-1.5 text-xs font-heading uppercase tracking-wider whitespace-nowrap flex items-center gap-2"
                style={{
                  background: tooltip.licensed ? '#00A0E0' : '#111c26',
                  color: '#fff',
                  border: tooltip.licensed ? '1px solid #33b8f0' : '1px solid #2a3a4a',
                  boxShadow: tooltip.licensed
                    ? '0 4px 20px rgba(0,160,224,0.35)'
                    : '0 4px 12px rgba(0,0,0,0.5)',
                }}
              >
                {tooltip.licensed && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {tooltip.name}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-10 mt-8">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 inline-block" style={{ background: '#00A0E0' }} />
            <span className="text-white/60 text-xs font-heading uppercase tracking-widest">Licensed</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 inline-block" style={{ background: '#1e2a35', border: '1px solid #2a3a4a' }} />
            <span className="text-white/30 text-xs font-heading uppercase tracking-widest">Not Yet Licensed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
