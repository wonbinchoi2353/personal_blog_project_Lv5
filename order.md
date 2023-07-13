# order

### 데이터 베이스

1. 데이터베이스 설치

2. npm init, 디펜던시, 데브 디펜던시 설치

- mysql2, express, sequelize, dotenv, jsonwebtoken, cookie-parser
- nodemon, sequelize-cli

3. npx sequelize init (config.json, migrations, models, seeders 생성)

4. .gitignore, .env, api.rest 등 생성 및 작성

5. config.json -> config.js env 변수 설정

6. npx sequelize db:create (config.js로 db생성)

7. 모델 제너레이트, 모델/마이그레이션 작성

8. npx sequelize db:migrate 테이블 생성

### 서버

1. app.js 파일에 서버 생성

### 라우터

1. users.route 회원가입 > 로그인 > 사용자 인증 미들웨어

2. 나머지 작성, 조회, 수정, 삭제
