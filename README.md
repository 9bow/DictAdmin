## 개요
DictAdmin은 [한국어 형태소 분석기 KOMORAN](https://github.com/shin285/KOMORAN)의 사용자 사전을 관리하는 도구입니다.

## 기능
* 목록 / 정렬
  * ![List](./public/demo/DictAdminDemo-List.gif)
  * `단어` / `품사` / `빈도`를 표시합니다.
  * 상단의 제목을 누르면 해당 `단어` / `품사` / `빈도`를 기준으로 정렬합니다.
    * 상단의 제목을 누를 때마다 정렬 방법(내림차순 / 올림차순)이 변경됩니다.
    * 정렬 기준이 변경될 때마다 화살표의 위치가 변경됩니다.
    * 현재 정렬 기준의 제목 옆의 화살표가 활성화됩니다.
    * 기본 정렬은 `단어` 기준, `오름차순` 정렬입니다.
  * 우측 하단의 페이지 번호를 누를 때마다 해당 페이지로 이동합니다.
    * Prev 버튼은 이전 페이지로, Next 버튼은 다음 페이지로 이동합니다.
    * First 버튼은 가장 처음 페이지로, Last 버튼은 가장 마지막 페이지로 이동합니다.
    * 이동할 수 없는 경우 해당 버튼이 활성화되지 않습니다.
* 검색
  * ![Search](./public/demo/DictAdminDemo-Filter.gif)
  * `단어` 검색은 입력한 글자가 포함된 모든 단어를 검색합니다.
  * `품사` 검색은 선택한 품사에 해당하는 모든 단어를 검색합니다.
  * `빈도` 검색은 입력한 빈도보다 높은 빈도 값을 검색합니다.
* 단어 등록
  * ![AddItem](./public/demo/DictAdminDemo-Add.gif)
  * 새로운 단어를 등록합니다.
  * 다음 중 하나 이상에 해당될 때에는 새로운 단어의 등록이 불가능합니다.
    * `단어`가 등록되지 않은 경우
    * `품사`가 선택되지 않거나, 품사 목록에 없는 품사인 경우
    * `빈도`가 자연수가 아닌 경우 (0보다 작거나 같은 경우)
    * 동일한 `단어` / `품사`를 갖는 단어가 이미 존재할 경우
  * 등록된 단어는 현재 보이는 목록의 가장 아래에 추가되어 보입니다.
* 단어 변경
  * ![EditItem](./public/demo/DictAdminDemo-Edit.gif)
  * 이미 등록된 단어의 `품사` 또는 `빈도`를 변경합니다.
  * 동일한 `단어` / `품사`를 갖는 단어가 이미 존재할 경우 변경이 불가능합니다.
* 단어 삭제
  * ![DelItem](./public/demo/DictAdminDemo-Delete.gif)
  * 등록된 단어의 가장 오른쪽 아이콘을 클릭하면 해당 단어가 삭제됩니다.
  * 한 번 삭제한 단어는 다시 되돌릴 수 없습니다.
* 파일 올리기
  * ![UploadFile](./public/demo/DictAdminDemo-Upload.gif)
  * [KOMORAN 형태소 분석기](https://github.com/shin285/KOMORAN)의 [사용자 단어 파일](https://github.com/shin285/KOMORAN/blob/master/corpus_build/dic.word)(`dic.word`)을 올릴 수 있습니다.
* 파일 내려받기
  * ![DownloadFile](./public/demo/DictAdminDemo-Download.gif)
  * 현재 보고 있는 단어 목록을 [KOMORAN 형태소 분석기](https://github.com/shin285/KOMORAN)의 [사용자 단어 파일](https://github.com/shin285/KOMORAN/blob/master/corpus_build/dic.word)(`dic.word`) 형태로 다운로드 받습니다.

## 사용법
### 환경
* node.js 8.11.3 이상
* Chrome Browser

### 설치
* Git을 이용하여 DictAdmin 저장소를 복제합니다.
  ```sh
    git clone https://github.com/9bow/DictAdmin
    cd DictAdmin
  ```
    * 또는, [다음 링크](https://github.com/9bow/DictAdmin/releases)에서 소스 코드를 내려받은 후 압축을 풉니다.
* 필요한 모듈을 설치합니다.
  ```sh
    npm install
  ```
* `bin/www`을 실행합니다.
  ```sh
    npm start
  ```
* Chrome Browser를 열고 [http://localhost:3000](http://localhost:3000) 에 접속합니다.

### 사용법
*TBD*

### 알려진 문제
* 문제. `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory` 오류가 발생하며 실행을 멈춥니다.
* 해결. 이 문제는 주로 사전 파일의 크기가 클 때 발생합니다. 다음의 명령어로 다시 구동해보세요.
    ```sh
      node --max-old-space-size=4096 ./bin/www
    ```

## TODO
* [x] 새로운 Item 추가 기능
* [x] 사전 파일(`.word`) 업로드 기능
  * [ ] 임시 디렉토리(`./temp`) 내 파일 삭제
  * [ ] 파일 업로드 기능 테스트
* [ ] 포함된 CSS/JS 라이브러리들의 LICESNE 추가
