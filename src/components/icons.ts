// Figma에서 내보낸 아이콘(SVG). 화면마다 색이 달라 색상별 파일을 그대로 사용합니다.
import sigBrand from '../assets/icons/sig_brand.svg';
import wifiBrand from '../assets/icons/wifi_brand.svg';
import batBrand from '../assets/icons/bat_brand.svg';
import sigInk from '../assets/icons/sig_ink.svg';
import wifiInk from '../assets/icons/wifi_ink.svg';
import batInk from '../assets/icons/bat_ink.svg';
import sigSlate from '../assets/icons/sig_slate.svg';
import wifiSlate from '../assets/icons/wifi_slate.svg';
import batSlate from '../assets/icons/bat_slate.svg';
import sigSteel from '../assets/icons/sig_steel.svg';
import wifiSteel from '../assets/icons/wifi_steel.svg';
import batSteel from '../assets/icons/bat_steel.svg';
import chevLBrand from '../assets/icons/chevL_brand.svg';
import chevLInk from '../assets/icons/chevL_ink.svg';
import chevLSlate from '../assets/icons/chevL_slate.svg';
import chevLSteel from '../assets/icons/chevL_steel.svg';
import moreBrand from '../assets/icons/more_brand.svg';
import moreInk from '../assets/icons/more_ink.svg';
import moreSlate from '../assets/icons/more_slate.svg';
import moreSteel from '../assets/icons/more_steel.svg';
import eyeOffGray from '../assets/icons/eyeOff_gray.svg';
import eyeOffBrand from '../assets/icons/eyeOff_brand.svg';
import eyeOffSteel from '../assets/icons/eyeOff_steel.svg';

export { default as logo } from '../assets/icons/logo.svg';
export { default as calendar } from '../assets/icons/calendar.svg';
export { default as mapPin } from '../assets/icons/mapPin.svg';
export { default as bookHeart } from '../assets/icons/bookHeart.svg';
export { default as google } from '../assets/icons/google.svg';
export { default as naver } from '../assets/icons/naver.svg';
export { default as kakao } from '../assets/icons/kakao.svg';
export { default as chevronRight } from '../assets/icons/chevR.svg';
export { default as circle } from '../assets/icons/circle.svg';
export { default as circleCheck } from '../assets/icons/circleCheck.svg';
export { default as shieldGray } from '../assets/icons/shield_gray.svg';
export { default as shieldSlate } from '../assets/icons/shield_slate.svg';
export { default as mail } from '../assets/icons/mail.svg';
export { default as help } from '../assets/icons/help.svg';

/** 화면 색 테마 — Figma 프레임별 텍스트 색에 맞춘 이름 */
export type Tone = 'brand' | 'ink' | 'slate' | 'steel';

export const statusIcons: Record<Tone, { signal: string; wifi: string; battery: string }> = {
  brand: { signal: sigBrand, wifi: wifiBrand, battery: batBrand },
  ink: { signal: sigInk, wifi: wifiInk, battery: batInk },
  slate: { signal: sigSlate, wifi: wifiSlate, battery: batSlate },
  steel: { signal: sigSteel, wifi: wifiSteel, battery: batSteel },
};

export const backIcons: Record<Tone, string> = {
  brand: chevLBrand,
  ink: chevLInk,
  slate: chevLSlate,
  steel: chevLSteel,
};

export const moreIcons: Record<Tone, string> = {
  brand: moreBrand,
  ink: moreInk,
  slate: moreSlate,
  steel: moreSteel,
};

export const eyeOffIcons = { gray: eyeOffGray, brand: eyeOffBrand, steel: eyeOffSteel };

// Mobile 08~10
export { default as bell } from '../assets/icons/bell.svg';
export { default as plusWhite } from '../assets/icons/plus.svg';
export { default as sparkles } from '../assets/icons/sparkles.svg';
export { default as users } from '../assets/icons/users.svg';
export { default as calendarDays } from '../assets/icons/calendarDays.svg';
export { default as clover } from '../assets/icons/clover.svg';
export { default as house } from '../assets/icons/house.svg';
export { default as userRound } from '../assets/icons/userRound.svg';
export { default as mapPin22 } from '../assets/icons/mapPin22.svg';
export { default as search } from '../assets/icons/search.svg';
export { default as chevronLeft20 } from '../assets/icons/chevL20.svg';
export { default as chevronRight20 } from '../assets/icons/chevR20.svg';
export { default as pencil } from '../assets/icons/pencil.svg';
export { default as plusCircle } from '../assets/icons/plusCircle.svg';

// Mobile 11~22
export { default as plusCircle28 } from '../assets/icons/plusCircle28.svg';
export { default as aiIcon } from '../assets/icons/aiIcon.svg';
export { default as trainFront } from '../assets/icons/trainFront.svg';
export { default as chevronUp } from '../assets/icons/chevronUp.svg';
export { default as mapWhite } from '../assets/icons/mapWhite.svg';
export { default as locate } from '../assets/icons/locate.svg';
export { default as thumbsUp } from '../assets/icons/thumbsUp.svg';
export { default as thumbsUpWhite } from '../assets/icons/thumbsUpWhite.svg';
export { default as thumbsDown } from '../assets/icons/thumbsDown.svg';
export { default as ticket } from '../assets/icons/ticket.svg';
export { default as sliders } from '../assets/icons/sliders.svg';
export { default as flag } from '../assets/icons/flag.svg';
export { default as clock } from '../assets/icons/clock.svg';
export { default as shieldCheck } from '../assets/icons/shieldCheck.svg';
export { default as messageWhite } from '../assets/icons/messageWhite.svg';
export { default as chevronRight18 } from '../assets/icons/chevronRight18.svg';
export { default as sunWhite } from '../assets/icons/sunWhite.svg';
export { default as sun } from '../assets/icons/sun.svg';
export { default as camera } from '../assets/icons/camera.svg';
export { default as cameraWhite } from '../assets/icons/cameraWhite.svg';
export { default as cloud } from '../assets/icons/cloud.svg';
export { default as cloudWhite } from '../assets/icons/cloudWhite.svg';
export { default as footprints } from '../assets/icons/footprints.svg';
export { default as footprintsWhite } from '../assets/icons/footprintsWhite.svg';
export { default as heart } from '../assets/icons/heart.svg';
export { default as heartWhite } from '../assets/icons/heartWhite.svg';
export { default as bookOpen } from '../assets/icons/bookOpen.svg';
export { default as check } from '../assets/icons/check.svg';
export { default as send } from '../assets/icons/send.svg';
export { default as circleCheck15 } from '../assets/icons/circleCheck15.svg';
export { default as route } from '../assets/icons/route.svg';
export { default as lock } from '../assets/icons/lock.svg';
export { default as settingsGear } from '../assets/icons/settings.svg';
export { default as marker } from '../assets/icons/marker.svg';
export { default as dropCircle } from '../assets/icons/dropCircle.svg';
export { default as plusBrand } from '../assets/icons/plusBrand.svg';
export { default as palette } from '../assets/icons/palette.svg';
export { default as checkWhite } from '../assets/icons/checkWhite.svg';
