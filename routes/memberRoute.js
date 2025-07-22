const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

router.get('/', memberController.getAllMembers);
router.get('/stats', memberController.getMemberStatistics);
router.get('/search/:memberName', memberController.searchMembersByName);
router.get('/:memberId/full', memberController.getFullMemberById);
router.get('/:memberId', memberController.getMemberById);
router.post('/', memberController.createMember);
router.put('/:memberId', memberController.updateMember);
router.delete('/:memberId', memberController.deleteMember);

module.exports = router; 