const express = require('express');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users.route');
const postsRouter = require('./routes/posts.route');
const commentsRouter = require('./routes/comments.route');
const likesRouter = require('./routes/likes.route');
const app = express();
const port = 3001;

app.use(express.json());
app.use(cookieParser());
app.use('/api', [usersRouter, postsRouter, commentsRouter, likesRouter]);

app.listen(port, () => {
  console.log(port, '포트로 서버가 실행되었습니다.');
});
