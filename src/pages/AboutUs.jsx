import { Shield, Sparkles, Award, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFrontendT } from '../context/LanguageContext';

export const AboutUs = () => {
  const { T } = useFrontendT();

  const stats = [
    { number: '500+', label: T('about.devicesListed') },
    { number: '99.2%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'Specs Research' },
    { number: '100%', label: 'Official Sources' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Authenticity Promised',
      desc: 'Every product displayed on our catalog is sourced from official brand databases, ensuring 100% authentic device specifications and details.',
    },
    {
      icon: Sparkles,
      title: 'Instant Updates',
      desc: 'We sync directly with brand announcements to ensure our listings, specifications, and pricing cards are updated in real-time.',
    },
    {
      icon: Award,
      title: 'Accurate Pricing',
      desc: 'We track and update smartphone pricing trends to ensure you see the most accurate market prices and active promotional drops.',
    },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold tracking-widest text-brand-primary uppercase">{T('about.mission')}</span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-2 mb-6">
            {T('about.title')}
          </h1>
          <p className="text-base text-light-muted dark:text-dark-muted leading-relaxed font-normal">
            Founded with the vision to make flagship smartphones accessible, AeroMobile is an authorized retail partner for leading global brands. We bridge the gap between premium technological releases and mobile shoppers.
          </p>
        </section>

        {/* Core Values */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">The AeroMobile Difference</h2>
            <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mt-1">Our core values drive our selection and client support strategies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-3"
                >
                  <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl w-fit">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-light-text dark:text-dark-text">{v.title}</h3>
                  <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-8 sm:p-12 mb-20 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-light-text dark:text-dark-text">
            {stats.map((s, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-brand-primary dark:text-brand-secondary">{s.number}</span>
                <span className="text-xs sm:text-sm text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Narrative */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold tracking-widest text-brand-primary uppercase">Authorized Partnership</span>
            <h2 className="text-3xl font-semibold tracking-tight mt-1 mb-4">Official Brand Distributors</h2>
            <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed mb-6 font-normal">
              We track specifications and details from official brand databases to bring you immediate access to global smartphone releases. Our product catalogs represent accurate and verified details, helping you research and compare devices.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-light-text dark:text-dark-text">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-brand-secondary" />
                <span>Original Packing Only</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-secondary" />
                <span>Zero Refurbished Stock</span>
              </span>
            </div>
          </div>
          <div className="relative aspect-video rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden p-2 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&auto=format&fit=crop&q=80"
              alt="storefront-stock"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </section>

      </div>
    </div>
  );
};
