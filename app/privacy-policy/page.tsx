import type { Metadata } from "next";
import "./privacyPolicy.scss";

export const metadata: Metadata = {
  title: "Privacy Policy | GharSaDukan",
  description:
    "Learn how GharSaDukan collects, uses, and protects your personal information when you create and manage your store.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="policy-page">
      <header className="policy-hero">
        <p className="eyebrow">Privacy Policy</p>
        <h1>How we collect, use, and protect your data</h1>
        <p className="muted">Last updated: January 25, 2026</p>
      </header>

      <section className="policy-card">
        <h2>1. Introduction</h2>
        <p>
          GharSaDukan (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) enables shop owners to create and
          manage their online stores. This Privacy Policy explains what
          information we collect, how we use it, and the rights you have over
          your data when you use our web and mobile experiences.
        </p>
      </section>

      <section className="policy-card">
        <h2>2. Information we collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> Name, email address, password, and
            authentication identifiers required to create and secure your
            account.
          </li>
          <li>
            <strong>Store profile:</strong> Shop name, address, contact details,
            branding assets, catalog details, and pricing you provide while
            setting up and operating your store.
          </li>
          <li>
            <strong>Usage data:</strong> Device type, browser, IP address,
            access times, pages viewed, feature usage, and diagnostic events
            that help us improve reliability and performance.
          </li>
          <li>
            <strong>Transactional data:</strong> Orders, payments, and related
            records generated through your store (subject to your payment
            provider agreements).
          </li>
          <li>
            <strong>Cookies and similar technologies:</strong> Session cookies
            to keep you signed in, preferences cookies to remember settings, and
            analytics tools to understand product usage.
          </li>
        </ul>
      </section>

      <section className="policy-card">
        <h2>3. How we use your information</h2>
        <ul>
          <li>Provide, operate, and maintain your store and seller dashboard.</li>
          <li>Authenticate logins, prevent fraud, and secure accounts.</li>
          <li>Process orders, payments, and fulfillment workflows you initiate.</li>
          <li>Improve product performance, reliability, and user experience.</li>
          <li>Provide customer support and communicate service updates.</li>
          <li>Comply with legal obligations and enforce our terms.</li>
        </ul>
      </section>

      <section className="policy-card">
        <h2>4. Legal bases for processing</h2>
        <p>
          We process personal data to perform our contract with you (account and
          store operations), based on your consent where required (certain
          cookies/communications), to pursue our legitimate interests (service
          improvement and security), and to meet legal obligations (compliance
          and record-keeping).
        </p>
      </section>

      <section className="policy-card">
        <h2>5. Sharing your information</h2>
        <ul>
          <li>
            <strong>Service providers:</strong> Cloud hosting, analytics,
            authentication, and payment processors who act on our instructions
            under appropriate safeguards.
          </li>
          <li>
            <strong>Business operations:</strong> Professional advisors (legal,
            accounting, compliance) under confidentiality obligations.
          </li>
          <li>
            <strong>Legal requirements:</strong> If required by law, regulation,
            or to protect rights, safety, or integrity of our platform.
          </li>
          <li>
            <strong>Business transfers:</strong> In connection with a merger,
            acquisition, or asset sale, subject to continued protection of your
            data.
          </li>
        </ul>
      </section>

      <section className="policy-card">
        <h2>6. Data retention</h2>
        <p>
          We retain personal data for as long as your account remains active and
          as needed to operate your store. We may retain certain records to
        comply with legal, accounting, or reporting requirements. When data is
          no longer needed, we will delete or anonymize it.
        </p>
      </section>

      <section className="policy-card">
        <h2>7. Your rights</h2>
        <ul>
          <li>Access, correct, or delete your personal information.</li>
          <li>Object to or restrict certain processing, where applicable.</li>
          <li>
            Withdraw consent where processing is based on consent (this does not
            affect processing prior to withdrawal).
          </li>
          <li>
            Port your data by requesting a copy in a structured, commonly used
            format.
          </li>
        </ul>
        <p className="muted">
          To exercise these rights, contact us using the details below. We may
          need to verify your identity before responding.
        </p>
      </section>

      <section className="policy-card">
        <h2>8. Security</h2>
        <p>
          We use technical and organizational measures such as encryption in
          transit, access controls, and monitoring to protect your data. No
          system is completely secure, so we encourage you to use strong
          passwords and enable available security features.
        </p>
      </section>

      <section className="policy-card">
        <h2>9. International data transfers</h2>
        <p>
          Your information may be processed on servers located in regions other
          than your own. Where required, we implement safeguards to protect your
          data during transfer, such as standard contractual clauses or similar
          mechanisms.
        </p>
      </section>

      <section className="policy-card">
        <h2>10. Children&apos;s data</h2>
        <p>
          Our services are not directed to individuals under 18. We do not
          knowingly collect information from children. If you believe a child
          has provided us data, please contact us so we can delete it.
        </p>
      </section>

      <section className="policy-card">
        <h2>11. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy to reflect product, legal, or
          regulatory changes. When we make material updates, we will post the new
          date above and, where appropriate, provide additional notice.
        </p>
      </section>

      <section className="policy-card">
        <h2>12. Contact us</h2>
        <p>
          If you have questions or requests about this Privacy Policy or our
          data practices, contact the GharSaDukan support team at
          support@gharsadukan.com.
        </p>
      </section>
    </main>
  );
}
