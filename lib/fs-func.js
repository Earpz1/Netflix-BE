import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs-extra'

const { readJSON, writeJSON, writeFile } = fs

const dataFolder = join(dirname(fileURLToPath(import.meta.url)), '../data')

const showsJsonFile = join(dataFolder, 'shows.json')

export const getShows = () => readJSON(showsJsonFile)
export const writeShow = (showArray) => writeJSON(showsJsonFile, showArray)
