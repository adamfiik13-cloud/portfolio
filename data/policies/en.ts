import type { PolicyContent, PolicyId } from "./config"

export const policiesEn: Record<PolicyId, PolicyContent> = {
  "terms": {
    "sections": [
      {
        "id": "terms-1",
        "title": "Identity and acceptance",
        "blocks": [
          {
            "type": "paragraph",
            "text": "{{brand}} is a trading name operated independently by {{operator}}, domiciled in {{domicile}} (referred to as “{{brand}}”, “we”, or the “service provider”)."
          },
          {
            "type": "paragraph",
            "text": "By creating an account, accepting an offer, placing an order, or using paid services, the client confirms that they have read and accepted the versions of the Terms of Service, Service Policy, Payment/Cancellation/Refund Policy, Privacy Policy, and Transaction Terms displayed before payment."
          },
          {
            "type": "paragraph",
            "text": "Browsing the website for information does not by itself create a paid order. A transaction relationship is formed after the client accepts the order summary and applicable Transaction Terms."
          }
        ]
      },
      {
        "id": "terms-2",
        "title": "Services and offer information",
        "blocks": [
          {
            "type": "paragraph",
            "text": "{{brand}} provides website, SEO, tracking and analytics, digital advertising, business/marketplace strategy, consultation, and career services as described in the catalog."
          },
          {
            "type": "paragraph",
            "text": "Each service page explains its price or starting price, scope, outputs, client requirements, exclusions, and call to action. The final information for a transaction is contained in the accepted Transaction Terms snapshot or custom offer."
          },
          {
            "type": "paragraph",
            "text": "“Starts from” means the final price is determined after requirements and scope are discussed. Catalog prices do not cover work, licenses, advertising budgets, domains, hosting, premium assets, third-party tools, taxes, or other costs unless expressly stated."
          },
          {
            "type": "paragraph",
            "text": "{{brand}} may update the catalog and prices for future transactions. Changes do not apply retroactively to orders that have already been paid."
          }
        ]
      },
      {
        "id": "terms-3",
        "title": "Accounts and client information",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Clients must provide accurate, current information and have authority to enter into the transaction. Clients are responsible for keeping their accounts secure and notifying us promptly if they become aware of unauthorized access."
          },
          {
            "type": "paragraph",
            "text": "Clients must not use another person’s identity, misuse the system, upload unlawful material, or provide access they are not authorized to grant."
          }
        ]
      },
      {
        "id": "terms-4",
        "title": "Electronic acceptance",
        "blocks": [
          {
            "type": "paragraph",
            "text": "When online checkout becomes available, the system will display the order summary, price, scope, outputs, estimates, revisions, exclusions, cancellation/refund rules, and links to the complete policies before payment."
          },
          {
            "type": "paragraph",
            "text": "In that flow, clients must actively select an acceptance checkbox that is not preselected. The system will record document versions, acceptance time, language, account identity, the order snapshot, and reasonable technical evidence."
          },
          {
            "type": "paragraph",
            "text": "Marketing consent is separate, optional, and not a condition of purchasing services."
          }
        ]
      },
      {
        "id": "terms-5",
        "title": "Payment",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Unless a custom offer states otherwise, payment is 100% upfront in Indonesian Rupiah before work begins. Future online payments may be processed through Midtrans or another provider officially displayed by {{brand}}. Online payment integration is not yet active."
          },
          {
            "type": "paragraph",
            "text": "{{brand}} does not store complete card details. Payment status must be verified through the payment provider. In the future online flow, provider server confirmations or webhooks will be authoritative, rather than a screenshot or success page on the client’s device alone."
          },
          {
            "type": "paragraph",
            "text": "Third-party costs, advertising budgets, domains, hosting, licenses, and paid assets are excluded unless listed in the order. Applicable taxes or fees will be disclosed before payment where relevant."
          },
          {
            "type": "paragraph",
            "text": "Duplicate payments or payments verified as erroneous are handled under the Refund Policy and the capabilities of the relevant payment method."
          }
        ]
      },
      {
        "id": "terms-6",
        "title": "No guarantee of business outcomes",
        "blocks": [
          {
            "type": "paragraph",
            "text": "We aim to provide services with reasonable care and competence within the agreed scope. However, we do not guarantee rankings, traffic, impressions, leads, conversions, ROAS, revenue, sales, job acceptance, salaries, or any particular business outcome."
          },
          {
            "type": "paragraph",
            "text": "Results are affected by factors including the market, competitors, platforms, budgets, offers, pricing, material quality, websites, sales processes, customer responses, algorithms, platform policies, and the client’s implementation of recommendations."
          }
        ]
      },
      {
        "id": "terms-7",
        "title": "Client responsibilities",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Clients must:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "provide briefs, materials, access, and approvals on time;",
              "ensure they have the rights to use supplied logos, copy, images, videos, data, databases, accounts, and assets;",
              "check the accuracy of business information, prices, claims, policies, and content;",
              "keep credentials secure and grant only the minimum access required;",
              "pay additional fees before out-of-scope work begins;",
              "comply with third-party platform policies and applicable law."
            ]
          },
          {
            "type": "paragraph",
            "text": "Client delays or incomplete inputs may pause the timeline without being treated as a delay by {{brand}}."
          }
        ]
      },
      {
        "id": "terms-8",
        "title": "Intellectual property",
        "blocks": [
          {
            "type": "paragraph",
            "text": "After all related payments are settled, the client receives rights to use the final deliverables specifically created and delivered for that order, to the extent not restricted by third-party licenses."
          },
          {
            "type": "paragraph",
            "text": "Rights to methods, knowledge, processes, frameworks, reusable templates, generic components, libraries, utility code, internal tools, prompts, working systems, and materials owned before the project remain with {{brand}} or their licensors."
          },
          {
            "type": "paragraph",
            "text": "Source files or editable files are included only when stated in the Transaction Terms. Third-party assets remain subject to their owners’ licenses."
          },
          {
            "type": "paragraph",
            "text": "The client warrants that supplied materials do not infringe others’ rights and is responsible for claims arising from those materials."
          }
        ]
      },
      {
        "id": "terms-9",
        "title": "Confidentiality and portfolio",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Each party must protect non-public information received to carry out the project. Information may be shared with specialist collaborators or providers who genuinely need it and are subject to relevant confidentiality obligations."
          },
          {
            "type": "paragraph",
            "text": "After a project or its results are published, {{brand}} may include the project name, type of work, public visuals, and approved results in its portfolio. Clients may request an opt-out or white-label terms before work begins. We will not publish confidential data, credentials, internal costs, or clients’ personal data."
          }
        ]
      },
      {
        "id": "terms-10",
        "title": "Third-party services",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Services may depend on Vercel, hosting, domain registrars, Google, Meta, analytics, Midtrans, email, storage, or other platforms. We do not control their uptime, reviews, suspensions, API changes, price changes, or policies."
          },
          {
            "type": "paragraph",
            "text": "We will take reasonable steps within scope to address issues, but a failure attributable solely to a third party does not automatically constitute a breach by {{brand}}."
          }
        ]
      },
      {
        "id": "terms-11",
        "title": "Electronic communications",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Clients agree to transactional communications through email, a dashboard, or official channels listed in the order. Transactional communications cover payments, briefs, progress, approval requests, security, revisions, and deliverables."
          },
          {
            "type": "paragraph",
            "text": "Marketing emails are sent only on the basis of a separate choice or another lawful basis and can be stopped without affecting active services."
          }
        ]
      },
      {
        "id": "terms-12",
        "title": "Prohibited use",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Clients must not use the website or services for fraud, spam, infringement of others’ rights, malware, system exploitation, illegal activity, or unlawful content. We may pause or refuse work that risks breaching the law or platform policies, with costs settled based on work already performed and non-refundable costs."
          }
        ]
      },
      {
        "id": "terms-13",
        "title": "Limitations of liability",
        "blocks": [
          {
            "type": "paragraph",
            "text": "No clause limits consumer rights or liabilities that cannot lawfully be limited under Indonesian law."
          },
          {
            "type": "paragraph",
            "text": "To the extent permitted by law, {{brand}} is not liable for indirect losses, lost opportunities, loss of expected profits, algorithm changes, third-party actions, platform decisions, or losses caused by incorrect client information or access."
          },
          {
            "type": "paragraph",
            "text": "Liability relating to a particular service, to the extent permitted by law, is limited to the amount actually paid for the order giving rise to the claim. This limit does not apply to intentional misconduct, fraud, proven breaches of confidentiality, or other obligations that cannot lawfully be limited."
          }
        ]
      },
      {
        "id": "terms-14",
        "title": "Complaints and disputes",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Complaints may be sent to {{email}} with the order number and a description of the issue. We will acknowledge receipt and seek an amicable resolution."
          },
          {
            "type": "paragraph",
            "text": "These terms are governed by the laws of the Republic of Indonesia. If discussions do not resolve the issue, the parties may use consumer dispute-resolution mechanisms or another competent forum under applicable law. This clause does not remove consumers’ rights to use mechanisms provided by law."
          }
        ]
      },
      {
        "id": "terms-15",
        "title": "Changes to the terms",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Each policy displays its version and effective date. Changes apply to new transactions after the effective date. Material changes to active orders require consent or an addendum and will not be imposed unilaterally."
          }
        ]
      },
      {
        "id": "terms-16",
        "title": "Contact",
        "blocks": [
          {
            "type": "paragraph",
            "text": "{{brand}} — {{operator}}. {{domicile}}. Email: {{email}}. Website: {{website}}."
          }
        ]
      },
      {
        "id": "terms-hierarchy",
        "title": "Document hierarchy",
        "blocks": [
          {
            "type": "paragraph",
            "text": "If documents conflict, the following order applies:"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "A signed or electronically accepted custom offer or addendum.",
              "The Transaction Terms snapshot attached to the relevant order.",
              "The Service Policy and Payment, Cancellation & Refund Policy versions accepted for that order.",
              "These general Terms of Service.",
              "General marketing content on the website."
            ]
          },
          {
            "type": "paragraph",
            "text": "A website or policy update does not change an existing paid order unless both parties expressly accept an addendum."
          }
        ]
      }
    ]
  },
  "service": {
    "sections": [
      {
        "id": "service-1",
        "title": "When work begins",
        "blocks": [
          {
            "type": "paragraph",
            "text": "The delivery timeline starts only after all of the following conditions are met:"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "payment is verified;",
              "all mandatory brief information and materials are received;",
              "required access is available;",
              "{{brand}} confirms that the brief is complete and approved;",
              "for advertising services, the campaign is confirmed ready to launch."
            ]
          }
        ]
      },
      {
        "id": "service-2",
        "title": "Business days and estimates",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Business days are Monday to Friday, excluding Indonesian national public holidays. Estimates are not guarantees of an absolute delivery date. Time spent waiting for materials, access, feedback, approvals, platform reviews, or third-party action is excluded."
          },
          {
            "type": "paragraph",
            "text": "Standard estimates:"
          },
          {
            "type": "table",
            "headers": [
              "Service",
              "Operational estimate"
            ],
            "rows": [
              [
                "Landing Page Starter",
                "5–7 business days"
              ],
              [
                "Business Website",
                "10–15 business days"
              ],
              [
                "Custom Website",
                "As specified in the proposal"
              ],
              [
                "SEO Audit & Roadmap",
                "5 business days"
              ],
              [
                "SEO Foundation",
                "7–10 business days"
              ],
              [
                "SEO Growth",
                "30-day cycles; recommended minimum engagement of 3 months"
              ],
              [
                "Tracking Basic",
                "3–5 business days"
              ],
              [
                "Ads Tracking",
                "5–7 business days"
              ],
              [
                "Advanced Tracking",
                "Starting at 7–14 business days, or as specified in the proposal"
              ],
              [
                "Meta/Google Ads",
                "30-day management cycles"
              ],
              [
                "Integrated Ads",
                "As specified in the proposal or cycle"
              ],
              [
                "Digital Business Consultation",
                "60-minute session"
              ],
              [
                "Marketing/Marketplace Audit",
                "60-minute session plus notes within a maximum of 2 business days"
              ],
              [
                "Marketplace Growth Plan",
                "5–7 business days"
              ],
              [
                "Career Consultation",
                "45-minute session"
              ],
              [
                "CV Review",
                "2–3 business days"
              ],
              [
                "CV Rewrite & Optimization",
                "3–5 business days"
              ]
            ]
          }
        ]
      },
      {
        "id": "service-3",
        "title": "Revisions",
        "blocks": [
          {
            "type": "paragraph",
            "text": "One revision round means one consolidated set of feedback on one version, submitted together. Additional feedback sent after revision work begins may count as the next round."
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Landing Page Starter: 2 rounds.",
              "Business Website: 2 rounds.",
              "Tracking Basic and Ads Tracking: 1 round for in-scope adjustments.",
              "SEO Audit/Foundation, Marketplace Growth Plan, and CV Rewrite: 1 round or corrections within scope.",
              "Consultations, CV Review, and monthly optimization services use clarification or priority reviews rather than unlimited revisions.",
              "Custom Website and Advanced/Integrated services follow the proposal."
            ]
          },
          {
            "type": "paragraph",
            "text": "Changes to objectives, structure, features, platforms, integrations, audiences, or core materials may constitute additional scope. Additional revisions are set out in an additional offer and carried out after acceptance and payment."
          }
        ]
      },
      {
        "id": "service-4",
        "title": "Review period and automatic completion",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Clients have 5 business days from delivery of the result or review version to approve it or submit one consolidated set of feedback. We send a reminder before the deadline."
          },
          {
            "type": "paragraph",
            "text": "If there is no response, the deliverable is considered accepted and the order may be marked complete. Feedback submitted on time will still be processed. Automatic completion does not remove the obligation to correct verified technical errors arising from our in-scope implementation."
          }
        ]
      },
      {
        "id": "service-5",
        "title": "Client inactivity",
        "blocks": [
          {
            "type": "paragraph",
            "text": "The timeline is paused while the client has not provided materials, access, feedback, or approval. After two reminders and 14 days without a response, the project may be archived. Reactivation is subject to capacity, scheduling, technical conditions, and any necessary additional fees disclosed in advance."
          }
        ]
      },
      {
        "id": "service-6",
        "title": "Consultations",
        "blocks": [
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Reschedule without charge when requested at least 6 hours before the session.",
              "Changes requested less than 6 hours before the session, or a no-show, receive one opportunity to reschedule.",
              "If the client again fails to attend or cancels late, the session is considered completed without a refund.",
              "If {{brand}} cancels, the client may choose a new time or a full refund.",
              "Client lateness does not automatically extend the session.",
              "A brief clarification is not an additional consultation session."
            ]
          }
        ]
      },
      {
        "id": "service-7",
        "title": "Handover and support",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Handover includes the outputs stated in the Transaction Terms. Maintenance, regular updates, hosting management, unlimited support, and changes after completion are excluded unless expressly stated."
          }
        ]
      }
    ]
  },
  "refund": {
    "sections": [
      {
        "id": "refund-1",
        "title": "Payment",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Standard payment is 100% upfront. Additional work is paid for before it is carried out. A custom offer may specify a different arrangement in writing."
          }
        ]
      },
      {
        "id": "refund-2",
        "title": "Full refunds",
        "blocks": [
          {
            "type": "paragraph",
            "text": "A full refund is available when:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "{{brand}} cancels before work begins;",
              "a duplicate payment is verified;",
              "payment succeeds but the order cannot be provided because of an error by {{brand}}, and no alternative solution is agreed;",
              "required by law or an applicable dispute-resolution decision."
            ]
          },
          {
            "type": "paragraph",
            "text": "Payment gateway fees not returned by the provider may be deducted only where permitted by law and disclosed before the transaction."
          }
        ]
      },
      {
        "id": "refund-3",
        "title": "Cancellation before work begins",
        "blocks": [
          {
            "type": "paragraph",
            "text": "If the client cancels before the brief is approved and before work begins, payment may be returned after deducting actual third-party or payment gateway costs that are non-refundable, lawful, and demonstrable."
          }
        ]
      },
      {
        "id": "refund-4",
        "title": "Cancellation after work begins",
        "blocks": [
          {
            "type": "paragraph",
            "text": "A refund is not automatically refused. Its amount is calculated as follows:"
          },
          {
            "type": "paragraph",
            "text": "payment received − completed milestones − demonstrable partial work − third-party/non-refundable costs = available refund"
          },
          {
            "type": "paragraph",
            "text": "Evidence may include discovery, meetings, research, audits, structure, sitemaps, wireframes, drafts, setup, configuration, implementation, testing, reports, or third-party purchases. Milestone values must be recorded in the order snapshot or custom offer."
          }
        ]
      },
      {
        "id": "refund-5",
        "title": "Non-conforming or defective work",
        "blocks": [
          {
            "type": "paragraph",
            "text": "If a service does not conform to the Transaction Terms or contains an in-scope error, the client must allow a reasonable opportunity for correction, replacement, re-performance, or another solution. If the issue cannot reasonably be resolved, a full or partial refund is assessed based on the affected portion and applicable law."
          },
          {
            "type": "paragraph",
            "text": "Failure to achieve a business outcome that was not guaranteed is not, by itself, grounds for a refund when the service and outputs were delivered within scope."
          }
        ]
      },
      {
        "id": "refund-6",
        "title": "Refund process",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Requests are submitted through official channels with the order number, reason, and relevant evidence. We acknowledge receipt, assess progress, and communicate the decision and calculation."
          },
          {
            "type": "paragraph",
            "text": "The time for funds to return depends on the payment method, bank, and processes of the payment provider used. An order’s refund status is separate from payment status and work status."
          }
        ]
      },
      {
        "id": "refund-7",
        "title": "Chargebacks and payment disputes",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Clients are encouraged to contact {{brand}} first. We may provide evidence of the order, Terms acceptance, communications, progress, and deliverables to the payment provider in accordance with the law and Privacy Policy."
          }
        ]
      }
    ]
  },
  "privacy": {
    "sections": [
      {
        "id": "privacy-1",
        "title": "Data controller",
        "blocks": [
          {
            "type": "paragraph",
            "text": "The data controller for {{brand}} services is {{operator}}, trading as {{brand}}, {{domicile}}. Privacy questions may be sent to {{email}}."
          }
        ]
      },
      {
        "id": "privacy-2",
        "title": "Data we process",
        "blocks": [
          {
            "type": "paragraph",
            "text": "We may process:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "identity and contact information;",
              "account and authentication information;",
              "business information, briefs, materials, files, and communications;",
              "order, offer, invoice, payment, refund, and acceptance data;",
              "usage, device, security log, IP address, user agent, analytics, and cookie data;",
              "account or platform access granted to complete the work;",
              "support, complaint, and dispute records."
            ]
          },
          {
            "type": "paragraph",
            "text": "We do not intend to request sensitive data that is unnecessary. Clients should remove or mask irrelevant third-party data before uploading files."
          }
        ]
      },
      {
        "id": "privacy-3",
        "title": "Purposes and grounds for processing",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Data is processed to:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "prepare offers and perform contracts;",
              "verify payments and prevent fraud;",
              "provide accounts, orders, communications, revisions, and deliverables;",
              "meet legal, tax, audit, and dispute-resolution obligations;",
              "maintain system security and reliability;",
              "improve the website using aggregated data;",
              "send marketing only on the basis of consent or another relevant lawful basis."
            ]
          }
        ]
      },
      {
        "id": "privacy-4",
        "title": "Recipients",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Depending on the services and features used, data may be shared as necessary with hosting/cloud, database, authentication, storage, email, analytics, monitoring, and payment providers, banks/payment methods, specialist collaborators, professional advisers, or authorities acting on lawful requests. Future online payments may use Midtrans or another officially displayed provider; this integration is not yet active."
          },
          {
            "type": "paragraph",
            "text": "Each provider receives only data relevant to its function. The providers used depend on the services and features available."
          }
        ]
      },
      {
        "id": "privacy-5",
        "title": "Transfers and retention",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Providers may process data on infrastructure outside Indonesia. Processing locations and cross-border transfer mechanisms must be reviewed under applicable personal data protection requirements before they are used for the relevant processing."
          },
          {
            "type": "paragraph",
            "text": "Data is kept for as long as needed for orders, services, legal obligations, security, taxes, bookkeeping, or disputes. Retention depends on the processing purpose and applicable obligations. After the retention period, data is securely deleted, anonymized, or aggregated."
          }
        ]
      },
      {
        "id": "privacy-6",
        "title": "Security",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Security controls are proportionate to the systems and data being processed. Depending on the functions used, these controls include access restrictions and least privilege, transport encryption, credential management, and server-side authorization, private storage, activity logging, and backups for the relevant systems. No system is risk-free."
          },
          {
            "type": "paragraph",
            "text": "If a personal data protection failure meets the legal notification threshold, we will provide notice within the time limits and with the information required by applicable rules."
          }
        ]
      },
      {
        "id": "privacy-7",
        "title": "User rights",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Subject to applicable law, users may request information, access, correction, updating, cessation or deletion, withdrawal of consent, objection, or other rights relating to data processing. Some requests may be limited by legal obligations, fraud prevention, bookkeeping, or disputes."
          },
          {
            "type": "paragraph",
            "text": "We may verify identity before fulfilling a request."
          }
        ]
      },
      {
        "id": "privacy-8",
        "title": "Cookies and analytics",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Cookies necessary for login, security, sessions, checkout, and preferences may be used to provide services. Non-essential analytics or marketing cookies must follow an appropriate consent mechanism before activation where required."
          }
        ]
      },
      {
        "id": "privacy-9",
        "title": "Children",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Services are not directed at children who lack capacity to consent or enter into a contract without a guardian. If a child’s data is identified without a lawful basis, contact us so it can be addressed."
          }
        ]
      },
      {
        "id": "privacy-10",
        "title": "Changes and contact",
        "blocks": [
          {
            "type": "paragraph",
            "text": "Policy changes are displayed with a version and effective date. Material changes are communicated appropriately. Contact: {{email}}."
          }
        ]
      }
    ]
  }
}
