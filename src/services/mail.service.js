import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass,
      },
    });
  }

  return transporter;
}

export async function sendTicketConfirmationEmail({ to, userName, event, reservationCode, quantity }) {
  const eventDate = new Date(event.date).toLocaleString('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const html = `
    <h2>¡Inscripción confirmada!</h2>
    <p>Hola ${userName},</p>
    <p>Tu inscripción al evento <strong>${event.title}</strong> fue confirmada.</p>
    <ul>
      <li><strong>Fecha:</strong> ${eventDate}</li>
      <li><strong>Lugar:</strong> ${event.location}</li>
      <li><strong>Entradas:</strong> ${quantity}</li>
      <li><strong>Código de reserva:</strong> ${reservationCode}</li>
    </ul>
    <p>¡Te esperamos!</p>
  `;

  await getTransporter().sendMail({
    from: config.mail.from,
    to,
    subject: `Confirmación de inscripción: ${event.title}`,
    html,
  });
}
