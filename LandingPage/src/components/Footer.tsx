import { Github, Twitter, Instagram, Mail } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Web App (Soon)', href: '#' },
      { name: 'Android App', href: '#download' },
      { name: 'Experience', href: '#experience' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '#about' },
      { name: 'Privacy Policy', href: '/privacy.html' },
      { name: 'Terms of Service', href: '/terms.html' },
      { name: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'GitHub Issues', href: 'https://github.com/sayyidrafidalhadi/HalalTune/issues' },
      { name: 'Contact', href: 'mailto:halaltune@gmail.com' },
      { name: 'Community', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-black pt-24 pb-12 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <a href="#home" className="flex items-center gap-3 mb-6">
              <img 
                src="https://res.cloudinary.com/dcidrwk1e/image/upload/q_auto/f_auto/v1779859113/file_000000009a1871fa93688d58eab7a8b7_dnwrpa.png" 
                alt="HalalTune" 
                className="w-10 h-10 rounded-xl" 
              />
              <span className="text-2xl font-bold tracking-tight text-white">
                HalalTune
              </span>
            </a>
            <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
              The premium Islamic audio experience. Curated nasheeds, Quran recitations, and spiritually aligned listening.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Github, href: 'https://github.com/sayyidrafidalhadi' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Mail, href: 'mailto:halaltune@gmail.com' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((column, i) => (
            <div key={i}>
              <h4 className="text-white font-bold mb-6">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="text-zinc-500 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} HalalTune. Built for the Muslim community.
          </p>
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
