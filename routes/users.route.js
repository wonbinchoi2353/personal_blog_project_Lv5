const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Users, UserInfos } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
require('dotenv').config(); // env 환경변수
const env = process.env; // env 환경변수

// 회원가입
router.post('/signup', async (req, res) => {
  // Users, UsersInfos 테이블에 추가할 정보
  const { email, nickname, password, confirmPassword, name, age, gender, profileImage } = req.body;

  // 닉네임 정규 표현식 (3자 이상, 알파벳 대소문자, 숫자로 구성되어야 합니다.)
  const nicknameRegex = /^[a-zA-Z0-9]{3,}$/;
  if (!nicknameRegex.test(nickname)) {
    return res.status(412).json({ errorMessage: '닉네임의 형식이 일치하지 않습니다.' });
  }

  // 비밀번호 정규 표현식 (4자 이상 4자 이상, 알파벳 대소문자, 숫자로 구성되어야 합니다.)
  const passwordRegex = /^[a-zA-Z0-9]{4,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(412).json({ errorMessage: '패스워드의 형식이 일치하지 않습니다.' });
  }

  // 패스워드에 닉네임 포함되었는지 확인
  if (password.includes(nickname)) {
    return res.status(412).json({ errorMessage: '패스워드에 닉네임이 포함되어 있습니다.' });
  }

  // password와 confirm 일치 확인
  if (password !== confirmPassword) {
    return res.status(412).json({ errormessage: '패스워드가 일치하지 않습니다.' });
  }

  // 닉네임 중복 확인
  const verifyNickname = await Users.findOne({ where: { nickname } });
  if (verifyNickname) {
    return res.status(412).json({ errormessage: '중복된 닉네임입니다.' });
  }

  // email로 중복 확인
  const verifyUser = await Users.findOne({ where: { email } });
  if (verifyUser) {
    return res.status(400).json({ errorMessage: '이미 존재하는 이메일입니다.' });
  }

  try {
    // 새로운 유저 추가
    const user = await Users.create({ email, nickname, password });
    // 새로운 유저 정보 추가, Users와 같은 userId 공유 (onDelete: cascade 하기 위해)
    await UserInfos.create({
      userId: user.userId,
      name,
      age,
      gender: gender.toUpperCase(),
      profileImage,
    });

    return res.status(201).json({ message: '회원 가입에 성공하였습니다.' });
  } catch (error) {
    res.status(400).json({ errorMessage: '요청한 데이터 형식이 올바르지 않습니다.' });
    console.log('errorMessage: ' + error.message);
  }
});

// 로그인
router.post('/login', async (req, res) => {
  const { email, nickname, password } = req.body;
  // email 또는 nickname 중 하나로 로그인
  let user;
  if (email) {
    user = await Users.findOne({ where: { email } });
  } else if (nickname) {
    user = await Users.findOne({ where: { nickname } });
  } else {
    return res.status(403).json({ errorMessage: '닉네임 또는 이메일을 입력해주세요.' });
  }

  // 유저의 존재와 패스워드 일치 확인,
  if (!user || user.password !== password) {
    return res.status(412).json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
  }

  try {
    // email, password 맞을 때 실행, userId를 token에 저장
    const token = jwt.sign({ userId: user.userId }, env.JWT_KEY_NAME, { expiresIn: '2h' });
    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인 성공' });
  } catch (error) {
    res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
    console.log('errorMessage: ' + error.message);
  }
});

// 로그아웃
router.delete('/logout', (req, res) => {
  // 쿠키 확인
  const { authorization } = req.cookies;
  try {
    // 쿠키 없으면 에러 메세지 전송
    if (!authorization) {
      return res.status(401).json({ errorMessage: '로그인 되어있지 않습니다.' });
    }
    // 쿠키 있으면 삭제
    res.clearCookie('authorization');
    res.status(200).json({ message: '로그아웃 되었습니다.' });
  } catch (error) {
    res.status(400).json({ errorMessage: '잘못된 요청입니다.' });
    console.log('errorMessage: ' + error.message);
  }
});

// 회원탈퇴
router.delete('/signout', authMiddleware, async (req, res) => {
  const { authorization } = req.cookies;
  const { password } = req.body;
  const { userId } = res.locals.user;

  if (!authorization) {
    return res.status(401).json({ errorMessage: '로그인 되어있지 않습니다.' });
  }

  const user = await Users.findByPk(userId);

  // 입력한 비밀번호와 데이터 베이스의 비밀번호 비교
  if (user.password !== password) {
    return res.status(401).json({ errorMessage: '비밀번호가 일치하지 않습니다.' });
  }

  try {
    await Users.destroy({ where: { userId } });
    res.status(200).json({ message: '회원탈퇴가 완료되었습니다.' });
  } catch (error) {
    res.status(400).json({ errorMessage: '잘못된 요청입니다.' });
    console.log('errorMessage: ' + error.message);
  }
});

module.exports = router;
