/**
 * Mostra branch, último commit e remotes para comparar com a Vercel.
 * Rode: npm run deploy:check
 */
const { execSync } = require("child_process")

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8" }).trim()
  } catch {
    return "(erro ao rodar comando)"
  }
}

const branch = run("git branch --show-current")
const commit = run("git rev-parse --short HEAD")
const remotes = run("git remote -v")

console.log("")
console.log("=== Diagnóstico para deploy na Vercel ===")
console.log("")
console.log("Branch atual:", branch)
console.log("Último commit (compare na Vercel → Deployments):", commit)
console.log("")
console.log("Remotes (para qual repo você dá push):")
console.log(remotes)
console.log("")
console.log("Próximo passo: Vercel → Settings → Git")
console.log("  - Anote 'Connected Git Repository' e 'Production Branch'")
console.log("  - Seu push deve ser para esse repo e essa branch.")
console.log("  - Deployments deve mostrar um deploy com commit:", commit)
console.log("")
