const express = require('express');
const { Users, Posts, Comments } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

// 댓글 생성
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const { userId } = res.locals.user;

  if (Object.keys(req.body).length === 0) {
    return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }

  const post = await Posts.findByPk(postId);

  if (!post) {
    return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
  }

  try {
    await Comments.create({ comment, userId, postId });

    res.status(201).json({ message: '댓글을 작성하였습니다.' });
  } catch (error) {
    res.status(400).json({ errorMessage: '댓글 작성에 실패하였습니다.' });
    console.log('errorMessage: ' + error.message);
  }
});

// 댓글 목록 조회
router.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  const post = await Posts.findByPk(postId);

  if (!post) {
    return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
  }

  try {
    const comments = await Comments.findAll({
      attributes: ['commentId', 'userId', 'comment', 'createdAt', 'updatedAt'],
      include: [{ model: Users, as: 'user', attributes: ['nickname'] }],
      order: [['createdAt', 'desc']],
    });

    res.status(200).json({ comments });
  } catch (error) {
    res.status(400).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
    console.log('errorMessage: ' + error.message);
  }
});

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params;
  const { comment } = req.body;
  const { userId } = res.locals.user;

  if (Object.keys(req.body).length === 0) {
    return res.status(412).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    // req.body에서 comment 없어도 오류 없는 이유 모르겠음
  } else if (comment === '') {
    return res.status(412).json({ errorMessage: '댓글의 형식이 일치하지 않습니다.' });
  }

  const post = await Posts.findByPk(postId);
  const dbComment = await Comments.findByPk(commentId);

  if (!post) {
    return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
  }

  if (!dbComment) {
    return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
  }

  if (userId !== dbComment.userId) {
    return res.status(403).json({ errorMessage: '댓글의 수정 권한이 존재하지 않습니다.' });
  }

  try {
    await Comments.update({ comment }, { where: { userId, postId, commentId } });

    const verifyComment = await Comments.findByPk(commentId);

    if (verifyComment.comment !== comment) {
      return res.status(400).json({ errorMessage: '댓글 수정이 정상적으로 처리되지 않았습니다.' });
    }

    res.status(200).json({ message: '댓글을 수정하였습니다.' });
  } catch (error) {
    res.status(400).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
    console.log('errorMessage: ' + error.message);
  }
});

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = res.locals.user;

  const post = await Posts.findByPk(postId);

  if (!post) {
    return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
  }

  const comment = await Comments.findByPk(commentId);

  if (!comment) {
    return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
  }

  if (userId !== comment.userId) {
    return res.status(403).json({ errorMessage: '댓글의 삭제 권한이 존재하지 않습니다.' });
  }

  try {
    await Comments.destroy({ where: { userId, postId, commentId } });

    const verifyComment = await Comments.findByPk(commentId);

    if (verifyComment) {
      return res.status(400).json({ errorMessage: '댓글 삭제가 정상적으로 처리되지 않았습니다.' });
    }

    res.status(200).json({ message: '댓글을 삭제하였습니다.' });
  } catch (error) {
    res.status(400).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
    console.log('errorMessage: ' + error.message);
  }
});

module.exports = router;
