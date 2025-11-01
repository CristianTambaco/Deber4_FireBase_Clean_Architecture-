import { AuthRepository } from "../repositories/AuthRepository";
import { User } from "../entities/User";

export class RegisterUser {
  constructor(private authRepository: AuthRepository) {}

  async execute(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    //  Validar campos obligatorios
    if (!email || !password || !displayName) {
      throw new Error("Todos los campos son requeridos");
    }

    //  Validar formato de email con regex mejorada
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("El formato del email no es válido");
    }

    //  Validar longitud de la contraseña
    if (password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    //  Validar longitud del nombre
    if (displayName.trim().length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }

    //  Llamar al repositorio (Firebase validará si el email ya existe)
    return this.authRepository.register(email.trim(), password, displayName.trim());
  }
}