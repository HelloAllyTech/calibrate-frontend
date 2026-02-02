"use client";

import { useEffect } from "react";

const WHATSAPP_INVITE_URL =
  "https://chat.whatsapp.com/JygDNcZ943a3VmZDXYMg5Z?mode=gi_t";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us | Calibrate";
  }, []);

  const handleBookDemo = () => {
    window.open("https://cal.com/amandalmia/30min", "_blank");
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily: "var(--font-dm-sans), system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <a href="/login" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Calibrate Logo" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-black">
            Calibrate
          </span>
        </a>

        <div className="flex items-center gap-4">
          <a
            href="/login#join-community"
            className="px-5 py-2.5 border border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Join
          </a>
          <button
            onClick={handleBookDemo}
            className="px-5 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Book a demo
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-24">
        

        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-medium text-gray-900 mb-6 tracking-[-0.02em]">
            Our Vision
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            Voice AI is transforming how businesses interact with their
            customers. But building reliable voice agents is hard — there are
            countless providers for speech-to-text, text-to-speech, and LLMs,
            each with different strengths and trade-offs.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Calibrate helps teams benchmark providers, test their agents with
            realistic simulations, and catch issues before they reach
            production. We believe that rigorous testing is the key to building
            voice agents that users can trust.
          </p>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-medium text-gray-900 mb-6 tracking-[-0.02em]">
            Team
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-xl">
            <a
              href="https://linkedin.com/in/aman-dalmia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center group"
            >
              <img
                src="/team/aman.jpeg"
                alt="Aman Dalmia"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover bg-gray-200 group-hover:opacity-80 transition-opacity"
              />
              <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                Aman Dalmia
              </h3>
              <p className="text-sm text-gray-500">Principal ML Engineer</p>
            </a>
            <a
              href="https://linkedin.com/in/jigarkdoshi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center group"
            >
              <img
                src="/team/jigar.jpeg"
                alt="Jigar Doshi"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover bg-gray-200 group-hover:opacity-80 transition-opacity"
              />
              <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                Jigar Doshi
              </h3>
              <p className="text-sm text-gray-500">Director of ML</p>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-500 py-16 px-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Company Column */}
            <div className="border-l border-gray-300 pl-8 flex flex-col">
              <h3 className="text-gray-400 text-sm tracking-[0.2em] uppercase mb-6">
                Company
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="/about"
                    className="hover:text-gray-900 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.google.com/document/d/e/2PACX-1vRk2LZDD3ZtMHBocQVl5Qh14PtThP2nB1DFUsC0_9w028yx6LrDKHE77IgOxY-PojVgtyGp-hClts8l/pub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
              <p className="mt-auto pt-8 text-xs text-gray-400">
                Supported by{" "}
                <a
                  href="https://artpark.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-600 transition-colors"
                >
                  ARTPARK
                </a>{" "}
                @IISc
              </p>
            </div>

            {/* Resources Column */}
            <div className="border-l border-gray-300 pl-8">
              <h3 className="text-gray-400 text-sm tracking-[0.2em] uppercase mb-6">
                Resources
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/docs`}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/docs/python-sdk/overview`}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Python SDK
                  </a>
                </li>
                <li>
                  <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/docs/cli/overview`}
                    className="hover:text-gray-900 transition-colors"
                  >
                    CLI
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.google.com/document/d/e/2PACX-1vTRkPJ3-aoibS0ySGfN62w-ytqZrsQ4EogQNTO01Ts4epzT8KJTXpbgSFV1Nb2xihnVpxniC11se5Cx/pub"
                    target="_blank"
                    className="hover:text-gray-900 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Community Column */}
            <div className="border-l border-gray-300 pl-8">
              <h3 className="text-gray-400 text-sm tracking-[0.2em] uppercase mb-6">
                Community
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href={WHATSAPP_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900 transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/xCJ55Ban"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900 transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com/company/artpark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900 transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-16 text-right text-gray-400 text-sm">
            © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
