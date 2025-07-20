// 数値フォーマット用の関数

const FORMAT_UNITS = [
  { suffix: '', divisor: 1 },
  { suffix: 'K', divisor: 1e3 },
  { suffix: 'M', divisor: 1e6 },
  { suffix: 'G', divisor: 1e9 },
  { suffix: 'T', divisor: 1e12 },
  { suffix: 'P', divisor: 1e15 },
  { suffix: 'E', divisor: 1e18 },
  { suffix: 'Z', divisor: 1e21 },
  { suffix: 'Y', divisor: 1e24 },
  { suffix: 'R', divisor: 1e27 },
  { suffix: 'Q', divisor: 1e30 },
  { suffix: 'Sx', divisor: 1e33 },
  { suffix: 'Sp', divisor: 1e36 },
  { suffix: 'Oc', divisor: 1e39 },
  { suffix: 'No', divisor: 1e42 },
  { suffix: 'Dc', divisor: 1e45 },
  { suffix: 'UD', divisor: 1e48 },
  { suffix: 'DD', divisor: 1e51 },
  { suffix: 'TD', divisor: 1e54 },
  { suffix: 'QD', divisor: 1e57 },
  { suffix: 'QiD', divisor: 1e60 },
  { suffix: 'SxD', divisor: 1e63 },
  { suffix: 'SpD', divisor: 1e66 },
  { suffix: 'OcD', divisor: 1e69 },
  { suffix: 'NoD', divisor: 1e72 },
  { suffix: 'Vg', divisor: 1e75 },
  { suffix: 'UVg', divisor: 1e78 },
  { suffix: 'DVg', divisor: 1e81 },
  { suffix: 'TVg', divisor: 1e84 },
  { suffix: 'QVg', divisor: 1e87 },
  { suffix: 'QiVg', divisor: 1e90 },
  { suffix: 'SxVg', divisor: 1e93 },
  { suffix: 'SpVg', divisor: 1e96 },
  { suffix: 'OcVg', divisor: 1e99 },
  { suffix: 'NoVg', divisor: 1e102 },
  { suffix: 'Tg', divisor: 1e105 },
  { suffix: 'UTg', divisor: 1e108 },
  { suffix: 'DTg', divisor: 1e111 },
  { suffix: 'TTg', divisor: 1e114 },
  { suffix: 'QTg', divisor: 1e117 },
  { suffix: 'QiTg', divisor: 1e120 },
  { suffix: 'SxTg', divisor: 1e123 },
  { suffix: 'SpTg', divisor: 1e126 },
  { suffix: 'OcTg', divisor: 1e129 },
  { suffix: 'NoTg', divisor: 1e132 },
  { suffix: 'Qag', divisor: 1e135 },
  { suffix: 'UQag', divisor: 1e138 },
  { suffix: 'DQag', divisor: 1e141 },
  { suffix: 'TQag', divisor: 1e144 },
  { suffix: 'QQag', divisor: 1e147 },
  { suffix: 'QiQag', divisor: 1e150 },
  { suffix: 'SxQag', divisor: 1e153 },
  { suffix: 'SpQag', divisor: 1e156 },
  { suffix: 'OcQag', divisor: 1e159 },
  { suffix: 'NoQag', divisor: 1e162 },
  { suffix: 'Qig', divisor: 1e165 },
  { suffix: 'UQig', divisor: 1e168 },
  { suffix: 'DQig', divisor: 1e171 },
  { suffix: 'TQig', divisor: 1e174 },
  { suffix: 'QQig', divisor: 1e177 },
  { suffix: 'QiQig', divisor: 1e180 },
  { suffix: 'SxQig', divisor: 1e183 },
  { suffix: 'SpQig', divisor: 1e186 },
  { suffix: 'OcQig', divisor: 1e189 },
  { suffix: 'NoQig', divisor: 1e192 },
  { suffix: 'Sxg', divisor: 1e195 },
  { suffix: 'USxg', divisor: 1e198 },
  { suffix: 'DSxg', divisor: 1e201 },
  { suffix: 'TSxg', divisor: 1e204 },
  { suffix: 'QSxg', divisor: 1e207 },
  { suffix: 'QiSxg', divisor: 1e210 },
  { suffix: 'SxSxg', divisor: 1e213 },
  { suffix: 'SpSxg', divisor: 1e216 },
  { suffix: 'OcSxg', divisor: 1e219 },
  { suffix: 'NoSxg', divisor: 1e222 },
  { suffix: 'Spg', divisor: 1e225 },
  { suffix: 'USpg', divisor: 1e228 },
  { suffix: 'DSpg', divisor: 1e231 },
  { suffix: 'TSpg', divisor: 1e234 },
  { suffix: 'QSpg', divisor: 1e237 },
  { suffix: 'QiSpg', divisor: 1e240 },
  { suffix: 'SxSpg', divisor: 1e243 },
  { suffix: 'SpSpg', divisor: 1e246 },
  { suffix: 'OcSpg', divisor: 1e249 },
  { suffix: 'NoSpg', divisor: 1e252 },
  { suffix: 'Ocg', divisor: 1e255 },
  { suffix: 'UOcg', divisor: 1e258 },
  { suffix: 'DOcg', divisor: 1e261 },
  { suffix: 'TOcg', divisor: 1e264 },
  { suffix: 'QOcg', divisor: 1e267 },
  { suffix: 'QiOcg', divisor: 1e270 },
  { suffix: 'SxOcg', divisor: 1e273 },
  { suffix: 'SpOcg', divisor: 1e276 },
  { suffix: 'OcOcg', divisor: 1e279 },
  { suffix: 'NoOcg', divisor: 1e282 },
  { suffix: 'Nog', divisor: 1e285 },
  { suffix: 'UNog', divisor: 1e288 },
  { suffix: 'DNog', divisor: 1e291 },
  { suffix: 'TNog', divisor: 1e294 },
  { suffix: 'QNog', divisor: 1e297 },
  { suffix: 'QiNog', divisor: 1e300 },
  { suffix: 'SxNog', divisor: 1e303 },
  { suffix: 'SpNog', divisor: 1e306 },
  { suffix: 'OcNog', divisor: 1e309 },
];

function formatNumber(num, decimals = 2) {
  if (num < 1000) {
    return Math.floor(num).toString();
  }

  // 科学的記数法の閾値
  if (num >= 1e309) {
    return num.toExponential(decimals);
  }

  // 適切な単位を見つける
  for (let i = FORMAT_UNITS.length - 1; i >= 0; i--) {
    const unit = FORMAT_UNITS[i];
    if (num >= unit.divisor) {
      const value = num / unit.divisor;
      if (value >= 1000) {
        // 次の単位に移行すべき場合
        continue;
      }
      const formatted =
        value < 10 ? value.toFixed(decimals) : value < 100 ? value.toFixed(1) : Math.floor(value).toString();
      return formatted + unit.suffix;
    }
  }

  return Math.floor(num).toString();
}

function formatTime(seconds) {
  if (seconds < 60) {
    return Math.floor(seconds) + '秒';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes + '分';
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + '時間';
  }
  const days = Math.floor(hours / 24);
  return days + '日';
}

function formatPercent(value, decimals = 1) {
  return (value * 100).toFixed(decimals) + '%';
}

function formatMultiplier(value, decimals = 1) {
  if (value < 1000) {
    return 'x' + value.toFixed(decimals);
  }
  return 'x' + formatNumber(value, decimals);
}
