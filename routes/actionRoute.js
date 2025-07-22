const express = require("express");
const router = express.Router();
const actionController = require("../controllers/actionController");

router.get("/", actionController.getAllActions);
router.post("/", actionController.createAction);
router.get('/:id', actionController.getActionById);
router.put('/:id', actionController.updateAction);
router.delete('/:id', actionController.deleteAction);
router.get('/type/:type', actionController.getActionsByType);
router.get('/range', actionController.getActionsByRange);
// Thêm các route khác nếu cần

module.exports = router; 