const fs = require('fs')
const path = require('path')

function applyPatch() {
  let corePackagePath
  try {
    corePackagePath = require.resolve('playwright-core/package.json', { paths: [process.cwd()] })
  } catch (error) {
    console.warn('playwright-core package not found; skipping trace viewer patch.')
    return
  }

  const coreDir = path.dirname(corePackagePath)
  const targetFile = path.join(coreDir, 'lib', 'server', 'trace', 'viewer', 'traceViewer.js')

  if (!fs.existsSync(targetFile)) {
    console.warn('Trace viewer file not found; skipping patch.')
    return
  }

  let source = fs.readFileSync(targetFile, 'utf8')

  if (source.includes('TRACE_VIEWER_ALLOWED_PROTOCOLS')) {
    return
  }

  source = source.replace(
    'var import_path = __toESM(require("path"));',
    'var import_path = __toESM(require("path"));\nvar import_url = require("url");'
  )

  const sanitisedBlock = `const TRACE_VIEWER_ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);\nfunction sanitizeTraceViewerUrl(rawUrl) {\n  let parsed;\n  try {\n    parsed = new import_url.URL(rawUrl);\n  } catch {\n    throw new Error(\`Invalid trace viewer URL: \${rawUrl}\`);\n  }\n  if (!TRACE_VIEWER_ALLOWED_PROTOCOLS.has(parsed.protocol))\n    throw new Error(\`Unsupported protocol for trace viewer: \${parsed.protocol}\`);\n  if (!parsed.hostname || parsed.hostname === "0.0.0.0" || parsed.hostname === "::")\n    parsed.hostname = "localhost";\n  parsed.username = "";\n  parsed.password = "";\n  return parsed.toString();\n}\nasync function openTraceInBrowser(url) {\n  console.log("\\nListening on " + url);\n  if ((0, import_utils2.isUnderTest)())\n    return;\n  try {\n    const safeUrl = sanitizeTraceViewerUrl(url);\n    await (0, import_utilsBundle.open)(safeUrl).catch(() => {\n    });\n  } catch (error) {\n    if (process.env.PWDEBUG)\n      console.warn("Trace viewer launch blocked:", (error == null ? void 0 : error.message) || error);\n  }\n}`

  const pattern = /async function openTraceInBrowser\(url\) {[\s\S]*?}\r?\nclass StdinServer/
  if (!pattern.test(source)) {
    console.warn('Unexpected trace viewer contents; patch not applied.')
    return
  }

  source = source.replace(pattern, sanitisedBlock + '\nclass StdinServer')

  fs.writeFileSync(targetFile, source, 'utf8')
}

applyPatch()
