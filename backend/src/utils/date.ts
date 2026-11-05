export function getTodayDate(): Date {
  // Pega a data atual no fuso de São Paulo no formato YYYY-MM-DD
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
  // Retorna o objeto Date no padrão UTC para o Prisma salvar corretamente
  return new Date(`${dateStr}T00:00:00Z`);
}
