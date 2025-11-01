// src/domain/usecases/SendPasswordResetEmail.ts
import { AuthRepository } from "../repositories/AuthRepository";

export class SendPasswordResetEmail {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email.trim()) {
      throw new Error("El email es requerido");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("El formato del email no es válido");
    }
    await this.authRepository.sendPasswordReset(email);
  }
}