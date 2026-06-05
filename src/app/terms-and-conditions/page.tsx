import type { Metadata } from "next";
import Link from "next/link";
import { InnerPageShell } from "@/components/layout/InnerPageShell";
import { ip } from "@/lib/inner-page";
import { mailtoHref, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  robots: { index: true, follow: true },
};

const legalH2 = `${ip.h2} text-xl`;
const legalList = "mt-2 list-disc space-y-1 pl-5 text-slate-400";

export default function TermsPage() {
  return (
    <InnerPageShell>
      <article className={`${ip.container} max-w-3xl py-14 sm:py-20`}>
        <h1 className={ip.h1}>Terms &amp; Conditions</h1>
        <p className={`${ip.muted} mt-2 text-sm`}>For {site.legalName}</p>
        <p className={`${ip.body} mt-1 text-sm font-medium`}>Last updated: April 2026</p>

        <div className={`mt-10 space-y-8 ${ip.bodyLg}`}>
          <p>
            These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the Xeroura Technologies
            website, products, and services. By accessing our website or using our services, you agree
            to these Terms.
          </p>

          <section>
            <h2 className={legalH2}>1. Use of website &amp; services</h2>
            <p className="mt-3">You agree to use our website and services only for lawful purposes. You must not:</p>
            <ul className={legalList}>
              <li>Attempt unauthorized access</li>
              <li>Misuse or disrupt our systems</li>
              <li>Upload harmful or malicious content</li>
            </ul>
          </section>

          <section>
            <h2 className={legalH2}>2. Intellectual property</h2>
            <p className="mt-3">
              All content, branding, logos, product names (including LiveBot and Xeroura AI), and
              materials on this website are the property of {site.legalName}.
            </p>
            <p className="mt-3">
              You may not copy, reproduce, or distribute any content without written permission.
            </p>
          </section>

          <section>
            <h2 className={legalH2}>3. User submissions</h2>
            <p className="mt-3">When submitting information through forms (Careers, Contact, etc.):</p>
            <ul className={legalList}>
              <li>You confirm the information is accurate</li>
              <li>You grant us permission to store and review the data</li>
              <li>You agree not to upload harmful or illegal content</li>
            </ul>
          </section>

          <section>
            <h2 className={legalH2}>4. Product usage</h2>
            <p className="mt-3">For users of LiveBot and Xeroura AI:</p>
            <ul className={legalList}>
              <li>Access is granted based on subscription or service agreements</li>
              <li>Misuse or unauthorized sharing of access credentials is prohibited</li>
              <li>We may suspend access for security or compliance reasons</li>
            </ul>
          </section>

          <section>
            <h2 className={legalH2}>5. Limitation of liability</h2>
            <p className="mt-3">{site.legalName} is not responsible for:</p>
            <ul className={legalList}>
              <li>Losses caused by misuse of our services</li>
              <li>Third-party system failures</li>
              <li>Downtime due to maintenance or external factors</li>
            </ul>
            <p className="mt-3">We provide services &quot;as available&quot; and &quot;as is&quot;.</p>
          </section>

          <section>
            <h2 className={legalH2}>6. Termination</h2>
            <p className="mt-3">We may suspend or terminate access to our services if:</p>
            <ul className={legalList}>
              <li>Terms are violated</li>
              <li>Illegal activity is detected</li>
              <li>Security risks are identified</li>
            </ul>
          </section>

          <section>
            <h2 className={legalH2}>7. Governing law</h2>
            <p className="mt-3">
              These Terms are governed by the laws of India, specifically the jurisdiction of
              Hyderabad, Telangana.
            </p>
          </section>

          <section>
            <h2 className={legalH2}>8. Contact us</h2>
            <p className="mt-3">
              For questions regarding these Terms, contact:{" "}
              <Link className={ip.link} href={mailtoHref()}>
                {site.email}
              </Link>
            </p>
          </section>
        </div>
      </article>
    </InnerPageShell>
  );
}
