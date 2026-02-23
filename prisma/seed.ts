import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaultServices = [
  { id: "corte", name: "Corte Classico", desc: "Corte masculino com tesoura e maquina", price: "R$ 45", duration: "40 min" },
  { id: "barba", name: "Barba Completa", desc: "Barba com toalha quente e navalha", price: "R$ 35", duration: "30 min" },
  { id: "combo", name: "Combo Premium", desc: "Corte + Barba + Toalha quente", price: "R$ 70", duration: "60 min" },
  { id: "sobrancelha", name: "Design Sobrancelha", desc: "Alinhamento e limpeza com navalha", price: "R$ 20", duration: "15 min" },
  { id: "hidratacao", name: "Hidratacao Capilar", desc: "Tratamento profundo para cabelos", price: "R$ 50", duration: "45 min" },
]

async function main() {
  for (const s of defaultServices) {
    await prisma.service.upsert({
      where: { id: s.id },
      create: s,
      update: { name: s.name, desc: s.desc, price: s.price, duration: s.duration },
    })
  }
  console.log("Seed: serviços padrão criados.")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
