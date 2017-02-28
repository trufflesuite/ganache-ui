import React, { Component } from 'react'

export default class Logo extends Component {
  render () {
    return (
      <svg width="50px" height="50px" viewBox="152 154 202 202" version="1.1">
          <defs>
              <linearGradient x1="97.1365392%" y1="50%" x2="1.63546157%" y2="50%" id="linearGradient-1">
                  <stop stopColor="#FFFFFF" stopOpacity="0.486243207" offset="0%"></stop>
                  <stop stopColor="#000000" stopOpacity="0.268993433" offset="100%"></stop>
              </linearGradient>
              <path d="M81.8021755,1.83022852 C84.6728547,0.172841093 89.3270398,0.172780197 92.1978245,1.83022852 L168.802175,46.0577711 C171.672855,47.7151586 174,51.7457707 174,55.0606673 L174,143.515753 C174,146.830527 171.67296,150.8612 168.802175,152.518649 L92.1978245,196.746191 C89.3271453,198.403579 84.6729602,198.40364 81.8021755,196.746191 L5.19782454,152.518649 C2.32714531,150.861261 4.79616347e-14,146.830649 4.61852778e-14,143.515753 L-5.32907052e-15,55.0606673 C-7.10542736e-15,51.7458925 2.32703984,47.7152195 5.19782454,46.0577711 L81.8021755,1.83022852 Z" id="path-2"></path>
              <mask id="mask-4" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="0" y="0" width="174" height="198.57642" fill="white">
                  <use href="#path-2"></use>
              </mask>
              <path d="M92,52 L92,43.5 L18.5086159,43.5 C16.5708608,43.5 15,41.9293087 15,39.9999054 L15,13.5" id="path-5"></path>
              <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-6">
                  <feMorphology radius="2" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                  <feOffset dx="0" dy="0" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                  <feMorphology radius="2" operator="erode" in="SourceAlpha" result="shadowInner"></feMorphology>
                  <feOffset dx="0" dy="0" in="shadowInner" result="shadowInner"></feOffset>
                  <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"></feComposite>
                  <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                  <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.171252264 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
              </filter>
              <path d="M92,52 L10.5,52 C8.84442345,52 7.49019608,51.712592 7.49019608,49.5 L7.49019608,4.5 L0,0 L1.87187138e-14,56.495308 C1.94511108e-14,58.7057693 1.34132201,60.5 2.99592655,60.5 L92,60.5" id="path-7"></path>
              <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-8">
                  <feMorphology radius="2" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                  <feOffset dx="0" dy="0" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                  <feMorphology radius="2" operator="erode" in="SourceAlpha" result="shadowInner"></feMorphology>
                  <feOffset dx="0" dy="0" in="shadowInner" result="shadowInner"></feOffset>
                  <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"></feComposite>
                  <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                  <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.171252264 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
              </filter>
              <path d="M92.5,115.5 L92.5,107 L18.5059448,107 C16.569665,107 15,105.429309 15,103.499905 L15,77" id="path-9"></path>
              <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-10">
                  <feMorphology radius="2" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                  <feOffset dx="0" dy="0" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                  <feMorphology radius="2" operator="erode" in="SourceAlpha" result="shadowInner"></feMorphology>
                  <feOffset dx="0" dy="0" in="shadowInner" result="shadowInner"></feOffset>
                  <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"></feComposite>
                  <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                  <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.171252264 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
              </filter>
              <path d="M92.5,120.5 L10.5,120.5 C8.84442345,120.5 7.49019608,120.212592 7.49019608,118 L7.49019608,73 L-3.41060513e-13,68.5 L-3.22341799e-13,124.995308 C-3.21609402e-13,127.205769 1.34132201,129 2.99592655,129 L91.5,129" id="path-11"></path>
              <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-12">
                  <feMorphology radius="2" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                  <feOffset dx="0" dy="0" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                  <feMorphology radius="2" operator="erode" in="SourceAlpha" result="shadowInner"></feMorphology>
                  <feOffset dx="0" dy="0" in="shadowInner" result="shadowInner"></feOffset>
                  <feComposite in="shadowOffsetOuter1" in2="shadowInner" operator="out" result="shadowOffsetOuter1"></feComposite>
                  <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                  <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.171252264 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
              </filter>
              <path d="M81.8021755,1.36629342 C84.6728547,-0.291094003 89.3270398,-0.291154899 92.1978245,1.36629342 L168.802175,45.593836 C171.672855,47.2512235 174,51.2818356 174,54.5967322 L174,143.051817 C174,146.366592 171.67296,150.397265 168.802175,152.054714 L92.1978245,196.282256 C89.3271453,197.939644 84.6729602,197.939705 81.8021755,196.282256 L5.19782454,152.054714 C2.32714531,150.397326 4.79616347e-14,146.366714 4.61852778e-14,143.051817 L-5.32907052e-15,54.5967322 C-7.10542736e-15,51.2819574 2.32703984,47.2512844 5.19782454,45.593836 L81.8021755,1.36629342 Z" id="path-13"></path>
              <mask id="mask-14" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="0" y="0" width="174" height="197.40209" fill="white">
                  <use href="#path-13"></use>
              </mask>
              <mask id="mask-16" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="0" y="0" width="174" height="197.40209" fill="white">
                  <use href="#path-13"></use>
              </mask>
          </defs>
          <g id="Group-3" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(166.000000, 156.000000)">
              <mask id="mask-3" fill="white">
                  <use href="#path-2"></use>
              </mask>
              <g id="Mask">
                  <use fill="#E5F2FF" fillRule="evenodd" href="#path-2"></use>
                  <use fill="url(#linearGradient-1)" fillRule="evenodd" style={{'mixBlendMode': 'screen'}} href="#path-2"></use>
                  <use stroke="#2E628C" mask="url(#mask-4)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" href="#path-2"></use>
              </g>
              <g id="Group" mask="url(#mask-3)">
                  <g transform="translate(90.000000, 136.500000) rotate(90.000000) translate(-90.000000, -136.500000) translate(43.500000, 72.000000)">
                      <g id="Path-2">
                          <use fill="black" fillOpacity="1" filter="url(#filter-6)" href="#path-5"></use>
                          <use stroke="#69A1CF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" href="#path-5"></use>
                      </g>
                      <g id="Path-2">
                          <use fill="black" fillOpacity="1" filter="url(#filter-8)" href="#path-7"></use>
                          <use stroke="#69A1CF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" href="#path-7"></use>
                      </g>
                      <g id="Path-2-Copy-2" transform="translate(53.750000, 96.250000) scale(1, -1) translate(-53.750000, -96.250000) ">
                          <use fill="black" fillOpacity="1" filter="url(#filter-10)" href="#path-9"></use>
                          <use stroke="#69A1CF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" href="#path-9"></use>
                      </g>
                      <g id="Path-2-Copy" transform="translate(46.250000, 98.750000) scale(1, -1) translate(-46.250000, -98.750000) ">
                          <use fill="black" fillOpacity="1" filter="url(#filter-12)" href="#path-11"></use>
                          <use stroke="#69A1CF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" href="#path-11"></use>
                      </g>
                  </g>
              </g>
              <path d="M33.8679199,64.2746582 L47.9523926,64.2746582 L47.9523926,67.4936523 L38.9216309,76.9199219 L48.2819824,76.9199219 L48.2819824,80.3806152 L33,80.3806152 L33,77.0407715 L41.9318848,67.7133789 L33.8679199,67.7133789 L33.8679199,64.2746582 Z M53.2209473,64.2746582 L58.2087402,64.2746582 L58.2087402,80.3806152 L53.2209473,80.3806152 L53.2209473,64.2746582 Z M64.3452148,80.3806152 L64.3452148,64.2746582 L72.6398926,64.2746582 C74.1779862,64.2746582 75.3535116,64.4064928 76.1665039,64.670166 C76.9794963,64.9338392 77.6350073,65.4227259 78.1330566,66.1368408 C78.631106,66.8509557 78.880127,67.720698 78.880127,68.7460938 C78.880127,69.6396529 78.6896992,70.4105192 78.3088379,71.0587158 C77.9279766,71.7069124 77.4043002,72.2324199 76.737793,72.6352539 C76.3129862,72.8916028 75.7307166,73.1040031 74.9909668,73.2724609 C75.5842315,73.4702158 76.0163561,73.6679678 76.2873535,73.8657227 C76.4704599,73.9975593 76.7359602,74.2795389 77.0838623,74.7116699 C77.4317644,75.143801 77.6643061,75.4770496 77.7814941,75.7114258 L80.1875,80.3806152 L74.5625,80.3806152 L71.9038086,75.4587402 C71.5668928,74.82153 71.2666029,74.4077158 71.0029297,74.2172852 C70.6440412,73.9682605 70.2375511,73.84375 69.7834473,73.84375 L69.3439941,73.84375 L69.3439941,80.3806152 L64.3452148,80.3806152 Z M69.3439941,70.8005371 L71.4423828,70.8005371 C71.6694347,70.8005371 72.1088835,70.7272957 72.7607422,70.5808105 C73.0903337,70.5148922 73.359496,70.3464369 73.5682373,70.0754395 C73.7769786,69.804442 73.8813477,69.4931658 73.8813477,69.1416016 C73.8813477,68.6215794 73.7165544,68.2224135 73.3869629,67.9440918 C73.0573714,67.6657701 72.4384811,67.5266113 71.5302734,67.5266113 L69.3439941,67.5266113 L69.3439941,70.8005371 Z M94.5966797,73.7998047 L98.958252,75.1181641 C98.6652817,76.3413147 98.2038606,77.363033 97.5739746,78.1833496 C96.9440886,79.0036662 96.1622361,79.6225565 95.2283936,80.0400391 C94.294551,80.4575216 93.1062084,80.6662598 91.6633301,80.6662598 C89.912833,80.6662598 88.4827936,80.4117457 87.3731689,79.90271 C86.2635443,79.3936742 85.3059122,78.4982974 84.5002441,77.2165527 C83.694576,75.934808 83.291748,74.2941995 83.291748,72.2946777 C83.291748,69.6286488 84.0003591,67.5797191 85.4176025,66.1478271 C86.834846,64.7159352 88.8398308,64 91.4326172,64 C93.4614359,64 95.0562686,64.4101521 96.2171631,65.2304688 C97.3780576,66.0507854 98.2404757,67.3105384 98.8044434,69.0097656 L94.4099121,69.9875488 C94.2561027,69.4968237 94.0949715,69.1379406 93.9265137,68.9108887 C93.648192,68.5300274 93.3076192,68.2370616 92.9047852,68.0319824 C92.5019511,67.8269033 92.0515162,67.7243652 91.5534668,67.7243652 C90.4255315,67.7243652 89.5612823,68.1784623 88.9606934,69.0866699 C88.5065895,69.7605014 88.279541,70.8188404 88.279541,72.2617188 C88.279541,74.0488371 88.5505344,75.2738004 89.0925293,75.9366455 C89.6345242,76.5994906 90.3962353,76.9309082 91.3776855,76.9309082 C92.3298387,76.9309082 93.049436,76.6635769 93.536499,76.1289062 C94.023562,75.5942356 94.376952,74.8178762 94.5966797,73.7998047 Z M103.249023,72.338623 C103.249023,69.7092154 103.981438,67.6621167 105.446289,66.1972656 C106.91114,64.7324146 108.950915,64 111.565674,64 C114.246351,64 116.31176,64.7195973 117.761963,66.1588135 C119.212165,67.5980297 119.937256,69.6140007 119.937256,72.2067871 C119.937256,74.0891207 119.620487,75.6326844 118.986938,76.8375244 C118.35339,78.0423644 117.437872,78.979855 116.240356,79.6500244 C115.042841,80.3201938 113.550546,80.6552734 111.763428,80.6552734 C109.947012,80.6552734 108.443732,80.3659697 107.25354,79.7873535 C106.063349,79.2087373 105.098392,78.2932192 104.358643,77.0407715 C103.618893,75.7883238 103.249023,74.2209567 103.249023,72.338623 Z M108.22583,72.3605957 C108.22583,73.9865804 108.527951,75.1547816 109.132202,75.8652344 C109.736453,76.5756871 110.558589,76.9309082 111.598633,76.9309082 C112.667974,76.9309082 113.495603,76.5830113 114.081543,75.887207 C114.667483,75.1914028 114.960449,73.942636 114.960449,72.1408691 C114.960449,70.6247483 114.654666,69.5169713 114.043091,68.8175049 C113.431515,68.1180385 112.602056,67.7683105 111.554688,67.7683105 C110.551265,67.7683105 109.745609,68.1235316 109.137695,68.8339844 C108.529782,69.5444371 108.22583,70.7199625 108.22583,72.3605957 Z M125.150879,64.2746582 L129.798096,64.2746582 L135.862549,73.1845703 L135.862549,64.2746582 L140.553711,64.2746582 L140.553711,80.3806152 L135.862549,80.3806152 L129.831055,71.5366211 L129.831055,80.3806152 L125.150879,80.3806152 L125.150879,64.2746582 Z" id="ZIRCON" fill="#1E202F" mask="url(#mask-3)"></path>
              <mask id="mask-15" fill="white">
                  <use href="#path-13"></use>
              </mask>
              <g id="Mask" stroke="#69A1CF" mask="url(#mask-14)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" transform="translate(87.000000, 98.824275) rotate(90.000000) translate(-87.000000, -98.824275) ">
                  <use mask="url(#mask-16)" href="#path-13"></use>
              </g>
          </g>
      </svg>
    )
  }
}
