# Plostack 프로젝트 디자인 원본

`DESIGN.md`는 현재 프로젝트의 시각 시스템을 정의하는 source of truth다. `pub/`, `styleguide/`, `portfolio/` 산출물을 바꾸기 전에 이 문서의 규칙을 먼저 갱신한다.

## 프로젝트 프레임

- 프로젝트명: Plostack Design Kit
- 제품 유형: 앱/웹 디자인 산출물 키트
- 대상 사용자: 제품 디자이너, 개발자, 포트폴리오 검토자
- 핵심 약속: raw 화면 원본, 디자인 시스템 시각화, 판매용 포트폴리오 합성물, 캡처 증거를 목적별로 분리해 재사용 가능한 기준을 제공한다.
- 현재 산출 범위: 디자인 키트 스캐폴드, 모바일 포트폴리오 snapshot 보존, 웹 관리자 포트폴리오 샘플 export 흐름 정비

## 제품 표면 기준

앱과 웹은 같은 디자인 키트 흐름을 쓰되, 검수 기준과 컴포넌트 inventory를 분리한다.

- `app`: 모바일 앱, Expo/React Native, native-like interaction
- `app-tablet`: 태블릿 앱, split view, master-detail, 넓은 safe area 대응
- `web`: 일반 웹, 반응형 페이지, 데스크톱/모바일 브라우저
- `web-tablet`: 태블릿 브라우저, touch-first web layout, 중간 폭 navigation 대응
- `admin`: 관리자/운영자 웹, dashboard, table, CRUD, filter 중심
- `landing`: 마케팅/전환 페이지
- `portfolio`: 외부 제출, 크몽, 제안서, 포트폴리오 합성물

## 검수 폭 기준

태블릿은 대부분 별도 제품 surface가 아니라 mobile과 desktop 사이의 viewport tier다. 하지만 태블릿에서 화면 구조가 바뀌면 surface 변형으로 승격한다.

- `mobile-narrow`: 344px, Z Fold folded 같은 blocker 폭
- `mobile`: 390px, 기본 모바일 앱/웹 검수 폭
- `tablet-portrait`: 768px, iPad 세로 또는 tablet web 세로
- `tablet-landscape`: 1024px, iPad 가로 또는 작은 desktop 경계
- `desktop`: 1440px, 웹/관리자 기본 검수 폭
- `wide`: 1728px 이상, 넓은 dashboard와 portfolio preview 검수 폭

태블릿에서 별도 검수가 필요한 경우:

- bottom tab이 side navigation이나 rail navigation으로 바뀌는 경우
- 목록과 상세가 master-detail 또는 split view로 동시에 보이는 경우
- web table이 card list로 바뀌거나, 반대로 desktop table을 유지하는 경우
- modal이 side sheet 또는 centered dialog로 전환되는 경우
- touch target과 hover/focus interaction이 동시에 필요한 경우

## 산출물 경계

- `pub/`: 앱/웹 raw publishing hub. 화면 원본이며, 디바이스 목업이나 포트폴리오 합성물이 아니다.
- `pub/app/`: 모바일 앱 raw artboard 원본. 기존 `/pub/?screen=...` 포트폴리오 iframe은 이 경로로 리다이렉트한다.
- `pub/web/`: 반응형 웹 raw publishing 스캐폴드.
- `sitemap.xml`: 이 디자인 키트 사이트 자체의 root sitemap이다.
- `styleguide/sitemap.html`: 제품 repo에 이식할 때 해당 프로젝트의 IA/sitemap 원본으로 쓰는 검수 페이지다.
- `styleguide/`: 이 문서의 sitemap, token, component, pattern, state를 시각화한 검수 페이지.
- `portfolio/kmong/`: 크몽 및 유사 판매 채널용 외부 제출 이미지 허브.
- `portfolio/kmong/mobile/`: 모바일 앱 포트폴리오 대표/상세/페이지 원본.
- `portfolio/kmong/web/`: 반응형 웹사이트 포트폴리오 대표/서브 상세/페이지 원본.
- `pub/web/pages/`: 웹/관리자 raw page 원본. Dashboard, Service, KnowledgeDB처럼 실제 iframe에 들어가는 순수 페이지 UI만 둔다.
- `screenshots/origin/`: 원본 앱/웹 구현 화면 또는 참고 화면 캡처.
- `screenshots/pub/`: raw artboard export 캡처.
- `screenshots/styleguide/`: styleguide QA 캡처.
- `screenshots/portfolio/kmong/mobile/`: 모바일 앱 포트폴리오 최종 export PNG.
- `screenshots/portfolio/kmong/web/`: 웹사이트 포트폴리오 최종 export PNG.
- 웹사이트 포트폴리오 패키지는 대표 썸네일, PC/태블릿/모바일 3기기 서브 상세, 페이지별 관리자 화면 모음으로 구성한다.

## 디자인 원칙

- raw 화면 디자인과 판매용 합성 이미지를 분리한다.
- `pub/web/pages/`는 브라우저 프레임, 디바이스 목업, 썸네일 배경, 크몽 상세 합성을 포함하지 않는 순수 raw page여야 한다.
- `portfolio/kmong/web/`만 크몽용 대표 썸네일, 서브 상세, 페이지 모음 composite를 담당한다.
- 샘플 데이터는 중립적인 가상 운영 데이터로 작성한다. 특정 프로젝트명, 실제 로고, 운영 데이터, `테스트회원`, `QR-TEST`, `테스트그룹`, `가상 ID`처럼 개발 seed로 보이는 값은 포트폴리오 원본에 남기지 않는다.
- 카드 남용을 피하고 기능적 표면을 우선한다. 카드는 반복 데이터, 폼, 모달, 명확히 framed된 도구에만 사용한다.
- 팔레트는 절제하되 한 가지 hue 계열로만 읽히지 않게 구성한다.
- 모바일과 데스크톱 검수 폭 모두에서 텍스트가 컨테이너 안에 들어와야 한다.
- board, toolbar control, counter, tile, phone frame, export canvas처럼 고정 형식 UI는 안정적인 크기를 가져야 한다.
- 최종 export 페이지는 deterministic해야 한다. 고정 canvas 크기, 안정적인 source screenshot, 숨은 네트워크 의존성 없음이 기본이다.
- 웹 포트폴리오 export는 Chrome DevTools Protocol `Page.captureScreenshot` 방식으로 캔버스 영역을 직접 캡처한다. headless `--screenshot`만으로 full page를 찍어 html/body 배경이 하단에 섞이는 방식은 쓰지 않는다.

## 색상 팔레트

### Primary

- `primary.50`: `#F1F8F4` - 연한 강조 배경
- `primary.100`: `#D7ECDC` - 상태 배경
- `primary.300`: `#79B493` - 보조 액션 fill
- `primary.500`: `#2E6A57` - 주요 CTA, 활성 탭, focus ring
- `primary.700`: `#1F4A3D` - 강조 텍스트와 pressed state

### Secondary

- `secondary.100`: `#FFF0DB` - 보조 카드 배경
- `secondary.300`: `#F6B66F` - badge, progress accent
- `secondary.500`: `#C7792C` - 보조 CTA, warning emphasis
- `secondary.700`: `#8B4F13` - 진한 보조 텍스트

### Neutral

- `neutral.0`: `#FFFFFF`
- `neutral.50`: `#F7F5F1`
- `neutral.100`: `#ECE7DF`
- `neutral.200`: `#DDD5CA`
- `neutral.400`: `#8A8075`
- `neutral.500`: `#6D6359`
- `neutral.700`: `#3C342D`
- `neutral.900`: `#1E1A17`

### Semantic

- `success`: `#2C8E65`
- `warning`: `#D38A1F`
- `error`: `#C84B42`
- `info`: `#2D6ECF`

## 타이포그래피

- Font family: `Pretendard`, 없으면 system sans-serif fallback
- `display`: `32 / 38`, `700`
- `title1`: `28 / 34`, `700`
- `title2`: `24 / 30`, `700`
- `title3`: `20 / 28`, `700`
- `headline`: `18 / 25`, `600`
- `body`: `16 / 24`, `500`
- `bodyStrong`: `16 / 24`, `600`
- `label`: `14 / 20`, `600`
- `caption`: `13 / 18`, `500`
- `micro`: `12 / 16`, `500`

## 간격

- 기본 grid: 8pt
- `xs`: 4
- `sm`: 8
- `md`: 16
- `lg`: 24
- `xl`: 32
- `2xl`: 40
- `3xl`: 48

## 반경과 그림자

- `radius.sm`: 10
- `radius.md`: 16
- `radius.lg`: 24
- `radius.pill`: 999
- `shadow.card`: y `10`, blur `24`, alpha `0.08`
- `shadow.float`: y `18`, blur `30`, alpha `0.14`

## 공통 컴포넌트 목록

- Button: `primary`, `secondary`, `ghost`, `danger`; default, pressed, disabled, loading 상태 포함
- Input: label, helper, error, focus ring, 기본 높이 52px
- Card: 독립 데이터 묶음, 결과, 입력, 선택 항목에만 사용
- Badge: `primary`, `secondary`, `success`, `warning`, `error`, `neutral`
- Modal/Sheet: dimmed backdrop, title, body, close action, button slot
- Navigation: surface별 navigation 구조를 분리
- List row: avatar/icon, title, meta, status, trailing action
- Progress surface: 현재 단계, percentage, CTA

## 앱 전용 컴포넌트와 패턴

- 하단 탭이 고정된 모바일 root 화면
- navigation rail 또는 split view를 쓰는 태블릿 앱 root 화면
- 좌상단 back action이 있는 task/detail 화면
- 콘텐츠를 가리지 않는 sticky primary action
- Safe area 기준 header/content/action 배치
- QR/camera 권한 상태
- 지도 패널, marker 상태, fallback map, live SDK 상태
- 포트폴리오용 phone-frame 합성 구조

## 웹/관리자 전용 컴포넌트와 패턴

- Sidebar navigation
- 태블릿 navigation rail 또는 접히는 sidebar
- Topbar/header action 영역
- Data table, dense row, empty table 상태
- Filter bar, search input, segmented control
- Form section, validation summary
- Modal, side sheet, popover menu
- Pagination, bulk action, row selection
- scan-friendly metric을 가진 dashboard section
- desktop/tablet/mobile 반응형 layout

## PLOZEN Ops Console Admin Shell

`pub/web/pages/dashboard.html`, `service.html`, `knowledge.html`은 PLOZEN Ops Console의 현재 live 기준 raw page다. 이 repo에서는 별도 `design-lab/`를 만들지 않고 `design-kit/pub/web/pages/`를 publishing 원본으로 관리한다.

### Runtime Publishing

- `design-kit/pub/web/`은 design-kit publishing 원본이다.
- 11번 개발환경과 13번 Docker 배포환경은 시작 전에 `npm run sync:design-kit`으로 `design-kit/pub/web/`을 `public/design-kit/`에 동기화한다.
- 런타임 URL은 `/design-kit/`을 기준으로 한다. 예: `/design-kit/pages/dashboard.html`.
- `public/design-kit/`은 generated runtime output이므로 git에 커밋하지 않는다. Next 서버 도입 후에도 같은 `public/design-kit/` 경로로 정적 리소스를 서빙한다.

### Shell Layout

- Desktop 기본 폭은 1440px이며 `.dashboard-screen`은 `276px sidebar + fluid main` 2열 grid를 쓴다.
- Sidebar는 짙은 green-black surface를 쓰고, brand lockup과 운영 메뉴를 같은 위치에 고정한다.
- Main padding은 desktop `24px 28px`, mobile `20px 16px 28px`를 기준으로 한다.
- Header는 좌측 eyebrow/title/description, 우측 sync stamp + primary action 구조를 공통으로 쓴다.
- Header action과 form control은 최소 44px touch target을 유지한다.
- 모바일과 900px 이하 viewport에서는 sidebar가 상단 band로 접히고 nav는 2열 grid로 전환한다.

### Visual Rhythm

- `dashboard`, `service`, `knowledge` 모두 `Header -> Metric strip -> Primary section -> Secondary section` 흐름을 유지한다.
- Metric strip 다음 첫 section 간격은 18px로 고정한다. 같은 페이지의 후속 section도 18px 간격을 쓴다.
- Section surface는 카드형 marketing UI가 아니라 얇은 border와 neutral fill을 쓰는 functional surface다.
- 반복 데이터를 큰 카드로 만들지 않는다. Service와 문서는 table/row density를 우선한다.
- Dashboard의 자원/분포 시각화는 운영 첫 화면의 예외적 readout이며, 상단 metric strip과 section border rhythm은 Service/KnowledgeDB와 맞춘다.

## PLOZEN 공통 상태지표

- Dashboard, Service, KnowledgeDB의 상단 상태지표는 `metric-strip metric-strip--status` 구조를 공통으로 쓴다.
- 상태지표 카드 높이는 88px 기준으로 유지한다. 보조 설명용 `small` 문구를 넣어 카드별 높이나 밀도가 달라지게 만들지 않는다.
- 상단 상태지표 카드에는 상태 점을 넣지 않는다. 색상은 카드 상단 라인과 숫자/상태값 컬러로만 구분한다.
- 작은 상태 점은 서비스 테이블 row의 `.service-status` pill에서만 쓴다.
- 상태 점 크기는 6px 원형이고, `aria-hidden="true"`로 스크린리더 읽기 흐름에서 제외한다.
- Dashboard 차트 범례와 KnowledgeDB 문서 상태 pill에는 상태 점을 쓰지 않는다. 차트는 pie graphic과 텍스트 legend, 문서 상태는 pill label만 사용한다.
- KnowledgeDB 지표도 일반 숫자 카드가 아니라 `전체 문서 | 적재 | 벡터 | 실패`를 같은 상태지표 컴포넌트로 표시한다.

## PLOZEN Table / Filter 표준

- 조회조건은 section header 바로 아래에 위치하고, 검색 input + select group + 검색 button을 한 줄 grid로 둔다.
- Desktop filter grid는 `minmax(220px, 1fr) + 3 select + 96px action` 구조를 기본으로 한다.
- KnowledgeDB dense filter는 44px 높이를 최소값으로 허용한다. Service filter도 같은 높이와 border rhythm을 쓴다.
- Table은 `border-collapse: collapse`, 40~42px row height, 12~13px label text, 얇은 divider를 기준으로 한다.
- Desktop table은 가로 스캔을 우선하고, mobile에서는 필요한 컬럼만 남기거나 row label/value 구조로 전환한다.
- Empty/loading/error 상태를 추가할 때도 같은 section surface 안에서 table 영역을 대체한다. 별도의 큰 안내 카드로 section rhythm을 깨지 않는다.

## PLOZEN Service 화면 용어

- Service 상태 화면 파일명은 `pub/web/pages/service.html`로 둔다. Docker만 다루는 기존 시스템 상세 명칭은 쓰지 않는다.
- 좌측 메뉴 라벨은 `Service`로 통일한다. Docker 컨테이너와 OS/systemd 서비스를 한 목록에서 함께 보여준다.
- 서비스 목록의 row 상태 라벨은 `정상`, `주의`, `에러`, `미확인` 4개로 둔다. 상태 옆에는 작은 원형 점을 붙이고, 정상은 초록, 주의는 노랑, 에러는 빨강, 미확인은 파랑을 쓴다.
- 서비스 목록 컬럼은 `서비스 | 상태 | 실행 방식 | 분류 | 포트 | 프로세스` 순서를 기본값으로 둔다.
- `실행 방식`은 `Docker`와 `Host/systemd`를 기본 분류로 둔다. Docker 메뉴를 별도 top-level 메뉴로 분리하지 않는다.
- 실행 방식 요약처럼 서비스 목록과 중복되는 요약 섹션은 두지 않는다.
- 포트 정책은 별도 대형 페이지가 아니라 서비스 목록 아래 compact section으로 둔다.
- 포트 정책은 `3100`, `3400`, `5600`, `5900/5910`, `18000대`, `55000대`처럼 운영자가 바로 판단할 수 있는 범위와 대표 서비스를 함께 표시한다.
- dispatcher/Task Runner는 현재 동작 중인 레거시 자동화 브리지로 `주의` 상태를 사용하고, OpenClaw/Hermes 전환 예정 맥락을 함께 표시한다.
- Hermes처럼 systemd는 살아있지만 public port가 없는 서비스는 에러가 아니라 `미확인`으로 분류한다.
- 모바일 서비스 목록은 desktop table을 그대로 줄이지 않고 row별 label/value 구조로 바꾼다. 포트와 프로세스는 줄바꿈을 허용해 overflow를 만들지 않는다.
- 서비스 컬럼은 가장 넓게 잡고, 상태/실행 방식/분류/포트는 좁게 유지한다. 프로세스는 긴 systemd/container 명칭을 위해 desktop에서 넓게 둔다.
- 상태 pill은 `정상`, `주의`, `에러`, `미확인` 텍스트와 6px 점을 함께 보여주는 유일한 상태 점 사용처다.
- 포트 정책은 서비스 목록과 같은 surface density로 유지하며, desktop 2열 grid, mobile 1열 list로 접는다.

## PLOZEN KnowledgeDB 화면 용어

- 기본 화면은 개발자 용어보다 운영자가 바로 이해하는 한국어 라벨을 우선한다.
- `Collection`은 현재 데이터 구조에 없으므로 쓰지 않는다. 문서 단위 표는 `문서명`을 첫 컬럼으로 둔다.
- `source_type`은 확장자가 아니라 출처 분류이므로 `저장 위치`로 표시한다. 예: Obsidian, Repository, Todo, 직접 입력.
- 파일 확장자나 업로드 형식은 `파일 형식`으로 표시한다. 예: Markdown, TXT.
- `Chunks`는 `조각 수`로 표시한다. 의미는 검색을 위해 원문 문서를 나눈 텍스트 조각 개수다.
- `Tokens`는 기본 화면에서 `글자량`으로 표시한다. 내부 token count를 사용하되, 상세 설명에서만 token이라는 말을 보조로 쓴다.
- `Embedding`은 기본 화면에서 `벡터`로 표시한다. row 단위 숫자 배열이나 `1536d` 같은 차원 정보는 첫 화면에 크게 노출하지 않고, `적재/벡터/실패` 상태와 처리 개수를 우선 보여준다.
- 상단 지표는 `전체 문서 | 적재 | 벡터 | 실패`를 기본값으로 둔다.
- 문서 상태는 `적재`, `벡터`, `실패` 3개만 기본 표에 노출한다. 세부 진행 단계는 상세 패널이나 로그에서만 다룬다.
- `적재`는 문서가 등록됐지만 검색 가능한 벡터가 아직 없는 상태다.
- `벡터`는 문서 조각과 벡터가 생성되어 검색 가능한 상태다.
- `실패`는 업로드, 문서 등록, 조각 생성, 벡터 생성 중 실패가 발생한 상태다.
- KnowledgeDB 화면 기본 섹션은 `Vector DB`와 `문서 업로드` 2개로 둔다. 별도 `벡터 생성 흐름` 섹션은 만들지 않는다.
- `Vector DB` 섹션 내부 순서는 `제목/일괄 액션 -> 조회조건 -> 문서 테이블`로 둔다.
- 조회조건은 검색어, 상태, 파일 형식, 저장 위치, 검색 실행 버튼을 한 묶음으로 둔다.
- 문서 목록 컬럼은 `선택 | 문서명 | 파일 형식 | 저장 위치 | 조각 수 | 글자량 | 상태 | 최근 처리 | 작업` 순서를 기본값으로 둔다.
- row 작업은 `벡터 생성` 하나만 기본값으로 둔다. `적재`와 `실패` 문서에서는 선택 체크박스와 버튼을 활성화하고, 이미 `벡터` 상태인 문서에서는 둘 다 비활성화한다.
- 문서 목록은 하단에 작은 pagination을 둔다. 선택 체크박스는 시각 크기와 별개로 최소 44px 터치 영역을 확보한다.
- KnowledgeDB 조회조건은 운영 테이블 밀도를 위해 44px 높이를 최소값으로 쓰는 dense filter 예외를 허용한다.
- `문서 업로드`는 섹션 헤더를 유지하고, 선택 파일 목록과 `전체 업로드` 액션을 바로 노출한다. 별도 안내 카드와 선택 파일 요약 정보 블록은 두지 않는다.
- 모바일 문서 업로드 목록은 파일명을 첫 줄에 두고, 파일 형식과 크기는 다음 줄에서 분리해 읽히게 한다.
- KnowledgeDB table은 desktop에서 9컬럼을 유지하고, mobile에서는 `선택 | 문서명 | 상태 | 작업`만 남겨 horizontal overflow를 막는다.
- 문서명은 줄바꿈을 허용하고, 체크박스 hitbox는 44px로 둔다.
- `벡터 생성` 버튼은 `적재`와 `실패` 문서에서만 활성화한다. `벡터` 상태 문서는 체크박스와 버튼을 disabled로 둔다.
- 문서 업로드는 table/list형 surface로 유지한다. 업로드 안내용 hero, 큰 dropzone card, 별도 summary card를 추가하지 않는다.

## PLOZEN Responsive 기준

- 검수 폭은 desktop 1440px, tablet 768px, mobile 390px, blocker 344px이다.
- 900px 이하에서는 sidebar가 상단으로 이동하고 main content는 1열로 접힌다.
- Metric strip은 desktop 4열, mobile/tablet 2열이다. 각 metric card 높이는 여전히 88px 기준을 유지한다.
- Service table은 900px 이하에서 `thead`를 숨기고 각 row를 label/value grid로 전환한다.
- KnowledgeDB table은 900px 이하에서 파일 형식, 저장 위치, 조각 수, 글자량, 최근 처리 컬럼을 숨긴다.
- Filter bar와 upload action은 900px 이하에서 1열로 접는다.
- 344px blocker에서 header action, metric card, table action, upload row text가 좌우 overflow를 만들면 fail이다.

## 상태 목록

- Empty
- Loading
- Error
- Success
- Disabled
- Permission denied
- Offline/fallback
- Validation error
- Unsaved changes

## 디자인 게이트 체크리스트

- 모바일 앱 기본 검수 폭은 390px, 좁은 폭 blocker 기준은 344px이다.
- 태블릿 검수 폭은 portrait 768px, landscape 1024px을 기본으로 한다.
- 웹/관리자 기본 검수 폭은 desktop 1440px, tablet 1024px, mobile 390px이다.
- 웹사이트용 크몽 대표 썸네일은 PC 기기 1개를 중심으로 구성하고, 서브 상세에서 PC/tablet/mobile 3개 viewport tier를 함께 검수한다. 모바일 앱 페이지 export의 1200x1580 규칙은 유지한다.
- 웹 관리자용 크몽 페이지 모음은 `pub/web/pages/`의 개별 raw page를 1200px 캔버스에 붙이고, 각 페이지 PNG 다운로드와 전체 이미지 다운로드 흐름을 제공한다.
- 웹 관리자 raw page는 `?viewport=desktop|tablet|mobile`과 `?embed=1`을 지원해야 하며, desktop 1440px, tablet 768px, mobile 390px 기준에서 iframe이 blank가 아니어야 한다.
- 테이블형 웹 관리자 페이지는 pagination을 포함하고, mobile/tablet에서 text clipping과 horizontal overflow가 없어야 한다.
- 주요 화면의 최소 좌우 padding은 모바일 16px 이상이다.
- touch target은 44px 이상, 주요 CTA는 48px 이상이다.
- header, status panel, list, sticky action, bottom tab overlap은 0px이어야 한다.
- bottom tab은 anchored 상태이며 content가 tab 아래로 가려지지 않아야 한다.
- 웹 table, filter, modal, side sheet는 좁은 폭에서 text clipping과 horizontal overflow를 만들면 안 된다.
- text overflow, clipped copy, safe-area 침범은 blocker다.
- 포트폴리오 export canvas 크기는 대상 플랫폼 요구사항과 일치해야 한다.
- `styleguide/`, `pub/`, `portfolio/`는 이 문서와 같은 규칙을 반영해야 한다.
