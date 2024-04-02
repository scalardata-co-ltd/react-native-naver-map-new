import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps, HostComponent } from 'react-native';
import type {
  DirectEventHandler,
  Int32,
  WithDefault,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import React from 'react';

// export type NaverMapAuthFailedEvent = Readonly<{
//   errorCode: Int32;
//   description: string;
// }>;

// type Coord = Readonly<{
//   latitude: Double;
//   longitude: Double;
// }>;
//
// type Rect = Readonly<{
//   top: Double;
//   right: Double;
//   bottom: Double;
//   left: Double;
// }>;

type PartialRect = Readonly<{
  top?: Double;
  right?: Double;
  bottom?: Double;
  left?: Double;
}>;

interface NaverMapViewProps extends ViewProps {
  // Additional
  // onAuthFailed?: DirectEventHandler<NaverMapAuthFailedEvent>;

  // Implemented

  onInitialized?: DirectEventHandler<Readonly<{}>>;
  onOptionChanged?: DirectEventHandler<Readonly<{}>>;
  onCameraChanged?: DirectEventHandler<
    Readonly<{
      latitude: string;
      longitude: string;
      zoom: Double;
    }>
  >;

  mapType?: WithDefault<
    | 'Basic'
    | 'Navi'
    | 'Satellite'
    | 'Hybrid'
    | 'Terrain'
    | 'NaviHybrid'
    | 'None',
    'Basic'
  >;

  layerGroups?: WithDefault<
    ReadonlyArray<
      'BUILDING' | 'TRAFFIC' | 'TRANSIT' | 'BICYCLE' | 'MOUNTAIN' | 'CADASTRAL'
    >,
    'BUILDING'
  >;

  isIndoorEnabled?: boolean;
  isNightModeEnabled?: boolean;
  isLiteModeEnabled?: boolean;
  lightness?: WithDefault<Double, 0>;
  buildingHeight?: WithDefault<Double, 1>;
  symbolScale?: WithDefault<Double, 1>;
  symbolPerspectiveRatio?: WithDefault<Double, 1>;

  center?: Readonly<{
    latitude: Double;
    longitude: Double;
    zoom?: Double;
    tilt?: Double;
    bearing?: Double;
  }>;

  mapPadding?: PartialRect;

  minZoom?: WithDefault<Double, -1>;
  maxZoom?: WithDefault<Double, -1>;

  /*Not Implemented Yet*/
  // tilt?: number;
  // bearing?: number;
  // mapPadding?: Rect;
  // logoMargin?: Rect;
  // logoGravity?: Gravity;
  // onCameraChange?: (event: {
  //   latitude: number;
  //   longitude: number;
  //   zoom: number;
  //   contentsRegion: [Coord, Coord, Coord, Coord, Coord];
  //   coveringRegion: [Coord, Coord, Coord, Coord, Coord];
  // }) => void;
  // onMapClick?: (event: {
  //   x: number;
  //   y: number;
  //   latitude: number;
  //   longitude: number;
  // }) => void;
  // onTouch?: () => void;
  // showsMyLocationButton?: boolean;
  // compass?: boolean;
  // scaleBar?: boolean;
  // zoomControl?: boolean;

  // minZoomLevel?: number;
  // maxZoomLevel?: number;

  // scrollGesturesEnabled?: boolean;
  // zoomGesturesEnabled?: boolean;
  // tiltGesturesEnabled?: boolean;
  // rotateGesturesEnabled?: boolean;
  // stopGesturesEnabled?: boolean;

  // useTextureView?: boolean;
}

type ComponentType = HostComponent<NaverMapViewProps>;

interface NaverMapNativeCommands {
  screenToCoordinate: (
    ref: React.ElementRef<ComponentType>,
    x: Double,
    y: Double
  ) => Promise<
    Readonly<{
      isValid: boolean;
      latitude: number;
      longitude: number;
    }>
  >;
  coordinateToScreen: (
    ref: React.ElementRef<ComponentType>,
    latitude: Double,
    longitude: Double
  ) => Promise<
    Readonly<{
      isValid: boolean;
      screenX: number;
      screenY: number;
    }>
  >;
  animateCameraTo: (
    ref: React.ElementRef<ComponentType>,
    latitude: Double,
    longitude: Double,
    duration?: Int32,
    easing?: Int32 /*'Easing' | 'None' | 'Linear' | 'Fly'*/,
    pivotX?: Double,
    pivotY?: Double
  ) => void;
  animateCameraBy: (
    ref: React.ElementRef<ComponentType>,
    latitudeDelta: Double,
    longitudeDelta: Double,
    duration?: Int32,
    easing?: Int32 /*'Easing' | 'None' | 'Linear' | 'Fly'*/,
    pivotX?: Double,
    pivotY?: Double
  ) => void;
  animateZoom: (
    ref: React.ElementRef<ComponentType>,
    latitudeDelta: Double,
    longitudeDelta: Double,
    duration?: Int32,
    easing?: Int32 /*'Easing' | 'None' | 'Linear' | 'Fly'*/,
    pivotX?: Double,
    pivotY?: Double
  ) => void;
  animateCameraFitBounds: (
    ref: React.ElementRef<ComponentType>,
    duration?: Int32,
    easing?: Int32 /*'Easing' | 'None' | 'Linear' | 'Fly'*/,
    pivotX?: Double,
    pivotY?: Double
  ) => void;
  cancelAnimation: (ref: React.ElementRef<ComponentType>) => void;
}

export default codegenNativeComponent<NaverMapViewProps>('RNCNaverMapView');
export const Commands: NaverMapNativeCommands =
  codegenNativeCommands<NaverMapNativeCommands>({
    supportedCommands: [
      'screenToCoordinate',
      'coordinateToScreen',
      'animateCameraTo',
      'animateCameraBy',
      'animateZoom',
      'animateCameraFitBounds',
      'cancelAnimation',
    ],
  });
