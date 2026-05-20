export interface TokenizacionFormData {
  tipoProyecto: string;
  nombreProyecto: string;
  descripcion: string;
  aspectosDestacados: string;
  valorActivo: string;
  moneda: string;
  rendimiento: string;
  precioPorToken: string;
  monedaToken: string;
  totalTokens: string;
  simboloToken: string;
  nombreToken: string;
  ventaAnticipada: string;
  fechaVentaAnticipada: string;
  horaVentaAnticipada: string;
  fechaVentaPublica: string;
  horaVentaPublica: string;
  privacidad: string;
  invitarAmigos: string;
}

export interface TokenRightDto {
  id: string;
  title: string;
}

export interface TokenFaqDto {
  id: string;
  question: string;
  answer: string;
}
