export {}

async function main() {
  const args = process.argv.slice(2)
  if (args[0] === '--') args.shift()

  const prompt = args.join(' ').trim()
  if (!prompt) {
    throw new Error('Please provide a shopping request.')
  }

  const { runShoppingAgent } = await import('../app/lib/agents/shopping/agent')

  console.log(`\nUser: ${prompt}\n`)

  const result = await runShoppingAgent(prompt)

  console.log('Agent:')
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
