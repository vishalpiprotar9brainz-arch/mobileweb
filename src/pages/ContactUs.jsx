import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { dbService } from '../firebase';
import { useToast } from '../components/Toast';
import { useFrontendT } from '../context/LanguageContext';

export const ContactUs = () => {
  const { showToast } = useToast();
  const { T } = useFrontendT();

  const [settings, setSettings] = useState({
    storeName: 'AeroMobile Store',
    email: 'support@aeromobile.com',
    phone: '+1 (800) 555-MOBI',
    address: '742 Evergreen Terrace, Cupertino, CA 95014',
  });

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = dbService.subscribeSettings((data) => {
      if (data) setSettings(data);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill in all required fields (Name, Email, Message)', 'warning');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      showToast(T('contact.successMsg'), 'success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1200);
  };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-light-text dark:text-dark-text';

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-widest text-brand-primary uppercase">Support Center</span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-1 mb-2">{T('contact.title')}</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted font-normal">{T('contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Info Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Contact Channels</h2>
              <ul className="flex flex-col gap-5 text-sm font-medium">
                <li className="flex gap-4">
                  <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary w-fit h-fit">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs text-light-muted dark:text-dark-muted uppercase font-semibold tracking-wide">{T('contact.phone')}</h3>
                    <p className="text-sm text-light-text dark:text-dark-text mt-0.5">{settings.phone}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary w-fit h-fit">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs text-light-muted dark:text-dark-muted uppercase font-semibold tracking-wide">{T('contact.email')}</h3>
                    <p className="text-sm text-light-text dark:text-dark-text mt-0.5 break-all">{settings.email}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary w-fit h-fit">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs text-light-muted dark:text-dark-muted uppercase font-semibold tracking-wide">Headquarters</h3>
                    <p className="text-sm text-light-text dark:text-dark-text mt-0.5 leading-relaxed">{settings.address}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex gap-4">
              <div className="p-2.5 rounded-xl bg-brand-secondary/10 text-brand-secondary w-fit h-fit">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm">
                <h3 className="font-semibold text-light-text dark:text-dark-text mb-1.5">Business Hours</h3>
                <p className="text-light-muted dark:text-dark-muted font-normal mb-1">Monday – Friday: 9:00 AM – 7:00 PM</p>
                <p className="text-light-muted dark:text-dark-muted font-normal">Saturday: 10:00 AM – 4:00 PM (EST)</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-primary" />
              <span>Leave an Online Query</span>
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="font-medium text-light-text dark:text-dark-text">{T('contact.name')} *</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder={T('contact.namePlaceholder')} required className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-medium text-light-text dark:text-dark-text">{T('contact.email')} *</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder={T('contact.emailPlaceholder')} required className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="font-medium text-light-text dark:text-dark-text">{T('contact.phone')}</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder={T('contact.phonePlaceholder')} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="font-medium text-light-text dark:text-dark-text">Subject</label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Specifications query..." className={inputClass} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="font-medium text-light-text dark:text-dark-text">{T('contact.message')} *</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder={T('contact.messagePlaceholder')} rows="5" required className={`${inputClass} resize-none`} />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-fit px-6 py-3 rounded-full bg-brand-primary text-white font-medium flex items-center justify-center gap-2 hover:bg-brand-primary/90 hover:shadow-lg shadow-brand-primary/20 transition-all cursor-pointer self-end disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{submitting ? T('contact.sending') : T('contact.send')}</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
