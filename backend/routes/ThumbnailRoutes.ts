import express from 'express'
import { deleteThumbnail, generateThumbnail } from '../controllers/ThumbnailController';

const ThumbnailRouter = express.Router();

ThumbnailRouter.post('/generate', generateThumbnail)
ThumbnailRouter.post('/delete/:id', deleteThumbnail)

export default ThumbnailRouter;