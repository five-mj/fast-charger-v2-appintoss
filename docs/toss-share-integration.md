# 앱인토스 공유 연결 (2026-11-06)

등록된 앱 식별자는 기존 빌드 설정 기준 `gogowatercharging`입니다.
`toss-share-entry.js`가 SDK 3.0.4의 `Share.createLink`, `Share.sendMessage`,
`Clipboard.setText`, `Device.openURL`을 연결합니다.
`Share.createLink`는 기존 `getTossShareLink`의 새 이름입니다.

## 개발팀 번들 반영

1. 최신 main 코드를 반영합니다.
2. `npm ci` 후 `npm run build`를 실행합니다. 생성된 `toss-share-sdk.js`는 저장소에도 포함합니다.
3. 정적 파일을 별도 dist 폴더에 복사한다면 **toss-share-sdk.js도 반드시 복사**합니다.
4. index.html의 toss-share-sdk.js → route-share.js 로딩 순서를 유지합니다.
5. 기존 aitCharger 브리지는 유지해도 됩니다. 새 공유 분기는 별도 tossRouteShare를 우선 사용합니다.
6. 기존 앱인토스 빌드 명령으로 .ait 번들을 만듭니다.

앱 내에서는 `intoss://gogowatercharging?origin=…&destination=…`를 토스 HTTPS 링크로
변환합니다. 도착지 미선택 상태는 `view=result`로 유지합니다. 웹 브라우저에서는
기존 웹 공유를 유지합니다. 링크 생성 실패 시 잘못된 웹 링크로 대체하지 않고 재시도를 안내합니다.
개발 환경이나 비공개 번들에서 공유하더라도 공유 대상은 출시된 앱입니다.

## 실제 토스에서 확인할 사항

- 공유 버튼에서 공유창이 열리고 메시지에 HTTPS 링크가 포함되는지
- 링크 복사와 Facebook/X 링크에도 토스 링크가 들어가는지
- 받은 링크를 누르면 출시된 미니앱에서 선택한 출발지·도착지가 복원되는지
- 도착지 미선택, 공유 취소, 재시도 동작

실제 기기 검증 전에는 공유 완료나 딥링크 진입 성공을 보장할 수 없습니다.

공식 문서:
- https://developers-apps-in-toss.toss.im/documentation/common/growth/share/miniapp-share-link
- https://developers-apps-in-toss.toss.im/documentation/common/growth/share/share-message
