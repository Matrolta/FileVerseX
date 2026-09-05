export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  password: string;
  descripcion?: string;
  fotoPerfil?: string;
}