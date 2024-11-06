export enum POLICE_ICON {
  /** 摄像头 */
  SXT = "icon-idp-xapp0-cad-sxt",
  WZCTE = "icon-idp-xapp0-cad-wzctc",
  XLC01 = "icon-idp-xapp0-cad-xlc01",
  XLC02 = "icon-idp-xapp0-cad-xlc02",
  GC = "icon-idp-xapp0-cad-gc",
  JY = "icon-idp-xapp0-cad-jy",
  ZGJY = "icon-idp-xapp0-cad-zgjy",
  ZFJLY = "icon-idp-xapp0-cad-zfjly",
  JY_JH = "icon-idp-xapp0-cad-jyjh",
  JC_JH = "icon-idp-xapp0-cad-jcjh",
  GC_JH = "icon-idp-xapp0-cad-gcjh",
  ZFJLY_JH = "icon-idp-xapp0-cad-zfjlyjh",
  PCS = "icon-idp-xapp0-cad-pcs",
  FJ = "icon-idp-xapp0-cad-fj",
  QT = "icon-idp-xapp0-cad-qt",
  JWZ = "icon-idp-xapp0-cad-jwz",
  JWZ_JH = "icon-idp-xapp0-cad-jwzjh",
  DT = "icon-idp-xapp0-cad-dt",
  DT_JH = "icon-idp-xapp0-cad-dtjh",
  LD = "icon-idp-xapp0-cad-ld",
  CJ_DD = "icon-idp-xapp0-cad-cjydd",

  // 警情撒点上图图标
  JQ_ICON = "icon-idp-xapp0-cad-jqjb",
  JQ_ICON1 = "icon-idp-xapp0-cad-jqjb1",
  JQ_ICON2 = "icon-idp-xapp0-cad-jqjb2",
  JQ_ICON3 = "icon-idp-xapp0-cad-jqjb3",
  JQ_ICON4 = "icon-idp-xapp0-cad-jqjb4",

  MRDB = "icon-idp-xapp0-cad-mrdb"
}

export const resolveIconpath = (icon: POLICE_ICON) => {
  return `/app/uapapi/common/icon/redirect-preview/${icon}`;
};
