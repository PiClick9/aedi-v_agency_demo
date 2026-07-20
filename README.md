# aedi-v Agency Demo

Figma 시안([aedi-v 디자인](https://www.figma.com/design/9yvybIE3fvZjLzm0FrCqOO/aedi-v-%EB%94%94%EC%9E%90%EC%9D%B8?node-id=3891-42518))의
에이전시 파일럿 플로우를 구현한 데모입니다. GitHub Pages로 배포됩니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 화면

| 경로 | 화면 | Figma 노드 |
| --- | --- | --- |
| `#/` | 가입하기 (AGENCY PILOT) | `3910:20692` / 카드 `3910:20693` |
| `#/qr` | QR 진입 | `3891:118010` |

QR 이미지는 데모에서 의도적으로 생략하고, 원본 치수의 빈 슬롯으로 대체했습니다.

## 디자인 검수

`scripts/audit.mjs`가 실행 중인 dev 서버를 여러 뷰포트로 렌더링해
`getBoundingClientRect()` / `getComputedStyle()` 실측값을 Figma 스펙과 대조합니다.
0.75px 이상 벗어나면 실패로 종료합니다.

```bash
npm run dev                       # 다른 터미널에서
npm run audit:design -- ./shots   # 스크린샷 경로는 선택
```

데스크톱 뷰포트는 Figma 픽셀값과 정확히 대조하고, 모바일 뷰포트는 리플로가
일어나므로 리플로 후에도 지켜져야 하는 불변식(가로 오버플로 없음, 가독 가능한
타이포, 중심축 정렬, 탭 타겟 크기)을 검사합니다.

토큰 값은 생성된 코드의 fallback이 아니라 `get_variable_defs`가 돌려준 실제
변수값을 따릅니다 — 둘은 일치하지 않습니다(예: `radius/xl`은 20이 아니라 10).

## 배포

`main` 브랜치에 푸시하면 `.github/workflows/deploy.yml`이 빌드 후 GitHub Pages로 배포합니다.
저장소 **Settings → Pages → Source**를 **GitHub Actions**로 설정해야 합니다.

`vite.config.ts`의 `base`는 `'./'`, 라우터는 `HashRouter`라서 저장소 이름과 무관하게
별도 설정 없이 동작합니다.
