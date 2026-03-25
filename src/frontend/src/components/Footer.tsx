import { Link } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-[oklch(0.2_0.005_70)] text-[oklch(0.85_0.01_70)]">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-white text-lg">
                CraveCart
              </span>
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              Fresh, delicious food delivered fast. From our kitchen to your
              door.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li>
                <Link
                  to="/"
                  className="hover:opacity-100 hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="hover:opacity-100 hover:text-primary transition-colors"
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-heading font-semibold text-white mb-3">Info</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li>Mon–Sun: 10:00 AM – 10:00 PM</li>
              <li>hello@cravecart.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm opacity-50">
          <p>© {year} CraveCart. All rights reserved.</p>
          <p>
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
