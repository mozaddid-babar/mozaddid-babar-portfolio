import React, { useState } from 'react';
import { Mail, MapPin, Smartphone, Building, Phone, Github, Linkedin, Facebook, Twitter, Instagram, GraduationCap, Code, FileText, FlaskConical, Send } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { Profile, DynamicContact, DynamicSocial, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';
import { submitContactMessage } from '../api';

interface ContactSectionProps {
  profile?: Profile;
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) return Github;
  if (p.includes('linkedin')) return Linkedin;
  if (p.includes('facebook')) return Facebook;
  if (p.includes('twitter') || p === 'x') return Twitter;
  if (p.includes('instagram')) return Instagram;
  if (p.includes('scholar')) return GraduationCap;
  if (p.includes('leetcode')) return Code;
  if (p.includes('orcid')) return FileText;
  if (p.includes('research')) return FlaskConical;
  return Mail;
};

const getBrandStyle = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) return { bg: '#181717', color: '#fff' };
  if (p.includes('linkedin')) return { bg: '#0A66C2', color: '#fff' };
  if (p.includes('scholar')) return { bg: '#4285F4', color: '#fff' };
  if (p.includes('orcid')) return { bg: '#A6CE39', color: '#111' };
  if (p.includes('leetcode')) return { bg: '#1A1A1A', color: '#FFA116' };
  if (p.includes('research')) return { bg: '#00CCBB', color: '#113333' };
  if (p.includes('facebook')) return { bg: '#1877F2', color: '#fff' };
  if (p.includes('twitter') || p === 'x') return { bg: '#000000', color: '#fff' };
  if (p.includes('instagram')) return { bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' };
  return { bg: '#454C8C', color: '#fff' };
};

const getContactIcon = (iconName: string) => {
  if (iconName === 'Mail') return Mail;
  if (iconName === 'MapPin') return MapPin;
  if (iconName === 'Building') return Building;
  if (iconName === 'Phone') return Phone;
  if (iconName === 'Smartphone') return Smartphone;
  return Mail;
};

export const ContactSection: React.FC<ContactSectionProps> = ({ profile, isAlt = false, sectionConfig }) => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [hoveredSocialId, setHoveredSocialId] = useState<string | null>(null);

  const contacts = profile?.contactFields?.filter(c => c.showInFrontend !== false && c.value && c.value.trim() !== '') || [];
  const socials = profile?.socialLinks?.filter(s => s.showInFrontend !== false && s.url && s.url.trim() !== '') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitContactMessage(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Get In Touch"
          defaultTopText="COMMUNICATION & INQUIRIES"
          defaultDescription="Reach out for research collaborations, doctoral queries, technical consultations, or speaking opportunities."
          icon={Send}
          theme="teal"
          titleGradientNode={
            <>
              Get In{' '}
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-500 bg-clip-text text-transparent dark:from-teal-400 dark:via-emerald-300 dark:to-cyan-400">
                Touch
              </span>
            </>
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 [perspective:1400px]">

          {/* Left Panel - Opposite Left Convergence */}
          <ScrollReveal direction="opposite-left" bidirectional delay={0.05} className="lg:col-span-5 h-full">
            <div className="rounded-[14px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-[#0F211F] dark:bg-[#061311] border border-emerald-900/30 dark:border-slate-800 p-8 sm:p-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="relative flex items-center justify-center w-[14px] h-[14px]">
                    <span className="absolute w-full h-full rounded-full bg-[#2FD9B8] opacity-40 animate-ping" style={{ animationDuration: '2s' }}></span>
                    <span className="relative w-[7px] h-[7px] rounded-full bg-[#2FD9B8]"></span>
                  </div>
                  <span className="text-[#2FD9B8] font-bold text-sm tracking-wide uppercase">Available for opportunities</span>
                </div>

                <div className="space-y-0">
                  {contacts.map((contact, idx) => {
                    const Icon = getContactIcon(contact.icon || 'Mail');
                    return (
                      <div key={contact.id} className={`group flex items-start gap-4 py-4 sm:py-5 border-b border-white/5 transition-all duration-300 hover:pl-[6px] ${idx === 0 ? 'border-t' : ''}`}>
                        <div className="w-[30px] h-[30px] rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#5FD9C0]" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold uppercase text-[#7FA69D] tracking-wider mb-1">{contact.title}</div>
                          <div className="text-[15px] font-medium text-[#E3F1EE]">{contact.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social Buttons */}
              {socials.length > 0 && (
                <div 
                  className="mt-10 flex flex-wrap gap-2.5 items-center"
                  onMouseLeave={() => setHoveredSocialId(null)}
                >
                  {socials.map((social) => {
                    const Icon = getPlatformIcon(social.platform);
                    const brand = getBrandStyle(social.platform);
                    const isHovered = hoveredSocialId === social.id;

                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group/btn relative shrink-0 flex items-center h-[34px] rounded-[10px] border transition-all duration-300 ease-out overflow-hidden ${
                          isHovered 
                            ? 'border-transparent shadow-lg' 
                            : 'bg-white/10 border-white/10 hover:border-transparent hover:shadow-lg'
                        }`}
                        style={{
                          background: isHovered ? brand.bg : 'rgba(255,255,255,0.1)',
                          '--hover-bg': brand.bg,
                          '--hover-color': brand.color
                        } as React.CSSProperties}
                        onMouseEnter={() => setHoveredSocialId(social.id)}
                      >
                        <div 
                          className="w-[34px] h-[34px] flex items-center justify-center shrink-0 z-10 transition-colors duration-300" 
                          style={{ color: isHovered ? brand.color : '#7FA69D' }}
                        >
                          <Icon className="w-4 h-4 text-inherit transition-colors duration-300" />
                        </div>
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${
                            isHovered ? 'max-w-[220px] opacity-100' : 'max-w-0 opacity-0 group-hover/btn:max-w-[220px] group-hover/btn:opacity-100'
                          }`}
                        >
                          <span 
                            className="whitespace-nowrap text-[13px] font-semibold pr-3"
                            style={{ color: brand.color }}
                          >
                            {social.platform}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Right Panel - Opposite Right Convergence */}
          <ScrollReveal direction="opposite-right" bidirectional delay={0.12} className="lg:col-span-7 h-full">
            <div className="rounded-[14px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 flex flex-col h-full">
              <div className="mb-8">
                <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-1.5">Send a Direct Message</h2>
                <p className="text-[14px] text-slate-500 dark:text-slate-400">Messages are securely stored and forwarded to the administrator.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Your Full Name *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0E8F7A] transition-colors"
                      placeholder="e.g. Dr. Alexander Smith"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Your Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0E8F7A] transition-colors"
                      placeholder="alexander@university.edu"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subject / Research Topic</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0E8F7A] transition-colors"
                    placeholder="e.g. NLP Research Collaboration / PhD Inquiry"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0E8F7A] transition-colors resize-none"
                    placeholder="Please write your inquiry or research proposal here..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="group inline-flex items-center justify-center px-6 py-3.5 bg-[#0E8F7A] hover:bg-[#0B7565] text-white font-bold rounded-[8px] transition-all duration-250 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="mr-2.5">
                      {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Sent!' : status === 'error' ? 'Error' : 'Send Message'}
                    </span>
                    <Send className="w-[18px] h-[18px] transition-transform duration-250 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
