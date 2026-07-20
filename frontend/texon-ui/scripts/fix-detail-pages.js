const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function fixPage(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')

  const match = content.match(
    /export default function (\w+)\(\) \{\s*\n\s+const params = useParams\(\)/
  )
  if (!match) return false

  const componentName = match[1]
  const innerName = componentName + 'Inner'

  content = content.replace(
    `export default function ${componentName}() {\n  const params = useParams()`,
    `function ${innerName}() {\n  const params = useParams()`
  )

  const exportMatch = content.match(
    new RegExp(
      `return <MerchandisingDetail module="[^"]+" title="[^"]+" fields={fields} data=\\{data\\} isLoading=\\{isLoading\\} error=\\{error\\} />`
    )
  )
  if (!exportMatch) return false

  const returnLine = exportMatch[0]

  content = content.replace(
    returnLine,
    `${returnLine}\n}\n\nexport default function ${componentName}() {\n  return (\n    <React.Suspense fallback={${returnLine.replace('data={data}', 'data={null}').replace('isLoading={isLoading}', 'isLoading={true}').replace('error={error}', 'error={null}')}}>\n      <${innerName} />\n    </React.Suspense>\n  )\n}`
  )

  fs.writeFileSync(filePath, content)
  return true
}

const baseDir = path.join(__dirname, '..', 'app', 'merchandising')
const dirs = fs.readdirSync(baseDir).filter(f => {
  const full = path.join(baseDir, f)
  return fs.statSync(full).isDirectory() && !f.startsWith('_') && !f.startsWith('.')
})

let fixed = 0
for (const dir of dirs) {
  const detailDir = path.join(baseDir, dir, '[id]')
  const pageFile = path.join(detailDir, 'page.tsx')
  if (fs.existsSync(pageFile)) {
    if (fixPage(pageFile)) {
      console.log(`Fixed: ${dir}/[id]/page.tsx`)
      fixed++
    }
  }
}
console.log(`\nFixed ${fixed} detail pages`)
