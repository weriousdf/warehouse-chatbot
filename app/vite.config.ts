import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'

// 개발 서버 전용 — build-vectors.html이 브라우저에서 만든 벡터스토어를 public/warehouse-docs.json에 저장한다.
// 질문 임베딩과 똑같은 브라우저 모델로 문서 벡터를 만들기 위해서다(npm run dev 때만 동작).
function saveVectors(): Plugin {
  return {
    name: 'save-vectors',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__save-vectors', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        let body = ''
        req.setEncoding('utf8')
        req.on('data', (c) => (body += c))
        req.on('end', () => {
          const docs = JSON.parse(body)
          writeFileSync('public/warehouse-docs.json', JSON.stringify(docs), 'utf8')
          res.end(`저장: public/warehouse-docs.json — ${docs.length}청크`)
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), saveVectors()],
  base: './',
})
