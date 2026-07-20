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
| `#/` | QR 진입 | `3891:118010` |

QR 이미지는 데모에서 의도적으로 생략하고, 원본 치수의 빈 슬롯으로 대체했습니다.

## 배포

`main` 브랜치에 푸시하면 `.github/workflows/deploy.yml`이 빌드 후 GitHub Pages로 배포합니다.
저장소 **Settings → Pages → Source**를 **GitHub Actions**로 설정해야 합니다.

`vite.config.ts`의 `base`는 `'./'`, 라우터는 `HashRouter`라서 저장소 이름과 무관하게
별도 설정 없이 동작합니다.
