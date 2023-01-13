import express from 'express'
import { join } from 'path'
import cors from 'cors'
import showsRouter from '../shows/index.js'

const server = express()
const port = process.env.PORT
const publicFolder = join(process.cwd(), './public')

const whitelist = ['localhost:3001']

server.get('/', (request, response) => {
  response.send('Successful Connection')
})

server.use(express.static(publicFolder))

server.use(
  cors({
    origin: (origin, corsNext) => {
      console.log('Origin: ', origin)
      if (!origin || whitelist.indexOf(origin) !== -1) {
        corsNext(null, true)
      } else {
        corsNext(createHttpError(400, `Cors Error!`))
      }
    },
  }),
)

server.use(express.json())

server.use('/medias', showsRouter)

server.listen(port, () => {
  console.log('The server is running on port', port)
})
