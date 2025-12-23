import nodemailer from 'nodemailer';

const toBool = (v) => String(v).toLowerCase() === 'true';
const toInt = (v, def) => {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : def;
};

const MAIL_FROM = process.env.MAIL_FROM || 'GarNet <no-reply@garnet.local>';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: toInt(process.env.SMTP_PORT, 587),
  secure: toBool(process.env.SMTP_SECURE), // false pour 587, true pour 465
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

/**
 * Envoi email "safe" (ne throw pas par défaut si tu veux gérer dehors)
 */
export const sendMailSafe = async ({ to, subject, html, text }) => {
  if (!to) return { ok: false, reason: 'no_recipient' };

  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Erreur envoi email:', err);
    return { ok: false, error: err?.message || String(err) };
  }
};

const formatAr = (n) => `${Number(n || 0).toLocaleString('fr-FR')} Ar`;

const formatDateTimeFR = (date) => {
  try {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(date);
  }
};

/**
 * Email paiement (partiel ou total)
 */
export const sendPaymentEmail = async ({
  to,
  clientName,
  isPartial,
  codeReservation,
  codePaiement,
  montantPayeMaintenant,
  total,
  dejaPaye,
  restant,
  trajet,
  dateDepart,
  cooperativeName,
}) => {
  const subject = isPartial
    ? `GarNet • Paiement partiel reçu (${formatAr(montantPayeMaintenant)})`
    : `GarNet • Paiement confirmé (réservation ${codeReservation})`;

  const intro = isPartial
    ? `Nous avons bien reçu votre paiement partiel.`
    : `Votre paiement est confirmé et votre réservation est validée.`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding: 24px;">
    <div style="max-width: 620px; margin: 0 auto; background:#fff; border-radius: 14px; overflow:hidden; border:1px solid #e7e9f0;">
      <div style="background:#0ea5e9; padding: 18px 20px; color:#fff;">
        <div style="font-size: 18px; font-weight: 800;">GarNet</div>
        <div style="opacity:0.95; margin-top: 4px;">${subject}</div>
      </div>

      <div style="padding: 20px;">
        <p style="margin:0 0 10px 0;">Bonjour ${clientName || 'Client'},</p>
        <p style="margin:0 0 16px 0; color:#334155;">${intro}</p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding: 14px;">
          <div style="display:flex; justify-content:space-between; gap:12px;">
            <div>
              <div style="color:#64748b; font-size:12px;">Réservation</div>
              <div style="font-weight:700; color:#0f172a;">${codeReservation}</div>
            </div>
            <div style="text-align:right;">
              <div style="color:#64748b; font-size:12px;">Paiement</div>
              <div style="font-weight:700; color:#0f172a;">${codePaiement || '-'}</div>
            </div>
          </div>

          <div style="margin-top:12px; color:#0f172a;">
            <div style="color:#64748b; font-size:12px;">Trajet</div>
            <div style="font-weight:600;">${trajet || '-'}</div>

            <div style="margin-top:8px; color:#64748b; font-size:12px;">Départ</div>
            <div style="font-weight:600; color:#0f172a;">${dateDepart ? formatDateTimeFR(dateDepart) : '-'}</div>

            <div style="margin-top:8px; color:#64748b; font-size:12px;">Coopérative</div>
            <div style="font-weight:600; color:#0f172a;">${cooperativeName || '-'}</div>
          </div>
        </div>

        <div style="margin-top: 16px; border-top:1px dashed #e2e8f0; padding-top: 14px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span style="color:#64748b;">Montant payé maintenant</span>
            <b style="color:#0f172a;">${formatAr(montantPayeMaintenant)}</b>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span style="color:#64748b;">Total</span>
            <b style="color:#0f172a;">${formatAr(total)}</b>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
            <span style="color:#64748b;">Déjà payé</span>
            <b style="color:#0f172a;">${formatAr(dejaPaye)}</b>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#64748b;">Reste à payer</span>
            <b style="color:${isPartial ? '#f59e0b' : '#22c55e'};">${formatAr(restant)}</b>
          </div>
        </div>

        <p style="margin: 18px 0 0 0; color:#64748b; font-size:12px;">
          Si vous n'êtes pas à l'origine de ce paiement, veuillez contacter notre support.
        </p>
      </div>
    </div>
  </div>
  `;

  const text = `
GarNet - ${subject}

Bonjour ${clientName || 'Client'},
${intro}

Réservation: ${codeReservation}
Paiement: ${codePaiement || '-'}
Trajet: ${trajet || '-'}
Départ: ${dateDepart ? formatDateTimeFR(dateDepart) : '-'}
Coopérative: ${cooperativeName || '-'}

Montant payé maintenant: ${formatAr(montantPayeMaintenant)}
Total: ${formatAr(total)}
Déjà payé: ${formatAr(dejaPaye)}
Reste à payer: ${formatAr(restant)}
`.trim();

  return sendMailSafe({ to, subject, html, text });
};