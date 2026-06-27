# PLOZEN Ops Console 에이전트 규칙

## 정체성

이 저장소는 PLOZEN의 공개용 clean-start 운영 대시보드다. 기존 레거시 `plozen-console` 저장소가 아니다.

## 공개 범위

- 이 저장소는 기본적으로 public-safe 상태를 유지한다.
- 레거시 콘솔의 코드, 로그, credential, private 운영 가정을 복사하지 않는다.
- `.env`, `.env.local`, `.env.*.local`, private token, n8n credential, Discord bot token, Obsidian vault 원문은 commit하지 않는다.
- `.env.example`에는 변수명과 안전한 placeholder만 둔다.

## 제품 방향

초기 제품 목표:

- public-safe한 AI 운영 상태를 보여주는 중앙 운영 콘솔.
- 현재 MVP는 PLOZEN Knowledge API의 문서 가시성과 VectorDB 운영에 집중한다.
- 현재 허용되는 쓰기 workflow는 Knowledge API를 통한 문서 업로드/스테이징과 명시적 벡터 생성 액션이다.
- destructive action, raw vault editing, credential management, broad admin automation은 별도 승인 전까지 범위 밖으로 둔다.

## 디자인 Workflow

- 디자인 기획과 시각 증적은 `design-kit/`을 사용한다.
- root 제품 `DESIGN.md`가 생기기 전까지 `design-kit/DESIGN.md`를 시각 생성 기준 source로 본다.
- `design-kit/pub/`은 raw publishing/artboard source로 유지한다.
- device mockup, thumbnail, composite export는 raw `pub/` page 안에 넣지 않는다.

## 검증

commit 또는 push 전:

- `npm run design-kit:doctor`
- `git diff --check`
- 로컬에 `gitleaks` 또는 다른 scanner가 있으면 secret scan
