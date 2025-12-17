import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg p-8 sm:p-10 lg:p-12 w-full max-w-6xl">
        <h1 className="text-4xl font-extrabold text-primary-7 mb-6 text-center">
          Terms of Service: Version 1.0
        </h1>

        <div className="text-center text-gray-600 mb-8">
          <p>
            <strong>Effective Date:</strong> [01/08/2025]
          </p>
          <p>
            <strong>Last Updated:</strong> [01/08/2025]
          </p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>IMPORTANT:</strong> Sozodigicare is not an emergency
                service. If you have a medical emergency or urgent condition,
                call 999 or 112 immediately or go to the nearest emergency
                department. Do not use Sozodigicare in an emergency.
              </p>
            </div>
          </div>
        </div>

        <section className="text-gray-700 text-base space-y-6">
          <p>
            Welcome to Sozodigicare! These Terms of Service ("Terms") are a
            legal agreement between you (the "User") and Sozodigicare Limited
            ("Sozodigicare," "we," "our," or "us"). Sozodigicare Limited
            provides an online telemedicine platform operating in the Republic
            of Ireland. By registering for or using our online medical
            consultation services (the "Services"), you agree to these Terms.
            You also agree to our Privacy Policy, Cookie Policy, and Refund
            Policy, which are each incorporated into these Terms by reference.
            Please read all of these documents carefully. If you do not agree
            with any of these Terms or policies, do not use our Services.
          </p>

          <p>
            Throughout this document, when we refer to the "Platform," we mean
            the Sozodigicare website and application through which we offer
            telemedicine services. A "Practitioner" refers to an independent
            medical doctor who is registered with the Irish Medical Council and
            provides remote consultations via Sozodigicare. The term
            "Consultation" means a telemedicine appointment you have with a
            Practitioner through our Platform (for example, a video call or
            phone call). "You" or the "User" means the person who registers an
            account or uses our Services, including a parent/guardian who
            registers on behalf of a minor.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            List of Content:
          </h2>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Eligibility to Use the Service</li>
            <li>Account Registration and Security</li>
            <li>Scope of Services We Provide</li>
            <li>
              Our Role (Platform Provider) vs. Practitioner's Role (Medical
              Care)
            </li>
            <li>Consent to Telemedicine</li>
            <li>User Responsibilities and Acceptable Use</li>
            <li>Payments, Fees, and Refund Policy</li>
            <li>Privacy and Data Protection</li>
            <li>Platform Compliance and Standards</li>
            <li>Limitations of Liability</li>
            <li>
              Indemnification (Your Promise to Cover Our Losses if You Breach)
            </li>
            <li>Termination and Suspension of Services</li>
            <li>Modifications to These Terms</li>
            <li>Governing Law and Dispute Resolution</li>
            <li>Severability</li>
            <li>Entire Agreement</li>
            <li>No Waiver</li>
            <li>Contact Information</li>
          </ol>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            1. Eligibility to Use the Service
          </h2>
          <p>
            To use Sozodigicare's Services, you must meet all of the following
            conditions:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Age Requirement:</strong> You must be at least 18 years
              old. If you are under 18, you may only use the Services with the
              involvement and consent of a parent or legal guardian. The
              parent/guardian must agree to these Terms on your behalf.
            </li>
            <li>
              <strong>Minors Under 16:</strong> If you are under 16 years old,
              your parent or guardian must provide verifiable consent for you to
              use the Services and will likely be asked to supervise your use.
              (This is to comply with data protection law regarding minors.)
            </li>
            <li>
              <strong>Location:</strong> The Services are intended for use
              within the Republic of Ireland. You must be physically located in
              Ireland during any medical Consultation. This is because our
              Practitioners are licensed in Ireland and can only practice within
              that jurisdiction.
            </li>
            <li>
              <strong>Personal Use Only:</strong> You may only use the Services
              for your own personal healthcare or for a dependent for whom you
              are the parent or legal guardian. You cannot use the service for
              any third party who is not under your legal care.
            </li>
            <li>
              <strong>Accurate Information:</strong> You must provide true,
              accurate, and complete information about yourself (or your
              dependent) when registering and during consultations. This
              includes your name, contact details, medical history, and any
              other information requested.
            </li>
          </ul>
          <p>
            By registering an account, you confirm that you meet the above
            eligibility criteria. You also agree that we may ask for proof of
            things like age or guardian consent if necessary, and you will
            provide such proof if requested.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            2. Account Registration and Security
          </h2>
          <p>
            When you create an account, you will need to provide a valid email,
            set a password, and possibly other authentication details. You are
            responsible for keeping your login credentials confidential. Do not
            share your account or password with anyone else. If you believe
            someone else has gained access to your account, notify us
            immediately at contact@Sozodigicare.ie so we can help secure it.
          </p>
          <p>
            You are responsible for all activities that occur under your
            account. If you let someone else use your account (which we don't
            recommend), you will be responsible for anything that person does.
            We reserve the right to suspend or close accounts that we suspect
            are being used fraudulently or in violation of these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            3. Scope of Services We Provide
          </h2>
          <p>
            Sozodigicare offers a platform that connects Users in Ireland with
            qualified medical Practitioners for remote healthcare services.
            Here's what we provide:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Remote Consultations:</strong> You can have a video or
              phone consultation with an Irish Medical Council (IMC) registered
              doctor through our Platform. These Practitioners can provide
              medical advice, diagnosis, and treatment recommendations based on
              what can be done safely via telemedicine.
            </li>
            <li>
              <strong>Prescriptions:</strong> Practitioners can issue private
              prescriptions for medications when appropriate. These
              prescriptions will be issued to the desired pharmacy in Ireland
              directly via email. Please note: We do not prescribe any
              controlled substances or high-risk medications through
              Sozodigicare (for example, we will not prescribe narcotics or
              sedatives that are controlled by law). Such medications require
              in-person evaluation.
            </li>
            <li>
              <strong>Medical Certificates & Letters:</strong> If appropriate, a
              Practitioner may issue medical certificates (such as sick notes
              for work or school) or referral letters (for specialist visits or
              tests). However, we do not issue Social Welfare illness benefit
              certificates (the certs required for government social welfare
              claims) through this service. For those, you will need to see a GP
              in person.
            </li>
            <li>
              <strong>Referrals:</strong> Practitioners can provide referral
              letters to specialists or recommendations to attend further
              services (like blood tests, X-rays, etc.) as needed.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            4. Our Role (Platform Provider) vs. Practitioner's Role (Medical
            Care)
          </h2>
          <p>
            It is important to understand that Sozodigicare Limited is a
            technology platform provider, not a medical clinic. We facilitate
            your interaction with independent medical professionals, but we do
            not practice medicine ourselves.
          </p>
          <p>
            Our Platform services as a telemedicine provider, we secure video
            consultation system, electronic health record (EHR) storage,
            scheduling tools, and patient communication functions used on our
            website and app. Sozodigicare is bound by strict contractual
            obligations under GDPR, including the use of encryption, access
            controls, and certified data centres.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            5. Consent to Telemedicine
          </h2>
          <p>
            By using Sozodigicare's Services, you give your consent to receive
            healthcare via telemedicine. This means you understand and agree to
            the following:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Remote Nature of Care:</strong> The consultation with the
              Practitioner will be conducted remotely (via internet video or
              phone). No physical examination can be performed.
            </li>
            <li>
              <strong>Reliance on Information Provided:</strong> Because the
              doctor cannot examine you physically, the accuracy and usefulness
              of the medical advice depend on you giving thorough and truthful
              information.
            </li>
            <li>
              <strong>Technical Limitations:</strong> You understand that there
              can be technical problems with telemedicine. Connections might
              drop, video/audio could be unclear, or there could be
              interruptions.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            6. User Responsibilities and Acceptable Use
          </h2>
          <p>
            When you use Sozodigicare, you agree to conduct yourself responsibly
            and lawfully. Here are your responsibilities as a user of our
            Services:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Provide Accurate Information:</strong> You must provide
              truthful, accurate, and complete information at all times.
            </li>
            <li>
              <strong>Follow Medical Advice:</strong> If a Practitioner provides
              you with a treatment plan, prescription, or advice, you agree to
              follow those instructions as given.
            </li>
            <li>
              <strong>Use Medications Responsibly:</strong> Any prescription you
              receive via Sozodigicare is for your personal use only.
            </li>
            <li>
              <strong>Respectful Conduct:</strong> You will treat all
              Sozodigicare staff and Practitioners with respect and courtesy.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            7. Payments, Fees, and Refund Policy
          </h2>
          <p>
            Using Sozodigicare's medical Services typically requires payment.
            Here's what you need to know about fees and refunds:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Service Fees:</strong> The price for consultations or any
              other paid Services will be clearly indicated on our Platform.
            </li>
            <li>
              <strong>Payment Methods:</strong> We accept major credit/debit
              cards and/or other payment methods as listed on our Platform.
            </li>
            <li>
              <strong>Refund Policy:</strong> For details on refunds, please
              review our Refund Policy which is incorporated into these Terms.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            8. Privacy and Data Protection
          </h2>
          <p>
            Your privacy is extremely important to us. We handle your personal
            data in compliance with the General Data Protection Regulation
            (GDPR) and Irish data protection laws. Here is a summary of how we
            manage your data:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Privacy Policy:</strong> Our detailed practices are
              outlined in our Privacy Policy, which we strongly encourage you to
              read.
            </li>
            <li>
              <strong>Data Security:</strong> We employ strong security measures
              to protect your data, including encryption and access controls.
            </li>
            <li>
              <strong>Your Rights:</strong> Under GDPR, you have several rights
              regarding your personal data, including access, rectification, and
              erasure.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            9. Platform Compliance and Standards
          </h2>
          <p>
            Sozodigicare is committed to operating in compliance with all
            applicable healthcare regulations and standards in Ireland. We want
            you to know that behind the scenes, we follow the rules that govern
            telehealth services:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Medical Council Guidelines:</strong> All Practitioners
              must abide by the Irish Medical Council's professional conduct
              guidelines.
            </li>
            <li>
              <strong>Data Protection Compliance:</strong> We comply with the
              GDPR and implement appropriate safeguards.
            </li>
            <li>
              <strong>Continuous Improvement:</strong> We remain committed to
              adjusting our practices to remain compliant.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            10. Limitations of Liability
          </h2>
          <p>
            This section is important – it outlines the limits of what
            Sozodigicare (the company) is responsible for legally. While we
            stand behind our Platform, there are certain risks or outcomes for
            which we cannot accept liability, to the extent permitted by law.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>No Liability for Medical Outcomes:</strong> Sozodigicare
              Limited is not liable for any medical advice, diagnosis,
              treatment, or other decisions that the Practitioners provide.
            </li>
            <li>
              <strong>No Warranty of Specific Results:</strong> We make no
              guarantee that using our Service will result in a particular
              outcome for your health.
            </li>
            <li>
              <strong>Service Availability:</strong> We do not guarantee that
              the Platform will be uninterrupted or error-free at all times.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            11. Indemnification
          </h2>
          <p>
            If Sozodigicare faces legal claims or expenses because of something
            you did in violation of these Terms or the law, we may hold you
            responsible for those costs. This includes violations of these
            Terms, misuse of the Services, and violation of laws or rights.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            12. Termination and Suspension of Services
          </h2>
          <p>
            We reserve the right to suspend or terminate your access to
            Sozodigicare at our discretion, with or without prior notice, in
            certain circumstances including violation of Terms, unlawful use,
            threats to safety, and non-payment.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            13. Modifications to These Terms
          </h2>
          <p>
            We may update or revise these Terms from time to time. If we make a
            material change, we will notify you in advance. Your continued use
            of the Services after the effective date of updated Terms
            constitutes your acceptance of the changes.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            14. Governing Law and Dispute Resolution
          </h2>
          <p>
            These Terms and any dispute or claim arising out of or in connection
            with them are governed by and interpreted in accordance with the
            laws of the Republic of Ireland. Any disputes will be brought
            exclusively in the courts of Ireland.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            15. Severability
          </h2>
          <p>
            Each of the provisions in these Terms operates separately. If any
            provision is found to be invalid, illegal, or unenforceable, the
            rest of the Terms shall continue in full force and effect.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            16. Entire Agreement
          </h2>
          <p>
            These Terms of Service, along with the incorporated Privacy Policy,
            Cookie Policy, and Refund Policy, constitute the entire agreement
            between you and Sozodigicare Limited regarding the use of our
            Services.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            17. No Waiver
          </h2>
          <p>
            If we fail to enforce any provision of these Terms or delay in
            enforcing it, that does not mean we are waiving our right to do so.
            Any waiver of rights by Sozodigicare would have to be an explicit
            written waiver signed by us to be effective.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-primary-6)] mt-8">
            18. Contact Information
          </h2>
          <p>
            If you have any questions, concerns, or feedback about these Terms
            or our Services, please feel free to contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Sozodigicare Healthcare Limited</strong>
            </p>
            <p>Email: contact@Sozodigicare.ie</p>
            <p>
              We typically respond to customer inquiries within 1-2 business
              days.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
            <p className="text-blue-700">
              Thank you for reading our Terms of Service. We know it's a long
              document, but we believe in transparency and want you to feel
              comfortable using Sozodigicare. By ticking the box presented to
              you during the intake process or by using our Services, you
              indicate that you understand and agree to all of the above. We are
              excited to help you manage your healthcare needs remotely, and we
              are committed to providing a safe, lawful, and user-friendly
              service.
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-8 text-center">
            <strong>Last updated:</strong> [01/08/2025]
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
