// src/utils/brandUtils.js

export function unifyBrandName(name) {
  const map = {
    "マイルドセブン": "メビウス",
    "マイルドセブンFK": "メビウス",
    "マイルドセブン・ライト": "メビウス",
    "マイルドセブン・スーパーライト": "メビウス",
    "キャスター・マイルド": "ウィンストン",
    "キャビン85・マイルドボックス": "ウィンストン",
  };
  return map[name] || name;
}

export function normalizeBrandName(name) {
  return name.replace(/・/g, "").replace(/\s/g, "").toLowerCase();
}
