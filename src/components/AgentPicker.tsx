"use client";

import React, { useState, useEffect } from "react";

export type Agent = {
  uuid: string;
  name: string;
};

type AgentPickerProps = {
  selectedAgentUuid: string;
  onSelectAgent: (agent: Agent | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function AgentPicker({
  selectedAgentUuid,
  onSelectAgent,
  label = "Select Agent",
  placeholder = "Select an agent",
  className = "",
  disabled = false,
}: AgentPickerProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch agents on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setAgentsLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error("BACKEND_URL environment variable is not set");
        }

        const response = await fetch(`${backendUrl}/agents`, {
          method: "GET",
          headers: {
            accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }

        const data = await response.json();
        const formattedAgents: Agent[] = Array.isArray(data)
          ? data.map((agent: any) => ({
              uuid: agent.uuid,
              name: agent.name || agent.agent_name || String(agent),
            }))
          : [];
        setAgents(formattedAgents);
      } catch (err) {
        console.error("Error fetching agents:", err);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedAgent = agents.find((a) => a.uuid === selectedAgentUuid);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white">{label}</label>
      )}
      <div className="relative">
        <div
          onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
          className={`w-full h-11 px-4 rounded-xl text-sm bg-transparent text-white border border-[#444] transition-colors flex items-center justify-between ${
            disabled ? "cursor-default" : "hover:border-[#666] cursor-pointer"
          }`}
        >
          <span className={selectedAgent ? "text-white" : "text-gray-500"}>
            {selectedAgent ? selectedAgent.name : placeholder}
          </span>
          {!disabled && (
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          )}
        </div>

        {/* Dropdown */}
        {dropdownOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-[99]"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#2a2a2a] border border-[#444] rounded-xl shadow-xl z-[100] overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-[#444]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents"
                  className="w-full h-10 px-4 rounded-lg text-sm bg-[#1a1a1a] text-white placeholder:text-gray-500 border border-[#444] focus:outline-none focus:ring-1 focus:ring-gray-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Options */}
              <div className="max-h-60 overflow-y-auto">
                {agentsLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    Loading agents...
                  </div>
                ) : filteredAgents.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    No agents found
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                    <button
                      key={agent.uuid}
                      onClick={() => {
                        onSelectAgent(agent);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors cursor-pointer flex items-center justify-between ${
                        selectedAgentUuid === agent.uuid
                          ? "bg-[#3a3a3a] text-white"
                          : "text-white hover:bg-[#333]"
                      }`}
                    >
                      <span>{agent.name}</span>
                      {selectedAgentUuid === agent.uuid && (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
