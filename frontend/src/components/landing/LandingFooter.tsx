import type { FC, SVGProps } from "react";
import { Link } from "react-router";
import { 
  Wrench, 
  Phone, 
  Mail, 
  MapPin
} from "lucide-react";

// Social Media SVG Icons
const FacebookIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const LandingFooter: FC = () => {
  return (
    <footer className="bg-emerald-950 text-emerald-100/80 pt-16 pb-8 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/80">
          
          {/* Brand Bio Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-emerald-950 font-bold shadow-md">
                <Wrench className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Service<span className="text-emerald-400">Hub</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed max-w-sm">
              Your one-stop solution for all home services. Reliable. Trusted. Hassle-free. Book background-verified home service specialists near you.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-lg bg-emerald-900/80 hover:bg-emerald-600 text-emerald-300 hover:text-white flex items-center justify-center transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-lg bg-emerald-900/80 hover:bg-emerald-600 text-emerald-300 hover:text-white flex items-center justify-center transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-emerald-900/80 hover:bg-emerald-600 text-emerald-300 hover:text-white flex items-center justify-center transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-emerald-900/80 hover:bg-emerald-600 text-emerald-300 hover:text-white flex items-center justify-center transition-colors">
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-emerald-400 transition-colors">Services</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
              <li><Link to="/register?role=PROVIDER" className="hover:text-emerald-400 transition-colors">Become a Provider</Link></li>
              <li><a href="#offers" className="hover:text-emerald-400 transition-colors">Offers</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Press</a></li>
              <li><Link to="/support" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support & Help */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Need Help?</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-200">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-200">support@servicehub.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-200">Bangalore, Karnataka</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/60 gap-4">
          <p>© {new Date().getFullYear()} ServiceHub Technologies Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-emerald-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-300 transition-colors">Cookies Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
