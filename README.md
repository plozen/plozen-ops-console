# PLOZEN Ops Console

PLOZEN Ops Console은 PLOZEN의 AI 운영 상태, 지식 검색 상태, 자동화 상태를 공개 포트폴리오용으로 보여주는 운영 대시보드입니다.

이 저장소는 기존 private `plozen-console` 코드를 공개하는 대신 새로 분리한 공개용 콘솔입니다. 기존 콘솔에는 내부 실험, 오래된 제품 코드, 민감한 운영 가정이 섞여 있을 수 있으므로 private으로 유지합니다.

## 범위

1차 공개 MVP 범위:

- Docker 및 host/systemd 프로세스 상태
- 13번 서버 포트 정책 스냅샷
- Knowledge API health
- 문서 source 목록
- chunk 개수와 상태
- 검색 입력
- 검색 결과
- source/chunk 상세 패널

공개 범위에서 제외:

- Polymarket 기능
- Coin 시스템
- 내부 자동화 credential
- Discord, n8n, 서버 secret
- private Obsidian 원문
- 내부 운영 로그 원문

## 보안 경계

실제 값은 git에 들어가면 안 됩니다.

- 로컬 secret과 내부 endpoint는 `.env.local`에 둡니다.
- `.env.example`에는 변수명과 안전한 placeholder만 둡니다.
- credential, private token, export된 workflow credential, private vault 원문은 commit하지 않습니다.

## Design Kit

Plostack Design Kit은 `design-kit/`에 web 전용 `empty-raw` 모듈로 설치되어 있습니다.

```bash
npm run design-kit:local
npm run design-kit:doctor
```

로컬 design kit preview는 `http://127.0.0.1:8095/`에서 확인합니다.

Design kit은 화면 기획과 시각 증적을 위한 작업 공간입니다. 실제 제품 구현은 공개 Ops Console 범위와 `DESIGN.md` 방향이 확정된 뒤 진행합니다.
