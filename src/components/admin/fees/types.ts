export type PaymentStatus = "em_dia" | "pendente" | "em_atraso" | "arquivado";

export interface Unidade {
  id: string;
  ord: number;
  bloco: number;
  edificio: number;
  apartamento: number;
  nome: string;
  contacto: string;
  via: string;
}

export interface Taxa {
  id: string;
  unidade_id: string;
  user_id: string;
  mes_referencia: number;
  ano_referencia: number;
  valor: number;
  valor_pago: number;
  data_pagamento?: string;
  status: PaymentStatus;
  due_date: string;
  receipt_url?: string | null;
  payment_method?: string | null;
}

export const VALOR_TAXA_MENSAL = 1000;

export const MESES_LABELS: Record<number, string> = {
  1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
  5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
  9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
};

export const MESES_SHORT: Record<number, string> = {
  1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr",
  5: "Mai", 6: "Jun", 7: "Jul", 8: "Ago",
  9: "Set", 10: "Out", 11: "Nov", 12: "Dez"
};

export function calcStatus(valor: number, valorPago: number): PaymentStatus {
  if (valorPago >= valor) return "em_dia";
  if (valorPago > 0) return "pendente";
  return "em_atraso";
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " MT";
}
