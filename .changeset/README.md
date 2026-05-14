# Changesets

이 디렉터리에는 다음 릴리스에 포함될 변경사항(`*.md` 파일)이 쌓입니다. 자세한 내용은 [Changesets 공식 문서](https://github.com/changesets/changesets)를 참고하세요.

## 새 changeset 추가

PR이 사용자에게 영향을 주는 변경(기능 추가, 버그 수정, breaking change 등)을 포함한다면, 아래 명령으로 changeset을 작성해 PR에 함께 커밋하세요.

```bash
pnpm changeset
```

- 영향을 받는 패키지를 선택
- semver bump 종류 선택 (patch / minor / major)
- 변경 요약 작성 (마크다운 가능)

## 릴리스 흐름

1. changeset이 포함된 PR을 `main`에 머지
2. GitHub Actions의 `release` 워크플로가 자동으로 "Version Packages" PR 생성
3. 해당 PR을 머지하면 버전 bump + 변경 로그 갱신 + npm publish 수행
