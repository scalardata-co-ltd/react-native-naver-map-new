//
//  RNCNaverMapMarker.m
//  mj-studio-react-native-naver-map
//
//  Created by mj on 4/6/24.
//

#import "RNCNaverMapMarker.h"
#import <React/RCTBridge+Private.h>
#ifdef RCT_NEW_ARCH_ENABLED
using namespace facebook::react;
@interface RNCNaverMapMarker () <RCTRNCNaverMapMarkerViewProtocol>

@end
#endif

static const NSInteger kMaxImageLoadRetries = 2;
static const NSTimeInterval kRetryDelay = 0.5;
static NSCache<NSString*, NMFOverlayImage*>* _imageCache;

@implementation RNCNaverMapMarker {
  RNCNaverMapImageCanceller _imageCanceller;
  BOOL _isImageSetFromSubview;
  BOOL _isLoadingImage;
}

- (RCTBridge*)bridge {
  return [RCTBridge currentBridge];
}

+ (void)initialize {
  if (self == [RNCNaverMapMarker class]) {
    _imageCache = [[NSCache alloc] init];
    _imageCache.countLimit = 200; // 캐시 크기 설정
  }

  [[NSNotificationCenter defaultCenter] addObserver:self
                                          selector:@selector(clearImageCache)
                                              name:UIApplicationDidReceiveMemoryWarningNotification
                                            object:nil];
}

+ (BOOL)shouldBeRecycled {
  return NO;
}

- (std::shared_ptr<RNCNaverMapMarkerEventEmitter const>)emitter {
  if (!_eventEmitter)
    return nullptr;
  return std::static_pointer_cast<RNCNaverMapMarkerEventEmitter const>(_eventEmitter);
}

- (instancetype)init {
  if ((self = [super init])) {
    _inner = [NMFMarker new];
    _isImageSetFromSubview = NO;
    _isLoadingImage = NO;
    
    [self setupTouchHandler];
  }
  return self;
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNCNaverMapMarkerProps>();
    _props = defaultProps;
  }

  return self;
}

- (void)dealloc {
  if (_imageCanceller) {
    _imageCanceller();
    _imageCanceller = nil;
  }
}

- (NSString*)createCacheKeyForImage:(facebook::react::RNCNaverMapMarkerImageStruct)image {
  NSMutableString* key = [NSMutableString string];
  
  if (!image.symbol.empty()) {
    [key appendFormat:@"%s_", image.symbol.c_str()];
  }
  if (!image.rnAssetUri.empty()) {
    [key appendFormat:@"%s_", image.rnAssetUri.c_str()];
  }
  if (!image.httpUri.empty()) {
    [key appendFormat:@"%s_", image.httpUri.c_str()];
  }
  if (!image.assetName.empty()) {
    [key appendFormat:@"%s_", image.assetName.c_str()];
  }
  if (!image.reuseIdentifier.empty()) {
    [key appendFormat:@"%s", image.reuseIdentifier.c_str()];
  }
  
  if (key.length == 0) {
    [key appendString:@"default_marker"];
  }
  
  return key;
}

- (void)setImage:(facebook::react::RNCNaverMapMarkerImageStruct)image {
  _image = image;
  if (_isImageSetFromSubview) {
    return;
  }

  if (_imageCanceller) {
    _imageCanceller();
    _imageCanceller = nil;
  }
    
  [self loadImageWithRetry:image retryCount:0];
}

- (void)setupTouchHandler {
  __weak RNCNaverMapMarker *weakSelf = self;
  _inner.touchHandler = ^BOOL(NMFOverlay* overlay) {
    RNCNaverMapMarker *strongSelf = weakSelf;
    if (!strongSelf || !strongSelf->_inner || !strongSelf->_inner.mapView) {
      return NO;
    }

    if (strongSelf->_inner.hidden || strongSelf->_inner.alpha <= 0) {
      return NO;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
      if (strongSelf && strongSelf.emitter) {
        strongSelf.emitter->onTapOverlay({});
      }
    });
    
    return YES;
  };
}

- (void)loadImageWithRetry:(facebook::react::RNCNaverMapMarkerImageStruct)image
               retryCount:(NSInteger)currentRetry {
  if (!self.inner) {
    NSLog(@"[RNCNaverMapMarker] Failed to load image - inner is null");
    return;
  }
    
  NSString* cacheKey = [self createCacheKeyForImage:image];
  
  NMFOverlayImage* cachedImage = [_imageCache objectForKey:cacheKey];
  if (cachedImage) {
    self.inner.iconImage = cachedImage;
    self.inner.hidden = NO;
    [self setupTouchHandler];
    return;
  }
  
  _isLoadingImage = YES;
  
  __weak RNCNaverMapMarker *weakSelf = self;
    _imageCanceller = nmap::getImage([self bridge], image, ^(NMFOverlayImage* _Nullable loadedImage) {
    dispatch_async(dispatch_get_main_queue(), ^{
      RNCNaverMapMarker *strongSelf = weakSelf;
      if (!strongSelf || !strongSelf->_isLoadingImage) {
        return;
      }
      
      if (loadedImage) {
        [_imageCache setObject:loadedImage forKey:cacheKey];
        [strongSelf setupTouchHandler];
        strongSelf.inner.iconImage = loadedImage;
        strongSelf.inner.hidden = NO;
        NSLog(@"Marker image loaded successfully");
      } else {
        if (currentRetry < kMaxImageLoadRetries) {
          NSLog(@"Marker image load failed, retrying... (%ld/%ld)",
                (long)currentRetry + 1, (long)kMaxImageLoadRetries);
          [strongSelf scheduleRetry:image retryCount:currentRetry];
        } else {
          NSLog(@"Marker image load failed after %ld retries", (long)kMaxImageLoadRetries);
          if (strongSelf.inner) {
            strongSelf.inner.hidden = YES;
          }
        }
      }
      
      strongSelf->_isLoadingImage = NO;
      strongSelf->_imageCanceller = nil;
    });
  });
}

- (void)scheduleRetry:(facebook::react::RNCNaverMapMarkerImageStruct)image
           retryCount:(NSInteger)currentRetry {
  __weak RNCNaverMapMarker *weakSelf = self;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(kRetryDelay * NSEC_PER_SEC)),
                dispatch_get_main_queue(), ^{
    RNCNaverMapMarker *strongSelf = weakSelf;
    if (strongSelf && strongSelf->_isLoadingImage) {
      [strongSelf loadImageWithRetry:image retryCount:currentRetry + 1];
    }
  });
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol>*)childComponentView
                          index:(NSInteger)index {
  [self insertReactSubview:childComponentView atIndex:index];
}
- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol>*)childComponentView
                            index:(NSInteger)index {
  [self removeReactSubview:childComponentView];
}

- (void)insertReactSubview:(UIView*)subview atIndex:(NSInteger)atIndex {
  if (_imageCanceller) {
    _imageCanceller();
    _imageCanceller = nil;
  }
  _isImageSetFromSubview = YES;
  _inner.alpha = 0;
  // prevent default image is set after this logic in old arch
  dispatch_async(dispatch_get_main_queue(), [self, subview]() {
    self.inner.alpha = 1;
    self.inner.iconImage = [NMFOverlayImage overlayImageWithImage:[self captureView:subview]];
  });
}

- (void)removeReactSubview:(UIView*)subview {
  _isImageSetFromSubview = NO;

  // after custom marker is removed, set image from prop.
  self.image = _image;
}

- (UIImage*)captureView:(UIView*)view {
  UIGraphicsImageRenderer* renderer =
      [[UIGraphicsImageRenderer alloc] initWithSize:view.bounds.size];
  auto ret =
      [renderer imageWithActions:^(UIGraphicsImageRendererContext* _Nonnull rendererContext) {
        [view.layer renderInContext:rendererContext.CGContext];
      }];
  return ret;
}

+ (void)clearImageCache {
  [_imageCache removeAllObjects];
}

#pragma clang diagnostic pop

- (void)updateProps:(Props::Shared const&)props oldProps:(Props::Shared const&)oldProps {
  const auto& prev = *std::static_pointer_cast<RNCNaverMapMarkerProps const>(_props);
  const auto& next = *std::static_pointer_cast<RNCNaverMapMarkerProps const>(props);

  if (!nmap::isCoordEqual(prev.coord, next.coord))
    _inner.position = nmap::createLatLng(next.coord);

  if (prev.zIndexValue != next.zIndexValue)
    _inner.zIndex = next.zIndexValue;
  if (prev.globalZIndexValue != next.globalZIndexValue && isValidNumber(next.globalZIndexValue))
    _inner.globalZIndex = next.globalZIndexValue;
  if (prev.isHidden != next.isHidden)
    _inner.hidden = next.isHidden;
  if (prev.minZoom != next.minZoom)
    _inner.minZoom = next.minZoom;
  if (prev.maxZoom != next.maxZoom)
    _inner.maxZoom = next.maxZoom;
  if (prev.isMinZoomInclusive != next.isMinZoomInclusive)
    _inner.isMinZoomInclusive = next.isMinZoomInclusive;
  if (prev.isMaxZoomInclusive != next.isMaxZoomInclusive)
    _inner.isMaxZoomInclusive = next.isMaxZoomInclusive;

  if (prev.width != next.width && isValidNumber(next.width))
    _inner.width = next.width;
  if (prev.height != next.height && isValidNumber(next.height))
    _inner.height = next.height;

  if (!nmap::isAnchorEqual(prev.anchor, next.anchor))
    _inner.anchor = nmap::createAnchorCGPoint(next.anchor);

  if (prev.angle != next.angle)
    _inner.angle = next.angle;
  if (prev.isFlatEnabled != next.isFlatEnabled)
    [_inner setFlat:next.isFlatEnabled];
  if (prev.isIconPerspectiveEnabled != next.isIconPerspectiveEnabled)
    [_inner setIconPerspectiveEnabled:next.isIconPerspectiveEnabled];
  if (prev.alpha != next.alpha)
    [_inner setAlpha:next.alpha];
  if (prev.isHideCollidedSymbols != next.isHideCollidedSymbols)
    [_inner setIsHideCollidedSymbols:next.isHideCollidedSymbols];
  if (prev.isHideCollidedMarkers != next.isHideCollidedMarkers)
    [_inner setIsHideCollidedMarkers:next.isHideCollidedMarkers];
  if (prev.isHideCollidedCaptions != next.isHideCollidedCaptions)
    [_inner setIsHideCollidedCaptions:next.isHideCollidedCaptions];
  if (prev.isForceShowIcon != next.isForceShowIcon)
    [_inner setIsForceShowIcon:next.isForceShowIcon];
  if (prev.tintColor != next.tintColor)
    [_inner setIconTintColor:nmap::intToColor(next.tintColor)];

  if (!nmap::isImageEqual(prev.image, next.image))
    self.image = next.image;

  if (next.caption.key != prev.caption.key) {
    auto caption = next.caption;
    _inner.captionText = getNsStr(caption.text);
    _inner.captionRequestedWidth = caption.requestedWidth;
    _inner.captionAligns = @[ nmap::createAlign(caption.align) ];
    _inner.captionOffset = caption.offset;
    _inner.captionColor = nmap::intToColor(caption.color);
    _inner.captionHaloColor = nmap::intToColor(caption.haloColor);
    _inner.captionTextSize = caption.textSize;
    _inner.captionMinZoom = caption.minZoom;
    _inner.captionMaxZoom = caption.maxZoom;
  }

  if (next.subCaption.key != prev.subCaption.key) {
    auto caption = next.subCaption;
    _inner.subCaptionText = getNsStr(caption.text);
    _inner.subCaptionRequestedWidth = caption.requestedWidth;
    _inner.subCaptionColor = nmap::intToColor(caption.color);
    _inner.subCaptionHaloColor = nmap::intToColor(caption.haloColor);
    _inner.subCaptionTextSize = caption.textSize;
    _inner.subCaptionMinZoom = caption.minZoom;
    _inner.subCaptionMaxZoom = caption.maxZoom;
  }

  [self setupTouchHandler];
  [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> RNCNaverMapMarkerCls(void) {
  return RNCNaverMapMarker.class;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<RNCNaverMapMarkerComponentDescriptor>();
}

@end
