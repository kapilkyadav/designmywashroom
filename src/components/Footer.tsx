import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Mail, Phone, MapPin } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">Design Your Dream Space</h3>
            <p className="text-primary-foreground/80 max-w-xs">
              Transform your washroom into a beautiful and functional space with our premium design and estimation services.
            </p>
            <div className="flex space-x-4 pt-2">
              <SocialIcon href="#" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="mt-1 mr-3 text-primary-foreground/80">
                  <MapPin size={18} />
                </div>
                <span className="text-primary-foreground/80">3rd Floor, Orchid Centre, Golf Course Road, near IILM Institute, Sector 53, Gurugram, Haryana 122002</span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 text-primary-foreground/80">
                  <Phone size={18} />
                </div>
                <a href="tel:+919876543210" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center">
                <div className="mr-3 text-primary-foreground/80">
                  <Mail size={18} />
                </div>
                <a href="mailto:info@dreamspace.com" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  info@dreamspace.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/70 text-sm">
              © {new Date().getFullYear()} Design Your Dream Space. All rights reserved.
            </p>
            <p className="text-primary-foreground/70 text-sm mt-3 md:mt-0">
              Designed with passion for transforming spaces
            </p>
          </div>
        </div>
      </div>
    </footer>;
};
interface FooterLinkProps {
  to: string;
  label: string;
}
const FooterLink = ({
  to,
  label
}: FooterLinkProps) => <li>
    <Link to={to} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-300 flex items-center">
      <ChevronRight size={16} className="mr-1" />
      <span>{label}</span>
    </Link>
  </li>;
interface SocialIconProps {
  href: string;
  children: React.ReactNode;
  'aria-label': string;
}
const SocialIcon = ({
  href,
  children,
  ...props
}: SocialIconProps) => <a href={href} className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors duration-300" {...props}>
    {children}
  </a>;
export default Footer;