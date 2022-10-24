코드 수정 이후에 electron-builder 으로 빌드할 때 yarn make같은 거로 electron-forge 실행해줘야 .webpack 디렉토리 갱신되어 변경된 코드로 빌드할 수 있음.


# TODO 
- 새 아이콘 추가할 때 아이콘이 없어도 추가가 가능함. 허용해야 할까?
- ~~목표: 100MB이하의 단일 exe파일~~
- ~~`tags`가 없으면 안불러와지나? 한글경로면 안불러와지나?~~ => js파일에 주석이 달려있어서 생긴 문제. `JSON5`모듈로 해결
- `isUniqueIcon` `isValidIcon` 등 타입 체크 함수 수정이 필요함.
- 일관된 메시지 뷰어