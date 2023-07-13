const jwt = require('jsonwebtoken');
const { Users } = require('../models');
require('dotenv').config(); // env 환경변수
const env = process.env; // env 환경변수

module.exports = async (req, res, next) => {
  try {
    // 객체를 변수로 바꾸기
    const { authorization } = req.cookies;

    // 쿠키가 존재하지 않을 경우
    if (!authorization) {
      return res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
    }

    // 문자열 나눠서 각 변수에 할당
    const [tokenType, token] = authorization.split(' ');
    if (tokenType !== 'Bearer') {
      return res.status(401).json({ message: '토큰 타입이 일치하지 않습니다.' });
    }

    // jwt 확인 (token과 비밀 키 사용)
    const decodedToken = jwt.verify(token, env.JWT_KEY_NAME);

    // 토큰에 저장했던 userId
    const userId = decodedToken.userId;
    const user = await Users.findOne({ where: { userId } });
    if (!user) {
      res.clearCookie('authorization');
      return res.status(401).json({ message: '토큰 사용자가 존재하지 않습니다.' });
    }

    // 미들웨어와 라우터 간에 데이터 전달하기 위한 객체
    res.locals.user = user;

    next();
  } catch (error) {
    // 쿠키가 만료된 경우, *이렇게 쓰는 게 아닌 거 같음
    if (error instanceof jwt.TokenExpiredError) {
      res.clearCookie('authorization');
      return res.status(403).json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }
    res.clearCookie('authorization');
    res.status(401).json({ message: '비정상적인 요청입니다.' });
    console.log('errorMessage: ' + error.message);
  }
};
