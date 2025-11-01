// src/domain/usecases/UpdateUserProfile.ts
import { AuthRepository } from "../repositories/AuthRepository";
import { User } from "../entities/User";

export class UpdateUserProfile {
  constructor(private authRepository: AuthRepository) {}

  async execute(displayName: string): Promise<User> {
    if (!displayName.trim()) {
      throw new Error("El nombre no puede estar vacío");
    }
    if (displayName.trim().length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }
    return this.authRepository.updateProfile(displayName.trim());
  }
}