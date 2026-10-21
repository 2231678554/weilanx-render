import React from 'react';
/** 烘焙地形图：和 ReliefMap 同一个滤镜（seed 11），渲染成 public/images/lamplight/relief-11.jpg，地图镜头直接贴图 */
export const ReliefBake: React.FC = () => (
  <div style={{width: 2600, height: 1600, background: '#100d0a'}}>
    <svg width={2600} height={1600} style={{position: 'absolute'}}>
      <defs>
        <filter id="bake" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0052" numOctaves={8} seed={11} result="n" />
          <feDiffuseLighting in="n" surfaceScale={26} lightingColor="#9c8c76" diffuseConstant={1.15} result="d">
            <feDistantLight azimuth={225} elevation={32} />
          </feDiffuseLighting>
          <feComponentTransfer>
            <feFuncR type="gamma" exponent={2.6} amplitude={1.0} />
            <feFuncG type="gamma" exponent={2.6} amplitude={0.94} />
            <feFuncB type="gamma" exponent={2.6} amplitude={0.82} />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width={2600} height={1600} filter="url(#bake)" opacity={0.8} />
    </svg>
  </div>
);
