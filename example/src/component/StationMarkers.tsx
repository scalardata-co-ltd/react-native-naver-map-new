import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { getMarkerStaticSize } from '../utils/markerSize';
// import Tail from '@assets/svgs/marker/tooltip_tail.svg';
// import SelectedTail from '@assets/svgs/marker/tooltip_tail_selected.svg';

export interface StationInfo {
  category: string;
  bid: string;
  es_key: string;
  oem_code?: string;
  latitude: string;
  longitude: string;
  promotion: 'Y' | 'N';
  use_type: string;
  charging_status: 'Y' | 'N';
  cluster_cnt: number | null;
  plug_types: string | null;
  charger_rapid_cnt?: number;
  charger_slow_cnt?: number;
  pnc_yn?: 'Y' | 'N';
}

type Props = {
  isSelected?: boolean;
  data: StationInfo;
};

const StationMarker = ({ isSelected = false, data }: Props) => {
  if (!data) {
    return null;
  }

  const { bid, charger_rapid_cnt, charger_slow_cnt, oem_code } = data;

  const isBMW = oem_code === '4';
  const isChargeV = bid === 'PI' && !isBMW;
  const isRapid = charger_rapid_cnt ? charger_rapid_cnt > 0 : false;
  const isSlow = charger_slow_cnt ? charger_slow_cnt > 0 : false;

  const { style } = (function () {
    const result = {
      style: stylePresets.default,
    };
    if (isBMW) {
      result.style = stylePresets.bmw;
    }

    if (!isChargeV && !isBMW) {
      result.style = stylePresets.roaming;
    }
    if (isRapid || isSlow) {
      result.style.image = {
        ...result.style.image,
        ...styles.imagePadding,
      };
    } else {
      result.style.image = {
        ...result.style.image,
        marginRight: 0,
      };
    }
    return result;
  })();

  return (
    <View collapsable={false} style={getMarkerStaticSize(data, isSelected)}>
      {/*TODO: 추후에 적용 (현재 지도에서 잘리는 현상 있음)*/}
      {/*{isRapid && <MarkerBadge style={styles.badge} />}*/}

      <View style={isSelected && [styles.selected, style.selected]}>
        <View style={[styles.container, style.container]}>
          <View style={[styles.contents, style.contents]}>
            <View style={[styles.image, style.image]}>
              <Image
                src={`https://cdn.gschargev.co.kr/roming/marker_img/${bid}.png`}
                style={{ width: imageSize, height: imageSize }}
              />
            </View>

            <>
              {isRapid && (
                <>
                  <Text style={styles.labelText}>급</Text>
                  <Text style={styles.text}> {charger_rapid_cnt}</Text>
                </>
              )}

              {isRapid && isSlow && <View style={styles.separator} />}

              {isSlow && (
                <>
                  <Text style={styles.labelText}>완</Text>
                  <Text style={styles.text}> {charger_slow_cnt}</Text>
                </>
              )}
            </>
          </View>
        </View>
      </View>

      {/*<Icon*/}
      {/*  style={[styles.tail, style.tail]}*/}
      {/*  width={10}*/}
      {/*  height={10}*/}
      {/*  fill={style.container?.backgroundColor}*/}
      {/*/>*/}
    </View>
  );
};

const imageSize = 20;
const borderRadius = 4;

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius,
    overflow: 'hidden',
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: 'grey',
    marginHorizontal: 4,
    opacity: 0.3,
  },
  labelText: {
    // ...Fonts.d_r_13,
    color: 'white',
    opacity: 0.8,
  },
  text: {
    // ...Fonts.d_r_13,
    color: 'white',
  },
  tail: {
    marginTop: -2.7,
    alignSelf: 'center',
    zIndex: 2,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  contents: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  selected: {
    borderWidth: 1.3,
    borderColor: 'black',
    padding: 1,
    backgroundColor: 'white',
    borderRadius: borderRadius + 1,
  },
  imagePadding: {
    marginRight: 4,
  },
  badge: {
    marginBottom: -8,
    marginRight: -6,
  },
});

const stylePresets: {
  [k in 'bmw' | 'default' | 'roaming']: {
    [key in keyof Pick<
      typeof styles,
      'container' | 'image' | 'contents' | 'tail' | 'selected'
    >]?: ViewStyle;
  };
} = {
  bmw: {
    container: {
      backgroundColor: '#013A5A', // todo: 디자인 시스템 반영 후 적용 필요
    },
  },
  default: {
    container: {
      backgroundColor: 'black',
    },
  },
  roaming: {
    container: {
      backgroundColor: 'grey',
    },
    image: {
      backgroundColor: 'white',
    },
  },
};

export default StationMarker;
