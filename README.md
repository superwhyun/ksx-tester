# ksx-tester

## Prerequisite

```
$ sudo apt-get update
$ sudo apt-get upgrade
$ sudo apt-get install -y build-essential
$ sudo apt-get install curl
$ curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash --
$ sudo apt-get install -y nodejs

```


## 구성

###	serialserver
테스트용 모드버스 서버 (라즈베리파이에서 실행)

- 설치
  ```
  cd serialserver
  npm install
  ```

- 실행
  - 현재 연결된 usb serialport 보기
    ```
    node serialserver.js list
    ```
  - 장비 규격파일에 맞게 서버 실행하기
    ```
    node serialserver.js ‘serialport path’ ‘장비규격파일’
    e.g, node serialserver.js /dev/tty.USB0 ./nodeSpec.json
    ```

###	smartfarm 
react 기반 웹UI

- 설치
  ```
  npm install
  ```
- build - 아래 명령어 실행하면 smartfarm/build 디렉토리에 배포됨
  ```
  npm run build
  ```

###	server
nodejs 기반 웹서버(smartfarm 을 돌리기 위한)

- 설치
  ```
  npm install
  ```
- 실행
  - smartfarm 디렉토리 안의 build 디렉토리를 target으로 실행되므로 디렉토리 구조가 다음과 같아야 함.
  ```
  server
  smartfarm/build
  ```
  - Default 실행 포트는 8000, 실행되는 포트를 변경하려면 server.js 파일 맨 윗줄의 const port = 8000; 부분을 수정하고 아래 명령어로 실행
  ```
  node server.js
  ```