import type { StationInfo } from '../component/StationMarkers';

const elementSize = {
  wordWidth: 11.7,
  singleCountWidth: 11.7,
  doubleCountWidth: 19.3,
  separatorWidth: 5,
  imageWidth: 20,
  imagePadding: 4,
  normalHeight: 37.3,
  selectedHeight: 42,
  selectedSideWidth: 4.3,
  normalWidth: 17,
} as const;

export const getMarkerStaticSize = (
  marker: StationInfo,
  isSelected: boolean
) => {
  const { charger_rapid_cnt, charger_slow_cnt } = marker;

  const isRapid = (charger_rapid_cnt ?? 0) > 0;
  const isSlow = (charger_slow_cnt ?? 0) > 0;
  const isRapidMoreThanTen = (charger_rapid_cnt ?? 0) >= 10;
  const isSlowMoreThanTen = (charger_slow_cnt ?? 0) >= 10;

  const baseWidth =
    elementSize.normalWidth +
    elementSize.imageWidth +
    (isSelected ? elementSize.selectedSideWidth : 0);

  const height = isSelected
    ? elementSize.selectedHeight
    : elementSize.normalHeight;

  if (!isRapid && !isSlow) {
    return { width: baseWidth, height };
  }

  const hasBothTypes = isRapid && isSlow;
  let extraWidth = elementSize.imagePadding;

  if (hasBothTypes) {
    extraWidth += elementSize.wordWidth * 2 + elementSize.separatorWidth;
    if (isRapidMoreThanTen && isSlowMoreThanTen) {
      extraWidth += elementSize.doubleCountWidth * 2;
    } else if (isRapidMoreThanTen || isSlowMoreThanTen) {
      extraWidth += elementSize.doubleCountWidth + elementSize.singleCountWidth;
    } else {
      extraWidth += elementSize.singleCountWidth * 2;
    }
  } else {
    extraWidth += elementSize.wordWidth;
    extraWidth +=
      isRapidMoreThanTen || isSlowMoreThanTen
        ? elementSize.doubleCountWidth
        : elementSize.singleCountWidth;
  }

  return {
    width: baseWidth + extraWidth,
    height,
  };
};
