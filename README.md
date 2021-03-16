# ksx-tester


## 디렉토리 구성

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

###	server
nodejs 기반 웹서버(smartfarm 을 돌리기 위한)

- 설치
  ```
  npm install
  ```
- 실행
  - Default 실행 포트는 8000, 실행되는 포트를 변경하려면 server.js 파일 맨 윗줄의 const port = 8000; 부분을 수정하고 실행
  - 이미 빌드된 파일들이 build 디렉토리에 포함되어 있기 때문에 아무 작업없이 바로 실행 가능.


###	smartfarm 
react 기반 웹UI
- smartfarm 디렉토리 안의 build 디렉토리를 target으로 실행되므로 디렉토리 구조가 다음과 같아야 함.
- UI 소스 수정이 필요 없다면 smartfarm 디렉토리는 추가 작업 필요 없음


