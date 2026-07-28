# Garbin — AI Waste Collection & Predictive Routing Agent

Garbin replaces fixed waste-pickup schedules with a live municipal workflow. Citizens report a bin with a photo, Gemini classifies the report, a custom heuristic flags at-risk bins, and the routing service prioritizes sanitation stops.

## Actual technology stack

| Layer | What is implemented |
| --- | --- |
| Citizen reporting | Gemini 2.5 Flash image classification through the Google Gen AI SDK |
| Authentication | Firebase Authentication anonymous sign-in; the app sends Firebase ID tokens for state-changing API requests |
| Persistence | Cloud Firestore collections: `bins`, `reports`, and `routes`, accessed on the backend through the Firebase Admin SDK |
| Prediction | Custom rule-based heuristic using report frequency and time since pickup; **not Vertex AI** |
| Routing | Node.js priority ordering plus OSRM road routing |
| Integration | MCP-compatible tool schema and interactive inspector |
| Hosting | Single Express service that serves the Vite build and `/api` endpoints; ready for Cloud Run |

## Firebase Console setup

1. Open [Firebase Console](https://console.firebase.google.com/), select **Add project**, name it `garbin`, and create it. Do not commit any credentials produced during this process.
2. In **Build → Firestore Database**, select **Create database**, choose **Production mode**, select the region nearest to the deployment (for Bengaluru, choose an India/Asia region if available), and confirm.
3. In **Build → Authentication → Sign-in method**, enable **Anonymous** and save. This is required before the browser can submit reports or use staff write actions.
4. In **Project settings → General**, register a **Web app**. Copy its config values into the `VITE_FIREBASE_*` variables from `.env.example`. These are build-time variables, so set them in the frontend build environment on Render or Cloud Run.
5. In **Project settings → Service accounts**, click **Generate new private key** and download the JSON only to a secure local location. For local development, copy `project_id`, `client_email`, and `private_key` to `backend/.env`. For a managed deployment, put the JSON in the secret `FIREBASE_SERVICE_ACCOUNT_JSON` (one-line JSON), or prefer an attached runtime service account with Firestore access.
6. Install the Firebase CLI, authenticate, then deploy the included rules:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
   ```

   The included `firebase.json` points the Firebase CLI at `firestore.rules`. The rules allow public Firestore reads and only authenticated direct writes. The Express API independently verifies Firebase ID tokens before every state-changing endpoint; Admin SDK writes bypass Firestore client rules.

7. Install dependencies, seed once, and start the application:

   ```bash
   npm install
   cd backend
   npm install
   npm run seed
   cd ..
   npm run build
   node backend/index.js
   ```

   `npm run seed` is idempotent: it creates the six Bengaluru demo bins and four historical reports only when the `bins` collection is empty. It never overwrites an existing demo or production dataset.

## Environment variables

Copy `.env.example` to a secure local `.env` and copy `backend/.env.example` to `backend/.env`. Do not commit either file.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | frontend | Optional API override; leave empty for same-origin `/api` |
| `VITE_FIREBASE_API_KEY` | frontend | Firebase Web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | frontend | Firebase Web app auth domain |
| `VITE_FIREBASE_PROJECT_ID` | frontend | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | frontend | Firebase Web app storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | frontend | Firebase Web app messaging sender ID |
| `VITE_FIREBASE_APP_ID` | frontend | Firebase Web app ID |
| `GEMINI_API_KEY` | backend | Existing Gemini image-classification integration |
| `FIREBASE_PROJECT_ID` | backend | Firebase project ID used by Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | backend | Service-account client email |
| `FIREBASE_PRIVATE_KEY` | backend | Service-account private key; retain literal `\\n` separators |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | backend | Optional one-variable alternative to the three service-account variables |
| `PORT` | backend | Express port, defaults to `8080` |

## API and data model

The frontend retains its same-origin API convention from `src/config.js`. API response shapes remain unchanged while persistence is now Firestore-backed:

- `GET /api/bins` reads `bins` and `reports`, then applies the predictive heuristic.
- `POST /api/report` verifies an anonymous Firebase ID token, calls the existing Gemini flow, and writes a `reports` document.
- `POST /api/bins/pickup` verifies a token, updates the bin, and clears its related reports.
- `POST /api/generate-route` verifies a token and stores the generated route in `routes`.
- `GET /api/analytics` and MCP calls read the same Firestore collections.

## Vertex AI decision

Garbin deliberately uses **Option A** for the hackathon: the prediction layer is accurately labelled as a custom predictive heuristic, not Vertex AI. This is the lower-risk path because a credible Vertex AI deployment requires model training/evaluation data, endpoint provisioning, IAM configuration, and live inference verification. Add Vertex AI only when it can be demonstrated end-to-end; until then, do not mention Vertex AI in the pitch, UI, or submission form.
