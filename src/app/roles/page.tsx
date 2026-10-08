"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Chip } from "@/components/ui/Chip";
import Link from "next/link";
import { Search, Compass, ArrowRight } from "lucide-react";

interface RoleItem {
  id: string;
  slug: string;
  title: string;
  seniority: string;
  description: string;
  roleSkills: Array<{
    skill: { canonicalName: string; category: string };
    required: boolean;
    weight: number;
    minProficiency: number;
  }>;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSeniority, setSelectedSeniority] = useState("ALL");

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => {
        if (data.roles) setRoles(data.roles);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(search.toLowerCase()) ||
      role.description?.toLowerCase().includes(search.toLowerCase()) ||
      role.roleSkills.some((rs) =>
        rs.skill.canonicalName.toLowerCase().includes(search.toLowerCase())
      );
    const matchesSeniority =
      selectedSeniority === "ALL" || role.seniority === selectedSeniority;
    return matchesSearch && matchesSeniority;
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="card p-6 bg-surface">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                Role Benchmark Library
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                Industry Standard Tech Roles
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl leading-relaxed">
                Explore {roles.length} curated industry benchmarks with weighted competency requirements, minimum proficiency thresholds, and nice-to-have skills.
              </p>
            </div>

            {/* Seniority Filter */}
            <div className="inline-flex rounded-control border border-border p-0.5 bg-surface-subtle text-xs">
              {["ALL", "ENTRY", "MID", "SENIOR"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedSeniority(lvl)}
                  className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                    selectedSeniority === lvl
                      ? "bg-surface text-ink font-semibold shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {lvl === "ALL" ? "All Levels" : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-5 relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role title, description, or specific skill (e.g., React, Python, Cloud)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="control-input pl-10 text-xs h-10"
            />
          </div>
        </div>

        {/* Roles List */}
        {loading ? (
          <div className="text-center py-20 text-muted text-xs">
            Loading benchmark library...
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="card p-12 text-center text-muted space-y-2">
            <Compass className="w-8 h-8 mx-auto text-muted/60" />
            <h3 className="font-semibold text-ink">No roles match your search</h3>
            <p className="text-xs text-muted">Try a different keyword or reset filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRoles.map((role) => {
              const reqSkills = role.roleSkills.filter((rs) => rs.required);
              const optSkills = role.roleSkills.filter((rs) => !rs.required);

              return (
                <div
                  key={role.id}
                  className="card p-5 bg-surface flex flex-col justify-between hover:border-primary/50 transition group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base text-ink group-hover:text-primary transition">
                        {role.title}
                      </h3>
                      <Chip variant="neutral" className="text-[10px] uppercase font-mono">
                        {role.seniority}
                      </Chip>
                    </div>

                    <p className="text-xs text-muted leading-relaxed mb-4">
                      {role.description}
                    </p>

                    {/* Core Requirements */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-ink mb-1.5">
                        <span>Core Requirements ({reqSkills.length})</span>
                        <span className="text-[10px] text-muted">Min Threshold</span>
                      </div>
                      <div className="space-y-1">
                        {reqSkills.slice(0, 5).map((rs, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs px-2.5 py-1 rounded-md bg-surface-subtle border border-border/60"
                          >
                            <span className="text-ink font-medium">{rs.skill.canonicalName}</span>
                            <span className="text-[11px] font-mono font-medium text-primary">
                              Lvl {rs.minProficiency}/5
                            </span>
                          </div>
                        ))}
                        {reqSkills.length > 5 && (
                          <span className="text-[10px] text-muted block pl-1">
                            +{reqSkills.length - 5} additional core skills
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nice to have */}
                    {optSkills.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[11px] font-medium text-muted block mb-1">
                          Nice to Have ({optSkills.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {optSkills.map((os, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-surface-subtle text-muted border border-border/40"
                            >
                              {os.skill.canonicalName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/dashboard?role=${role.id}`}
                    className="btn-primary justify-center text-xs w-full mt-3 h-9"
                  >
                    <span>Assess against this role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
