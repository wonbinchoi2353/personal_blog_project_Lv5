const express = require('express');
const { Posts, Likes } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

// 게시글 좋아요
router.put('/posts/:postId/like', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;

  const post = await Posts.findByPk(postId);

  if (!post) {
    return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
  }

  if (userId === post.userId) {
    return res.status(401).json({ errorMessage: '내 게시글에는 좋아요를 할 수 없습니다.' });
  }

  try {
    const like = await Likes.findOne({ where: { userId } });
    if (!like) {
      await Likes.create({ userId, postId });
      return res.status(200).json({ message: '게시글의 좋아요를 등록하였습니다.' });
    } else if (like) {
      await Likes.destroy({ where: { userId, postId } });
      return res.status(200).json({ message: '게시글의 좋아요를 취소하였습니다.' });
    }
  } catch (error) {
    res.status(400).json({ errorMessage: '게시글 좋아요에 실패하였습니다.' });
    console.log('errorMessage: ' + error.message);
  }
});

module.exports = router;
