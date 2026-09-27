import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { SentMessageInfo, Transporter } from 'nodemailer';
import { envs } from '../config/envs';

export type RegisterUserMailPayload = {
  email: string;
  name: string;
  lastName: string;
  password?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envs.mailHost,
      port: Number(envs.mailPort),
      auth: {
        user: String(envs.mailUser),
        pass: String(envs.mailPass),
      },
      logger: true,
      debug: true,
    });
  }

  async sendRegisterUserCredentials(
    payload: RegisterUserMailPayload,
  ): Promise<void> {
    const { email, name, lastName, password } = payload;
    const fullName = `${name} ${lastName}`.trim();

    try {
      const info: SentMessageInfo = await this.transporter.sendMail({
        from: envs.mailFrom,
        to: email,
        subject: 'Credenciales de acceso',
        text: [
          `Hola ${fullName},`,
          '',
          'Se ha creado tu cuenta. Estos son tus datos de acceso:',
          `Usuario (email): ${email}`,
          `Contraseña temporal: ${password ?? '(no disponible)'}`,
          '',
          'Te recomendamos cambiar la contraseña al iniciar sesión.',
        ].join('\n'),
        html: `
          <p>Hola <strong>${fullName}</strong>,</p>
          <p>Se ha creado tu cuenta. Estos son tus datos de acceso:</p>
          <ul>
            <li><strong>Usuario (email):</strong> ${email}</li>
            <li><strong>Contraseña temporal:</strong> ${password ?? '(no disponible)'}</li>
          </ul>
          <p>Te recomendamos cambiar la contraseña al iniciar sesión.</p>
        `,
      });

      this.logger.log(
        `Correo SMTP aceptado messageId=${info.messageId} accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)} response=${info.response}`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando correo de registro a ${email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
