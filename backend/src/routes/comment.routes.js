import { Router } from "express";
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
  getReplies,
} from "../controllers/comment.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/:targetId")
  .get(optionalVerifyJWT, getComments)
  .post(verifyJWT, addComment);
router
  .route("/:commentId")
  .delete(verifyJWT, deleteComment)
  .patch(verifyJWT, updateComment);
router.route("/:commentId/replies").get(verifyJWT, getReplies);

export default router;
