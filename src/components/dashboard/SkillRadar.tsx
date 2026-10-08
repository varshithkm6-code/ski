"use client";

import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Table, Eye } from "lucide-react";

export interface SkillRadarItem {
  skill: string;
  user: number; // 0 - 5
  required: number; // 0 - 5
}

interface SkillRadarProps {
  data: SkillRadarItem[];
}

export function SkillRadar({ data }: SkillRadarProps) {
  const [showTable, setShowTable] = useState(false);

  // If no data provided or empty, show clear placeholder
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-surface-subtle/50 rounded-control border border-border/60">
        <span className="text-xs font-semibold text-ink">No competency radar data</span>
        <span className="text-[11px] text-muted max-w-xs mt-1">
          Select target role and extract candidate skills to generate the dimensional radar polygon.
        </span>
      </div>
    );
  }

  // Cap at top 8 for clean polygon rendering
  const chartData = data.slice(0, 8);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Legend & Accessibility View Toggle */}
      <div className="flex items-center justify-between text-xs pb-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-medium text-ink text-[11px]">Your Verified Level</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-secondary border-b border-dashed border-secondary" />
            <span className="font-medium text-muted text-[11px]">Role Required Target</span>
          </div>
        </div>

        {/* Accessible Table View Toggle */}
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover transition cursor-pointer"
          aria-label={showTable ? "Switch to radar chart view" : "Switch to accessible table view"}
        >
          {showTable ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Chart view</span>
            </>
          ) : (
            <>
              <Table className="w-3.5 h-3.5" />
              <span>Table view</span>
            </>
          )}
        </button>
      </div>

      {showTable ? (
        /* Accessible Table Alternative */
        <div className="overflow-x-auto my-auto py-2">
          <table className="w-full text-xs text-left" aria-label="Competency level comparison table">
            <thead>
              <tr className="border-b border-border text-muted font-medium">
                <th className="py-2 pr-4">Skill Requirement</th>
                <th className="py-2 px-3 text-center">Your Level</th>
                <th className="py-2 px-3 text-center">Role Target</th>
                <th className="py-2 pl-3 text-right">Match Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {chartData.map((row) => {
                const diff = row.user - row.required;
                return (
                  <tr key={row.skill} className="hover:bg-surface-subtle/50 transition">
                    <td className="py-2 pr-4 font-semibold text-ink">{row.skill}</td>
                    <td className="py-2 px-3 text-center font-mono font-medium text-primary">
                      {row.user}/5
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-medium text-muted">
                      {row.required}/5
                    </td>
                    <td className="py-2 pl-3 text-right font-mono text-[11px]">
                      {diff >= 0 ? (
                        <span className="text-status-strong font-semibold">+{diff} met</span>
                      ) : (
                        <span className="text-status-critical font-semibold">{diff} gap</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Visual Recharts Radar with New Indigo/Violet Palette */
        <div className="w-full h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              {/* Soft light gridlines */}
              <PolarGrid stroke="#E3E6F5" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: "#12142B", fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 5]}
                tick={{ fill: "#5B6080", fontSize: 9 }}
              />
              {/* Required in a dashed secondary violet line */}
              <Radar
                name="Role Requirement"
                dataKey="required"
                stroke="#7C3AED"
                strokeWidth={1.75}
                strokeDasharray="4 4"
                fill="transparent"
              />
              {/* Primary Indigo fill at 18% */}
              <Radar
                name="Your Proficiency"
                dataKey="user"
                stroke="#4F46E5"
                strokeWidth={2}
                fill="#4F46E5"
                fillOpacity={0.18}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E3E6F5",
                  borderRadius: "10px",
                  color: "#12142B",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(18, 20, 43, 0.08)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
