# Γ.Ε. Σείριος — Επίσημη ιστοσελίδα

Η πρώτη ολοκληρωμένη έκδοση της ιστοσελίδας της **Γυμναστικής Ένωσης Σείριος (Γ.Ε. Σείριος)** στην Καλαμάτα. Πρόκειται για ένα γρήγορο, responsive static site στα ελληνικά, κατασκευασμένο με semantic HTML, CSS και ελάχιστη JavaScript, χωρίς runtime dependencies.

## Περιεχόμενο

- Αρχική και παρουσίαση συλλόγου
- Volleyball και Beach Volley
- Πρόγραμμα προπονήσεων
- Νέα και τουρνουά
- Πρόγραμμα φίλων και υποστηρικτών
- Θέσεις χορηγών
- Gallery και φόρμα επικοινωνίας

Οι εικόνες/θέσεις περιεχομένου είναι προσωρινές και μπορούν να αντικατασταθούν όταν είναι διαθέσιμο το επίσημο φωτογραφικό υλικό και τα λογότυπα χορηγών.

## Ανάπτυξη

```bash
npm run dev
```

Το production build δημιουργείται στον φάκελο `dist`:

```bash
npm run build
npm run preview
```

## Deployment στο Cloudflare Workers

Το repository αναπτύσσεται στο υπάρχον Cloudflare Worker **`seirios-website`**
με το Workers Builds. Στις ρυθμίσεις του Worker ορίστε build command
`npm run build` και deploy command `npx wrangler deploy`. Το `wrangler.toml`
ρυθμίζει το Workers Static Assets ώστε να εξυπηρετεί το παραγόμενο `dist/`.

Για χειροκίνητο deployment με το Wrangler:

```bash
npm run build
npm run deploy
```

Η εντολή κάνει deploy τα static assets στο υπάρχον Worker `seirios-website`.
Δεν δημιουργεί ούτε χρησιμοποιεί Cloudflare Pages project.

> Η φόρμα επικοινωνίας λειτουργεί ως UI επίδειξης. Για αποστολή email, συνδέστε την αργότερα με Worker ή την υπηρεσία φορμών της επιλογής σας.
