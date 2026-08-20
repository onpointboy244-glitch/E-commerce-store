import { Router } from "express";
import checkSignupRouter from "./checkSignup.js";
import checkLoginRouter from "./checkLogin.js";
import reportVerifyRouter from "./reportVerify.js";
import completeSignupRouter from "./completeSignup.js";
import completeGoogleRouter from "./completeGoogle.js";

const router = Router();

router.use(checkSignupRouter);
router.use(checkLoginRouter);
router.use(reportVerifyRouter);
router.use(completeSignupRouter);
router.use(completeGoogleRouter);

export default router;
