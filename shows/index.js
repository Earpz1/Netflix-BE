import express, { response } from 'express'
import fs from 'fs'
import { getShows, writeShow } from '../lib/fs-func.js'
import uniqid from 'uniqid'
import httpErrors from 'http-errors'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { getPDFReadableStream } from '../lib/pdf-tools.js'
import { pipeline } from 'stream'

const { NotFound } = httpErrors

const moviePosterUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'Netflix',
    },
  }),
}).single('moviePoster')

const showsRouter = express.Router()

//Get Shows
showsRouter.get('/', async (request, response, next) => {
  try {
    const data = await getShows()
    response.send(data)
  } catch (error) {
    next(error)
  }
})

//Post a new show
showsRouter.post('/', async (request, response, next) => {
  try {
    const newShow = { ...request.body, imdbID: uniqid() }

    const showsArray = await getShows()

    showsArray.push(newShow)
    await writeShow(showsArray)
    response.status(201).send(newShow)
  } catch (error) {
    next(error)
  }
})

//Get a specific show
showsRouter.get('/:id', async (request, response, next) => {
  try {
    const data = await getShows()
    const id = request.params.id

    const singleShow = data.find((show) => show.imdbID === id)

    if (singleShow) {
      response.send(singleShow)
    } else {
      next(NotFound('There was no show found with that ID'))
    }
  } catch (error) {
    next(error)
  }
})

//Add movie poster to a show

showsRouter.post(
  '/:id/poster',
  moviePosterUploader,
  async (request, response, next) => {
    try {
      const url = request.file.path

      const showData = await getShows()
      const showIndex = showData.findIndex(
        (show) => show.imdbID === request.params.id,
      )

      if (showIndex !== -1) {
        const show = showData[showIndex]
        const newShow = { ...show, poster: url }

        showData[showIndex] = newShow

        await writeShow(showData)
      }

      response.send('File uploaded!')
    } catch (error) {
      next(error)
    }
  },
)

showsRouter.get('/:id/pdf', async (request, response, next) => {
  response.setHeader('Content-Disposition', 'attachment; filename=test.pdf')

  const id = request.params.id
  const showsArray = await getShows()
  const singleShow = showsArray.find((show) => show.imdbID === id)

  const source = await getPDFReadableStream(singleShow)
  const destination = response
  pipeline(source, destination, (error) => {
    if (error) console.log(error)
  })
})

export default showsRouter
