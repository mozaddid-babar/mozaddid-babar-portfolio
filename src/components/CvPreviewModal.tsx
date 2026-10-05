import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { PortfolioData, DEFAULT_SECTIONS, DEFAULT_CV_TITLES, SectionConfig } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { replaceOklchInString, oklchToRgb } from '../utils/colorUtils';

/**
 * Generates and downloads a pristine, professional PDF directly using jsPDF + html2canvas.
 * Guarantees:
 * 1. Zero browser headers, footers, timestamps, or file paths (unlike window.print()).
 * 2. Minimum 18mm top and bottom margins on every page.
 * 3. Exact vertical alignment of section headings between two border lines.
 * 4. Interactive clickable PDF links for DOIs, emails, profiles, and urls.
 * 5. Lossless PNG slicing for crisp typography and authentic color fidelity.
 */
export async function generateCvPdfFromElement(
  element: HTMLElement,
  cleanDocTitle: string,
  onProgress?: (inProgress: boolean) => void
): Promise<void> {
  if (!element) return;
  onProgress?.(true);

  const prevShadow = element.style.boxShadow;
  const prevBorder = element.style.border;
  const prevRadius = element.style.borderRadius;
  const prevWidth = element.style.width;
  const prevMaxWidth = element.style.maxWidth;
  const prevPadding = element.style.padding;

  // Standardize to exact A4 dimensions during render so scaling is 1:1 with real 11pt/12pt fonts
  element.style.boxShadow = 'none';
  element.style.border = 'none';
  element.style.borderRadius = '0';
  element.style.width = '794px';
  element.style.maxWidth = '794px';
  element.style.padding = '18mm 20mm';

  try {
    // Ensure all web/system fonts are fully loaded before capturing to preserve spaces
    if ((document as any).fonts && (document as any).fonts.ready) {
      await (document as any).fonts.ready;
    }

    // Collect all interactive links and their client rects before rasterization
    const linkNodes = Array.from(element.querySelectorAll('a[href]')) as HTMLAnchorElement[];
    const preCaptureElemRect = element.getBoundingClientRect();
    const rawLinks = linkNodes.map(node => {
      const rect = node.getBoundingClientRect();
      return {
        href: node.href,
        relLeft: (rect.left - preCaptureElemRect.left) / preCaptureElemRect.width,
        relTop: (rect.top - preCaptureElemRect.top) / preCaptureElemRect.height,
        relWidth: rect.width / preCaptureElemRect.width,
        relHeight: rect.height / preCaptureElemRect.height
      };
    });

    const renderPromise = (html2canvas as any)(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 5000,
      ignoreElements: (el: Element) => {
        if (el.id === 'main-sections-container' || el.tagName === 'HEADER' || el.tagName === 'FOOTER' || el.tagName === 'MAIN') {
          return true;
        }
        if (el.hasAttribute && el.hasAttribute('data-html2canvas-ignore')) {
          return true;
        }
        return false;
      },
      onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
        // 1. Sanitize all <style> tags in cloned document
        clonedDoc.querySelectorAll('style').forEach(style => {
          if (style.textContent && style.textContent.includes('oklch')) {
            style.textContent = replaceOklchInString(style.textContent);
          }
        });

        // 2. Convert <link rel="stylesheet"> with oklch into sanitized inline <style> tags
        const links = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of links) {
          try {
            const href = (link as HTMLLinkElement).href;
            const sheet = Array.from(document.styleSheets).find(s => s.href === href);
            if (sheet) {
              try {
                const rules = Array.from(sheet.cssRules).map(r => r.cssText).join('\n');
                if (rules && rules.includes('oklch')) {
                  const style = clonedDoc.createElement('style');
                  style.textContent = replaceOklchInString(rules);
                  link.parentNode?.replaceChild(style, link);
                }
              } catch {
                // Cross-origin stylesheet security barrier, keep link
              }
            }
          } catch { }
        }

        // 3. Set clean base styles on cloned document
        if (clonedDoc.body) {
          clonedDoc.body.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.color = '#000000';
        }
        if (clonedEl) {
          clonedEl.style.backgroundColor = '#ffffff';
          clonedEl.style.color = '#000000';
        }

        // 4. Sanitize all elements: inline styles and computed color properties
        const colorProps = [
          'color',
          'backgroundColor',
          'borderColor',
          'borderTopColor',
          'borderBottomColor',
          'borderLeftColor',
          'borderRightColor',
          'textDecorationColor',
          'outlineColor',
          'fill',
          'stroke'
        ];

        clonedDoc.querySelectorAll('*').forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style) {
            for (let i = 0; i < htmlEl.style.length; i++) {
              const prop = htmlEl.style[i];
              const val = htmlEl.style.getPropertyValue(prop);
              if (val && val.includes('oklch')) {
                htmlEl.style.setProperty(prop, replaceOklchInString(val));
              }
            }
          }

          try {
            const computed = window.getComputedStyle(htmlEl);
            for (const prop of colorProps) {
              const val = (computed as any)[prop];
              if (val && typeof val === 'string' && val.includes('oklch')) {
                (htmlEl.style as any)[prop] = oklchToRgb(val);
              }
            }
          } catch { }
        });

        // 5. Fix html2canvas FontMetrics baseline calculation bug caused by Tailwind preflight (img { display: block })
        // When img is display: block, html2canvas's temporary measurement img breaks to a new line,
        // inflating the font baseline by ~6-8px and causing text in bordered containers to crash into bottom borders.
        const imgFixStyle = clonedDoc.createElement('style');
        imgFixStyle.textContent = `
          img {
            display: inline-block !important;
          }
        `;
        clonedDoc.head.appendChild(imgFixStyle);

        // 6. Enforce precise vertical centering for all section headings in cloned document
        clonedDoc.querySelectorAll('.cv-section-heading').forEach((heading: Element) => {
          const el = heading as HTMLElement;
          el.style.display = 'block';
          el.style.borderTop = '1px solid #000000';
          el.style.borderBottom = '1px solid #000000';
          el.style.borderLeft = 'none';
          el.style.borderRight = 'none';
          el.style.paddingTop = '2.5px';
          el.style.paddingBottom = '3.5px';
          el.style.marginTop = '16px';
          el.style.marginBottom = '10px';
          el.style.fontFamily = '"Times New Roman", Times, Georgia, serif';
          el.style.fontSize = '15px';
          el.style.fontWeight = '700';
          el.style.lineHeight = '1';
          el.style.letterSpacing = '0px';
          el.style.color = '#000000';
          el.style.boxSizing = 'border-box';
          el.style.textAlign = 'left';
        });
      }
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('PDF generation timed out waiting for external resources')), 15000)
    );

    const canvas = await Promise.race([renderPromise, timeoutPromise]) as HTMLCanvasElement;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Exact pixel per millimeter ratio for A4 width (210mm)
    const pxPerMm = canvasWidth / 210;
    const pxToMm = 210 / canvasWidth;
    const fullPageCanvasHeight = Math.round(297 * pxPerMm);
    const topPadSubsequentPx = Math.round(18 * pxPerMm);

    // Find all CV items to avoid splitting across page boundaries
    const elementRect = element.getBoundingClientRect();
    const scaleY = canvasHeight / elementRect.height;
    const itemNodes = Array.from(
      element.querySelectorAll('.cv-item-block, .cv-section-heading, .cv-header-block, p, li')
    ) as HTMLElement[];

    const items = itemNodes.map(node => {
      const rect = node.getBoundingClientRect();
      const top = (rect.top - elementRect.top) * scaleY;
      const bottom = (rect.bottom - elementRect.top) * scaleY;
      const isHeading = node.classList.contains('cv-section-heading');
      return { top, bottom, height: bottom - top, isHeading };
    }).filter(item => item.height > 0);

    // Map links into absolute canvas pixel coordinates
    const mappedLinks = rawLinks.map(l => ({
      href: l.href,
      topPx: l.relTop * canvasHeight,
      bottomPx: (l.relTop + l.relHeight) * canvasHeight,
      leftPx: l.relLeft * canvasWidth,
      widthPx: l.relWidth * canvasWidth,
      heightPx: l.relHeight * canvasHeight
    }));

    // Calculate clean page slices with >=18mm top and bottom margins on every page
    const pageSlices: { startY: number; endY: number; isFirstPage: boolean }[] = [];
    let currentY = 0;
    let pageIndex = 0;

    while (currentY < canvasHeight) {
      const isFirst = pageIndex === 0;
      // On page 1: 18mm top padding is built into the element canvas. Target height is 279mm (leaving 18mm at bottom).
      // On page 2+: 18mm top padding is added at render time. Target height is 261mm (leaving 18mm at bottom).
      const maxContentHeight = isFirst
        ? Math.round((297 - 18) * pxPerMm)
        : Math.round((297 - 36) * pxPerMm);

      const targetY = currentY + maxContentHeight;

      if (targetY >= canvasHeight) {
        pageSlices.push({ startY: currentY, endY: canvasHeight, isFirstPage: isFirst });
        break;
      }

      let cutY = targetY;

      // Check if targetY cuts right through an item or within 6mm safety margin of its bottom
      const crossingItem = items.find(
        item => item.top < targetY && item.bottom > (targetY - 6 * pxPerMm)
      );
      if (crossingItem && crossingItem.top > currentY + (35 * pxPerMm)) {
        cutY = crossingItem.top - 10;
      }

      // Avoid orphan headings near the bottom of the page (within 28mm of bottom)
      const orphanHeading = items.find(
        item => item.isHeading && item.top < cutY && item.bottom > (cutY - 28 * pxPerMm)
      );
      if (orphanHeading && orphanHeading.top > currentY + (35 * pxPerMm)) {
        cutY = orphanHeading.top - 10;
      }

      // Safety fallback to guarantee forward progress
      if (cutY <= currentY + (25 * pxPerMm)) {
        cutY = targetY;
      }

      pageSlices.push({ startY: currentY, endY: cutY, isFirstPage: isFirst });
      currentY = cutY;
      pageIndex++;
    }

    // Render each slice onto a full A4 canvas and add to PDF (using lossless PNG for exact colors)
    for (let i = 0; i < pageSlices.length; i++) {
      const { startY, endY, isFirstPage } = pageSlices[i];
      const sliceHeight = endY - startY;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = fullPageCanvasHeight;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Page 1 has top padding baked in; subsequent pages get topPadSubsequentPx (18mm)
        const destY = isFirstPage ? 0 : topPadSubsequentPx;

        ctx.drawImage(
          canvas,
          0,
          startY,
          canvasWidth,
          sliceHeight,
          0,
          destY,
          canvasWidth,
          sliceHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/png');

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(pageImgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

      // Add real interactive clickable PDF hyperlinks for every link falling on this page slice
      const destY = isFirstPage ? 0 : topPadSubsequentPx;
      for (const link of mappedLinks) {
        if (link.topPx >= startY && link.topPx < endY) {
          const yInSlicePx = (link.topPx - startY) + destY;
          const xMm = link.leftPx * pxToMm;
          const yMm = yInSlicePx * pxToMm;
          const wMm = link.widthPx * pxToMm;
          const hMm = link.heightPx * pxToMm;

          pdf.setPage(i + 1);
          pdf.link(xMm, yMm, wMm, hMm, { url: link.href });
        }
      }
    }

    pdf.save(`${cleanDocTitle}.pdf`);
  } catch (err: any) {
    console.error('Direct PDF download error:', err);
    alert('Could not download PDF automatically: ' + (err.message || 'Unknown error') + '. Please try again.');
  } finally {
    element.style.boxShadow = prevShadow;
    element.style.border = prevBorder;
    element.style.borderRadius = prevRadius;
    element.style.width = prevWidth;
    element.style.maxWidth = prevMaxWidth;
    element.style.padding = prevPadding;
    onProgress?.(false);
  }
}

/**
 * Printable Academic CV Document Content.
 * Reusable between modal preview and off-screen PDF export.
 */
export const CvDocumentContent: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const { profile } = data;
  const sections = data.sections || DEFAULT_SECTIONS;
  const cvSections = sections.filter(s => s.showInCv !== false);

  // Helper to highlight candidate name in author list (e.g. Babar, Mozaddid)
  const renderFormattedAuthors = (authors: string) => {
    if (!authors) return null;
    const nameParts = profile.name.split(' ');
    const lastName = nameParts[nameParts.length - 1]; // e.g. Babar
    const regex = new RegExp(`(${lastName}|M\\.?\\s*U\\.?\\s*H\\.?\\s*Babar|MUH Babar|Babar,?\\s*M\\.?|${profile.name})`, 'gi');

    const parts = authors.split(regex);
    return (
      <span>
        {parts.map((part, i) => {
          if (regex.test(part)) {
            return (
              <span key={i} className="font-bold underline decoration-[#94a3b8] text-[#0f172a]">
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  // Helper to render section headings perfectly centered vertically between two horizontal lines
  const renderSectionHeading = (title: string) => (
    <h2
      className="cv-section-heading font-bold text-black tracking-normal text-left"
      style={{
        display: 'block',
        borderTop: '1px solid #000000',
        borderBottom: '1px solid #000000',
        borderLeft: 'none',
        borderRight: 'none',
        paddingTop: '2.5px',
        paddingBottom: '3.5px',
        marginTop: '16px',
        marginBottom: '10px',
        fontFamily: '"Times New Roman", Times, Georgia, serif',
        fontSize: '15px',
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: '0px',
        color: '#000000',
        boxSizing: 'border-box',
        textAlign: 'left'
      }}
    >
      {title}
    </h2>
  );

  // Helper to resolve dynamic section title for CV
  const getSectionCvHeading = (sec: SectionConfig, fallbackKey: string): string => {
    if (sec.cvTitle && sec.cvTitle.trim()) {
      return sec.cvTitle.trim();
    }
    return DEFAULT_CV_TITLES[fallbackKey] || sec.title || fallbackKey;
  };

  // Calculate research impact metrics from active publications
  const allCvPubs = (data.publications || []).filter(p => p.showInCv !== false);
  const journalPubs = allCvPubs.filter(p => p.category === 'Journal');
  const conferencePubs = allCvPubs.filter(p => p.category === 'Conference');
  const preprintPubs = allCvPubs.filter(p => p.category !== 'Journal' && p.category !== 'Conference');

  // Structure links in two columns, and address in the last row
  const contactLinks: { label: string; value: React.ReactNode }[] = [];
  const seenTypes = new Set<string>();

  // 1. Dynamic Contact Channels
  const contactFields = profile.contactFields || [];

  const emailField = contactFields.find(c =>
    c.title.toLowerCase().trim() === 'email' ||
    (c.value && c.value.toLowerCase() === (profile.email || '').toLowerCase())
  );
  if (emailField) {
    if (emailField.showInCv !== false && emailField.value) {
      contactLinks.push({
        label: 'Email',
        value: <a href={`mailto:${emailField.value}`} className="text-[#1e40af] hover:underline">{emailField.value}</a>
      });
    }
    seenTypes.add('email');
  } else if (profile.email) {
    contactLinks.push({
      label: 'Email',
      value: <a href={`mailto:${profile.email}`} className="text-[#1e40af] hover:underline">{profile.email}</a>
    });
    seenTypes.add('email');
  }

  const phoneField = contactFields.find(c =>
    c.title.toLowerCase().includes('phone') ||
    c.title.toLowerCase().includes('mobile') ||
    (c.value && c.value === profile.phone)
  );
  if (phoneField) {
    if (phoneField.showInCv !== false && phoneField.value) {
      contactLinks.push({
        label: 'Phone',
        value: <span>{phoneField.value}</span>
      });
    }
    seenTypes.add('phone');
  } else if (profile.phone) {
    contactLinks.push({
      label: 'Phone',
      value: <span>{profile.phone}</span>
    });
    seenTypes.add('phone');
  }

  // 2. Academic Profiles & Social Handles
  if (profile.socialLinks && profile.socialLinks.length > 0) {
    profile.socialLinks.forEach(item => {
      if (!item.url || !item.url.trim() || item.showInCv === false) {
        return;
      }

      const pLower = item.platform.toLowerCase().trim();
      let label = item.platform;
      let displayNode: React.ReactNode;

      if (pLower.includes('website') || pLower.includes('profile link') || pLower.includes('portfolio')) {
        label = 'Profile link';
        displayNode = <a href={item.url} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">{item.url}</a>;
      } else if (pLower.includes('scholar')) {
        label = 'Google Scholar';
        displayNode = <a href={item.url} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">Scholar Profile</a>;
      } else if (pLower.includes('orcid')) {
        label = 'ORCID';
        const orcidHref = item.url.startsWith('http') ? item.url : `https://orcid.org/${item.url}`;
        displayNode = <a href={orcidHref} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">{item.url.replace(/^https?:\/\/orcid\.org\//, '')}</a>;
      } else if (pLower.includes('linkedin')) {
        label = 'LinkedIn';
        displayNode = <a href={item.url} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">LinkedIn Profile</a>;
      } else if (pLower.includes('github')) {
        label = 'GitHub';
        displayNode = <a href={item.url} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">GitHub Profile</a>;
      } else if (pLower.includes('researchgate')) {
        label = 'ResearchGate';
        displayNode = <a href={item.url} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">ResearchGate Profile</a>;
      } else {
        label = item.platform;
        displayNode = <a href={item.url} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">{item.url.replace(/^https?:\/\/(www\.)?/, '')}</a>;
      }

      contactLinks.push({
        label,
        value: displayNode
      });
    });
  }

  // 3. Fallback contact accounts
  if (profile.social) {
    if (profile.social.linkedin && !contactLinks.some(l => l.label === 'LinkedIn')) {
      contactLinks.push({
        label: 'LinkedIn',
        value: <a href={profile.social.linkedin} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">LinkedIn Profile</a>
      });
    }
    if (profile.social.github && !contactLinks.some(l => l.label === 'GitHub')) {
      contactLinks.push({
        label: 'GitHub',
        value: <a href={profile.social.github} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">GitHub Profile</a>
      });
    }
    if (profile.social.scholar && !contactLinks.some(l => l.label === 'Google Scholar')) {
      contactLinks.push({
        label: 'Google Scholar',
        value: <a href={profile.social.scholar} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">Scholar Profile</a>
      });
    }
    if (profile.social.orcid && !contactLinks.some(l => l.label === 'ORCID')) {
      const orcidHref = profile.social.orcid.startsWith('http') ? profile.social.orcid : `https://orcid.org/${profile.social.orcid}`;
      contactLinks.push({
        label: 'ORCID',
        value: <a href={orcidHref} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">{profile.social.orcid.replace(/^https?:\/\/orcid\.org\//, '')}</a>
      });
    }
  }

  // 4. Custom Contact Channels
  contactFields
    .filter(c => {
      if (c.showInCv === false || !c.value) return false;
      const t = c.title.toLowerCase();
      if (t.includes('location') || t.includes('address')) return false;
      if (seenTypes.has('email') && (t === 'email' || (c.value && c.value.toLowerCase() === (profile.email || '').toLowerCase()))) return false;
      if (seenTypes.has('phone') && (t.includes('phone') || t.includes('mobile') || (c.value && c.value === profile.phone))) return false;
      return true;
    })
    .forEach(c => {
      contactLinks.push({
        label: c.title,
        value: <span>{c.value}</span>
      });
    });

  // 5. Address Extraction
  const locationField = contactFields.find(c =>
    c.title.toLowerCase().includes('location') ||
    c.title.toLowerCase().includes('address')
  );

  let addressText: string | null = null;
  if (locationField) {
    if (locationField.showInCv !== false && locationField.value) {
      addressText = locationField.value;
    }
  } else if (profile.location) {
    addressText = profile.location;
  }

  return (
    <>
      {/* Header: Left-aligned academic layout */}
      <div className="cv-header-block mb-4 text-left">
        <h1 className="text-2xl sm:text-[28px] font-bold font-serif text-black tracking-normal text-left">
          {profile.name}
        </h1>

        {/* Academic Target / Subtitle (Customizable via Hero CV Title in Admin) */}
        {(() => {
          const heroSec = sections.find(s => s.id === 'hero');
          const heroCvSubtitle = heroSec?.cvTitle?.trim();
          const subtitle = heroCvSubtitle || profile.headline || profile.title;
          return subtitle ? (
            <p className="text-[15px] font-serif font-bold text-black mt-1 text-left">
              {subtitle}
            </p>
          ) : null;
        })()}
        {(profile.department || profile.affiliation) && (
          <p className="text-[14px] font-serif text-black mt-0.5 text-left">
            {profile.department ? `${profile.department}, ` : ''}{profile.affiliation}
          </p>
        )}

        {/* Contact Links in Two Columns per row, Address in the Last Row */}
        <div className="mt-3 pt-2 text-[13.5px] font-serif text-black border-t border-[#cbd5e1] text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-left">
            {contactLinks.map((item, idx) => (
              <div key={idx} className="flex items-baseline gap-1.5 min-w-0">
                <span className="font-bold text-black whitespace-nowrap">{item.label}:</span>
                <span className="text-black break-words">{item.value}</span>
              </div>
            ))}
          </div>
          {addressText && (
            <div className="mt-1.5 pt-1.5 border-t border-[#e2e8f0] text-left flex items-baseline gap-1.5">
              <span className="font-bold text-black whitespace-nowrap">Address:</span>
              <span className="text-black break-words">{addressText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Sections Container in Configured Order */}
      <div className="space-y-4">
        {cvSections.map(sec => {
          switch (sec.id) {

            // 1. RESEARCH PROFILE / INTERESTS
            case 'about': {
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'about'))}
                  <div className="cv-item-block font-serif text-[14px] text-black leading-[1.6] space-y-2 text-left">
                    {profile.aboutText && profile.aboutText.length > 0 ? (
                      profile.aboutText.map((p, idx) => <p key={idx}>{p}</p>)
                    ) : (
                      <p>{profile.bio}</p>
                    )}
                  </div>
                </div>
              );
            }

            // 2. PUBLICATIONS
            case 'publications': {
              if (allCvPubs.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'publications'))}

                  {/* Refereed Journal Articles */}
                  {journalPubs.length > 0 && (
                    <div className="mb-3.5">
                      <h3 className="font-serif font-bold text-[14px] text-black mb-1.5">
                        Journal articles:
                      </h3>
                      <div className="space-y-3 font-serif text-[13.5px] text-black leading-[1.55] tracking-normal text-left">
                        {journalPubs.map((pub, idx) => (
                          <div key={pub.id} className="cv-item-block flex gap-2">
                            <span className="font-semibold text-black select-none flex-shrink-0">
                              {idx + 1}.
                            </span>
                            <div>
                              {renderFormattedAuthors(pub.authors)} ({pub.year}). {pub.title}. <span className="italic">{pub.venue}</span>.{' '}
                              {pub.doi && (
                                <a href={`https://doi.org/${pub.doi.replace(/^https?:\/\/doi\.org\//, '')}`} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">
                                  DOI: {pub.doi}
                                </a>
                              )}
                              {pub.citations !== undefined && pub.citations > 0 && (
                                <span className="ml-1 text-[12px] font-medium text-[#065f46]">
                                  [{pub.citations} Citations]
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Peer-Reviewed Conference Proceedings */}
                  {conferencePubs.length > 0 && (
                    <div className="mb-3.5">
                      <h3 className="font-serif font-bold text-[14px] text-black mb-1.5">
                        Conference proceedings:
                      </h3>
                      <div className="space-y-3 font-serif text-[13.5px] text-black leading-[1.55] tracking-normal text-left">
                        {conferencePubs.map((pub, idx) => (
                          <div key={pub.id} className="cv-item-block flex gap-2">
                            <span className="font-semibold text-black select-none flex-shrink-0">
                              {idx + 1}.
                            </span>
                            <div>
                              {renderFormattedAuthors(pub.authors)} ({pub.year}). {pub.title}. <span className="italic">{pub.venue}</span>.{' '}
                              {pub.doi && (
                                <a href={`https://doi.org/${pub.doi.replace(/^https?:\/\/doi\.org\//, '')}`} target="_blank" rel="noreferrer" className="text-[#1e40af] hover:underline">
                                  DOI: {pub.doi}
                                </a>
                              )}
                              {pub.citations !== undefined && pub.citations > 0 && (
                                <span className="ml-1 text-[12px] font-medium text-[#065f46]">
                                  [{pub.citations} Citations]
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preprints / Manuscripts Under Review */}
                  {preprintPubs.length > 0 && (
                    <div className="mb-3.5">
                      <h3 className="font-serif font-bold text-[14px] text-black mb-1.5">
                        Manuscripts under review & preprints:
                      </h3>
                      <div className="space-y-3 font-serif text-[13.5px] text-black leading-[1.55] tracking-normal text-left">
                        {preprintPubs.map((pub, idx) => (
                          <div key={pub.id} className="cv-item-block flex gap-2">
                            <span className="font-semibold text-black select-none flex-shrink-0">
                              {idx + 1}.
                            </span>
                            <div>
                              {renderFormattedAuthors(pub.authors)} ({pub.year}). {pub.title}. <span className="italic">{pub.venue}</span>.{' '}
                              <span className="text-[12px] text-[#78350f] font-medium">[{pub.category}]</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 3. EDUCATION (Dedicated section if standalone)
            case 'education': {
              const edus = (data.education || []).filter(e => e.showInCv !== false);
              if (edus.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'education'))}
                  <div className="space-y-3.5 font-serif text-[14px] text-black">
                    {edus.map(edu => (
                      <div key={edu.id} className="cv-item-block">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline font-bold text-black">
                          <span>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</span>
                          <span className="font-normal text-[13.5px]">{edu.year}</span>
                        </div>
                        <div className="font-bold text-black">
                          {edu.degree}{edu.department ? ` in ${edu.department}` : ''}
                        </div>
                        {edu.result && (
                          <div>Cumulative GPA {edu.result}</div>
                        )}
                        {edu.thesis && (
                          <div>Thesis: <span className="italic">{edu.thesis}</span></div>
                        )}
                        {edu.advisor && (
                          <div>Advisor: {edu.advisor}</div>
                        )}
                        {edu.coursework && (
                          <div>Relevant Coursework: {edu.coursework}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 4. PROFESSIONAL EXPERIENCES & EDUCATION
            case 'experience': {
              const edus = (data.education || []).filter(e => e.showInCv !== false);
              const exps = (data.experience || []).filter(e => e.showInCv !== false);
              const hasSeparateEduSection = cvSections.some(s => s.id === 'education');

              if (exps.length === 0 && (hasSeparateEduSection || edus.length === 0)) return null;

              return (
                <div key={sec.id} className="space-y-4">
                  {/* If education is grouped with experience and not a separate section, render degrees first */}
                  {!hasSeparateEduSection && edus.length > 0 && (
                    <div className="cv-section-block">
                      {renderSectionHeading(sec.cvEducationTitle?.trim() || DEFAULT_CV_TITLES['education'] || 'Education')}
                      <div className="space-y-3.5 font-serif text-[14px] text-black">
                        {edus.map(edu => (
                          <div key={edu.id} className="cv-item-block">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline font-bold text-black">
                              <span>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</span>
                              <span className="font-normal text-[13.5px]">{edu.year}</span>
                            </div>
                            <div className="font-bold text-black">
                              {edu.degree}{edu.department ? ` in ${edu.department}` : ''}
                            </div>
                            {edu.result && <div>Cumulative GPA {edu.result}</div>}
                            {edu.thesis && <div>Thesis: <span className="italic">{edu.thesis}</span></div>}
                            {edu.advisor && <div>Advisor: {edu.advisor}</div>}
                            {edu.coursework && <div>Relevant Coursework: {edu.coursework}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional Experiences */}
                  {exps.length > 0 && (
                    <div className="cv-section-block">
                      {renderSectionHeading(getSectionCvHeading(sec, 'experience'))}
                      <div className="space-y-4 font-serif text-[14px] text-black">
                        {exps.map(exp => (
                          <div key={exp.id} className="cv-item-block">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline font-bold text-black">
                              <span>{exp.role}</span>
                              <span className="font-normal text-[13.5px]">{exp.period}</span>
                            </div>
                            <div className="text-black">
                              {exp.organization}{exp.department ? `, ${exp.department}` : ''}{exp.location ? `, ${exp.location}` : ''}
                            </div>
                            {exp.description && (
                              <p className="mt-1 leading-[1.6] text-left">
                                {exp.description}
                              </p>
                            )}
                            {exp.highlights && exp.highlights.length > 0 && (
                              <ul className="list-disc list-outside ml-5 mt-1 space-y-0.5 leading-[1.6] text-left">
                                {exp.highlights.map((h, i) => (
                                  <li key={i}>{h}</li>
                                ))}
                              </ul>
                            )}
                            {exp.skills && exp.skills.length > 0 && (
                              <div className="mt-1 text-[12.5px] text-[#334155]">
                                <span className="font-semibold">Core Focus:</span> {exp.skills.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 5. RESEARCH & TECHNICAL PROJECTS
            case 'projects': {
              const projs = (data.projects || []).filter(p => p.showInCv !== false);
              if (projs.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'projects'))}
                  <div className="space-y-3.5 font-serif text-[14px] text-black">
                    {projs.map(p => (
                      <div key={p.id} className="cv-item-block">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline font-bold text-black">
                          <span>{p.title}</span>
                          {p.date && <span className="font-normal text-[13.5px]">{p.date}</span>}
                        </div>
                        <p className="mt-0.5 leading-[1.6] text-left">
                          {p.description}
                        </p>
                        {p.technologies && p.technologies.length > 0 && (
                          <div className="mt-0.5 text-[12.5px] text-[#334155]">
                            <span className="font-semibold">Technologies:</span> {p.technologies.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 6. TECHNICAL SKILLS & COMPETENCIES
            case 'capabilities': {
              const groups = (data.skillGroups || []).filter(g => g.showInCv !== false);
              if (groups.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'capabilities'))}
                  <div className="space-y-1.5 font-serif text-[14px] text-black">
                    {groups.map(g => {
                      const activeSkills = (g.skills || []).filter(s => s.showInCv !== false);
                      if (activeSkills.length === 0) return null;
                      return (
                        <div key={g.id} className="cv-item-block leading-[1.6] text-left">
                          <span className="font-bold">{g.category}:</span>{' '}
                          <span>{activeSkills.map(s => s.name).join(', ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // 7. HONORS, AWARDS & SCHOLARSHIPS
            case 'awards': {
              const awds = (data.awards || []).filter(a => a.showInCv !== false);
              if (awds.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'awards'))}
                  <div className="space-y-2.5 font-serif text-[14px] text-black">
                    {awds.map(a => (
                      <div key={a.id} className="cv-item-block">
                        <div className="flex justify-between items-baseline">
                          <span><span className="font-bold">{a.title}</span>{a.issuer ? `, ${a.issuer}` : ''}</span>
                          {a.date && <span className="text-[13.5px] ml-4">{a.date}</span>}
                        </div>
                        {a.description && <p className="mt-0.5 leading-[1.5] text-[#1e293b] text-left">{a.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 8. KEY ACHIEVEMENTS
            case 'achievements': {
              const achs = (data.achievements || []).filter(a => a.showInCv !== false);
              if (achs.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'achievements'))}
                  <div className="space-y-2.5 font-serif text-[14px] text-black">
                    {achs.map(a => (
                      <div key={a.id} className="cv-item-block">
                        <div className="flex justify-between items-baseline">
                          <span><span className="font-bold">{a.title}</span>{a.organization ? `, ${a.organization}` : ''}</span>
                          <span className="text-[13.5px] ml-4">{a.year || a.date}</span>
                        </div>
                        {a.description && <p className="mt-0.5 leading-[1.5] text-[#1e293b] text-left">{a.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 9. CERTIFICATIONS & SPECIALIZED TRAINING
            case 'certifications': {
              const certs = (data.certifications || []).filter(c => c.showInCv !== false);
              if (certs.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'certifications'))}
                  <div className="space-y-1.5 font-serif text-[14px] text-black">
                    {certs.map(c => (
                      <div key={c.id} className="cv-item-block flex justify-between items-baseline">
                        <span><strong className="text-black">{c.title}</strong> — {c.issuer}</span>
                        <span className="text-[13.5px] ml-4">{c.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 10. TRAINING & WORKSHOPS
            case 'training': {
              const trs = (data.trainings || []).filter(t => t.showInCv !== false);
              if (trs.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'training'))}
                  <div className="space-y-1.5 font-serif text-[14px] text-black">
                    {trs.map(t => (
                      <div key={t.id} className="cv-item-block flex justify-between items-baseline">
                        <span><strong className="text-black">{t.title}</strong> — {t.issuer}</span>
                        <span className="text-[13.5px] ml-4">{t.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 11. PROFESSIONAL AFFILIATIONS
            case 'affiliations': {
              const affs = (data.affiliations || []).filter(a => a.showInCv !== false);
              if (affs.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'affiliations'))}
                  <div className="space-y-1.5 font-serif text-[14px] text-black">
                    {affs.map(a => (
                      <div key={a.id} className="cv-item-block flex justify-between items-baseline">
                        <span><strong className="text-black">{a.role}</strong> — {a.organization}</span>
                        <span className="text-[13.5px] ml-4">{a.period}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 12. VOLUNTEER EXPERIENCE
            case 'volunteer': {
              const vols = (data.volunteerWork || []).filter(v => v.showInCv !== false);
              if (vols.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'volunteer'))}
                  <div className="space-y-1.5 font-serif text-[14px] text-black">
                    {vols.map(v => (
                      <div key={v.id} className="cv-item-block flex justify-between items-baseline">
                        <span><strong className="text-black">{v.role || v.title}</strong>{v.organization ? ` — ${v.organization}` : ''}</span>
                        <span className="text-[13.5px] ml-4">{v.period}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // 13. REFERENCES
            case 'references': {
              const refs = (data.references || []).filter(r => r.showInCv !== false);
              if (refs.length === 0) return null;
              return (
                <div key={sec.id} className="cv-section-block">
                  {renderSectionHeading(getSectionCvHeading(sec, 'references'))}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 font-serif text-[14px] text-black">
                    {refs.map(r => (
                      <div key={r.id} className="cv-item-block space-y-0.5 leading-snug text-left">
                        <p className="font-bold text-black text-[14.5px]">{r.name}</p>
                        <p className="font-medium text-black">
                          {r.designation || r.role}{r.department ? `, ${r.department}` : ''}
                        </p>
                        <p className="text-black">{r.institution || r.organization}</p>
                        {r.email && (
                          <p className="text-black">
                            <span className="font-bold">Email: </span>
                            <a href={`mailto:${r.email}`} className="text-[#1e40af] hover:underline">{r.email}</a>
                          </p>
                        )}
                        {r.phone && (
                          <p className="text-black">
                            <span className="font-bold">Phone: </span>
                            <span>{r.phone}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            default:
              return null;
          }
        })}
      </div>
    </>
  );
};

interface CvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
}

export const CvPreviewModal: React.FC<CvPreviewModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { profile } = data;
  const candidateName = profile.name || 'Candidate';
  const cleanDocTitle = `${candidateName.replace(/\s+/g, '_')}_Curriculum_Vitae`;

  // Check if custom uploaded CV is selected in Admin
  const isCustomMode = profile.cvSettings?.downloadMode === 'manual' && Boolean(profile.cvSettings?.manualCvUrl);
  const customCvUrl = profile.cvSettings?.manualCvUrl || (profile.cvUrl && profile.cvUrl !== '#' ? profile.cvUrl : '');
  const customCvFileName = profile.cvSettings?.manualCvFileName || `${candidateName.replace(/\s+/g, '_')}_Curriculum_Vitae.pdf`;

  // Handle PDF Download:
  // If Custom CV is configured in Admin, downloads that exact uploaded PDF file directly!
  // If Auto-Generated CV, generates and saves the dynamic PDF.
  const handleDownloadPdf = async () => {
    if (isCustomMode && customCvUrl) {
      const a = document.createElement('a');
      a.href = customCvUrl;
      a.download = customCvFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const element = printRef.current;
    if (!element || isDownloading) return;
    await generateCvPdfFromElement(element, cleanDocTitle, setIsDownloading);
  };

  // Keyboard shortcuts:
  // - Escape closes the modal
  // - Ctrl+P / Cmd+P triggers PDF download
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleDownloadPdf();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isCustomMode, customCvUrl, customCvFileName, cleanDocTitle, isDownloading]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto cursor-pointer"
      id="cv-modal-root"
      onClick={(e) => {
        // Closes when clicking anywhere outside the modal window
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal Container: Identical dimensions and height (92vh) in both Custom and Auto-Generated modes */}
      <div
        className="relative w-full max-w-5xl h-[90vh] sm:h-[92vh] max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Top Header Bar */}
        <div className="no-print flex items-center justify-between p-4 sm:p-5 bg-slate-800/95 border-b border-slate-700 sticky top-0 z-20 shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isCustomMode
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Curriculum Vitae</h3>
                {isCustomMode && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Custom PDF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {isCustomMode ? `File: ${customCvFileName}` : 'Auto-generated dynamic academic CV'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 ${isCustomMode
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/40'
                }`}
              title={isCustomMode ? `Download ${customCvFileName}` : 'Download CV as PDF file with active hyperlinks'}
              id="cv-modal-download-btn"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
              aria-label="Close CV Preview"
              id="cv-modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Content - Both Custom and Auto-Generated have identical layout height and container */}
        {isCustomMode ? (
          <div className="flex-1 min-h-0 flex flex-col bg-slate-950/90 p-3 sm:p-5 overflow-hidden">
            {/* Custom PDF Toolbar */}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 mb-3 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs shrink-0">
              <div className="flex items-center space-x-2 text-slate-200 font-mono min-w-0">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold truncate">{customCvFileName}</span>
                {profile.cvSettings?.manualCvFileSize && (
                  <span className="text-[11px] text-slate-400 shrink-0">
                    ({(profile.cvSettings.manualCvFileSize / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              <a
                href={customCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-700/70 hover:bg-slate-700 border border-slate-600 transition-colors cursor-pointer shrink-0"
                title="Open PDF in new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </a>
            </div>

            {/* Embedded Custom PDF Iframe filling entire remaining height */}
            <div className="flex-1 min-h-0 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl relative">
              <iframe
                src={customCvUrl}
                title="Custom Uploaded Curriculum Vitae Preview"
                className="w-full h-full border-0 bg-white"
              />
            </div>
          </div>
        ) : (
          /* Printable Academic Paper Viewport (Auto-Generated) */
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 bg-slate-950/60">
            <div
              ref={printRef}
              className="cv-printable-document w-full max-w-[794px] mx-auto bg-white text-black p-8 sm:p-[18mm] rounded-xl shadow-2xl border border-slate-200"
              id="cv-paper-preview"
              style={{
                fontFamily: '"Times New Roman", Times, Georgia, serif',
                color: '#000000',
                fontSize: '14px',
                lineHeight: '1.5',
                letterSpacing: 'normal',
                wordSpacing: 'normal'
              }}
            >
              <CvDocumentContent data={data} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
