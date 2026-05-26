# NutriCopilot

NutriCopilot is a front-end prototype for an AI-assisted clinical nutrition workflow. The interface presents a landing page, authentication screens, and a dietitian dashboard demonstrating report upload, biomarker/context review, and diet-plan review interactions.

## Current Status

**UI prototype only.** The repository implements HTML/CSS/JavaScript screens and browser-side simulated flows. It does not contain backend services, real authentication, report parsing, AI generation, persistent patient data, or PDF export.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Google Fonts (Inter, loaded by the pages at runtime)

No build system or package installation is required for the current files.

## Project Structure

```text
Dietician/
|-- landing.html             # Marketing landing page
|-- login.html               # Login prototype
|-- signup.html              # Sign-up prototype
|-- index.html               # Dashboard prototype
|-- landing.css              # Landing and auth page styles
|-- style.css                # Dashboard styles
|-- landing.js               # Landing/auth transitions and marketing interactions
|-- auth.js                  # Simulated auth and password-meter behavior
|-- script.js                # Dashboard state, UI simulation, drawers, and plan interactions
|-- IMPLEMENTATION_AUDIT.md  # Detailed implemented-state audit
`-- README.md                # Project overview and local usage
```

## Run Locally

Because this is a static prototype, it can be opened directly in a browser:

1. Open `landing.html` to begin with the marketing page.
2. Use the page links to move to Login, Sign Up, and then the simulated dashboard.

For a simple local web server, run this from the `Dietician` directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/landing.html
```

The dashboard can also be opened directly at `http://localhost:8000/index.html`.

## Implemented Features

### Marketing And Authentication UI

- Responsive landing page with navigation, hero mockup, workflow cards, features, testimonials, CTAs, and footer.
- Mobile navigation drawer, section reveal effects, local-page transition animation, and CTA behavior.
- Login and sign-up screens with split-panel layouts and product preview cards.
- Password-strength display on the sign-up page.
- Simulated login, sign-up, and Google-button navigation into the dashboard.

### Dashboard Prototype

- Responsive three-area dashboard shell with sidebar, workspace, and patient-context panel.
- Sidebar collapse persistence in browser `localStorage`, patient-name filtering, history toggle, mobile sidebar, tooltips, and profile menu.
- Welcome prompt, quick actions, upload selector, simulated voice input, and canned chat replies.
- Report upload review for one or multiple filenames and timed processing animation.
- Review hub showing hard-coded biomarker and patient-context review options.
- Biomarker drawer with five categories and 16 predefined sample markers.
- Patient context side panel and inline context review/approval interactions.
- Timed diet-plan generation and a modal plan-review experience.
- Meal accordion sections with in-browser item editing, adding/removing items, visual regeneration, and approval feedback.

## Known Limitations

- All clinical/patient/report/plan content is sample UI data; uploaded file contents are not read or analyzed.
- Authentication and social sign-in buttons do not authenticate users; they only route after a simulated delay.
- Chat replies are predefined browser-side messages rather than AI output.
- Diet-plan generation uses hard-coded data and does not persist changes.
- Export PDF only shows button feedback and does not produce a file.
- Forgot password, Settings, Privacy, and Terms are not implemented destinations/actions; Book Demo redirects to sign-up.
- The source does not verify visible marketing, endorsement, security, HIPAA-compliance, or clinical-validation claims.
- Existing code contains documented prototype issues, including broken drag-over highlight handling, possible auth-page scroll errors from shared landing logic, bypassable form validation behavior, and unescaped HTML insertion. See `IMPLEMENTATION_AUDIT.md` for details.

## Future Scope

- Implement real authentication, account/session handling, and protected dashboard navigation.
- Add secure patient/report storage and validated file ingestion.
- Integrate report extraction and clinically reviewed diet-plan generation services.
- Persist patient context, conversations, plans, approvals, and audit trails.
- Implement secure PDF export and working legal/account-support destinations.
- Add accessibility, security, privacy/compliance, clinical-safety, and usability review.
- Add automated tests and split/organize dashboard code once product behavior is defined.
- Resolve the existing browser-side functional and input-safety issues recorded in the audit.

## Analysis Assumptions

- `Dietician/` is treated as the project root because it contains the tracked application source and its Git metadata.
- Only repository files present during this review were considered; no backend or external service is assumed.
- Text that describes AI analysis, compliance, encryption, validation, customers, testimonials, or outcomes is treated as UI copy unless supported by implementation in this repository.
- "Implemented" means a visible screen or browser-side interaction exists, not that the underlying real-world service has been delivered.

For a feature-by-feature implementation assessment and source responsibility map, read [IMPLEMENTATION_AUDIT.md](./IMPLEMENTATION_AUDIT.md).
