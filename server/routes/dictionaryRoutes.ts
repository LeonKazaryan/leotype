import { Router } from 'express'
import { getDictionaryWords } from '../controllers/dictionaryController.js'

const router = Router()

router.get('/words', getDictionaryWords)

export { router as dictionaryRouter }
