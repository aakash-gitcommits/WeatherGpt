import { LanguageCode } from '../types/weather';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { hinglish } from './locales/hinglish';
import { bn } from './locales/bn';
import { te } from './locales/te';
import { mr } from './locales/mr';
import { ta } from './locales/ta';
import { gu } from './locales/gu';
import { ur } from './locales/ur';
import { kn } from './locales/kn';
import { or } from './locales/or';
import { ml } from './locales/ml';
import { pa } from './locales/pa';
import { as } from './locales/as';
import { sa } from './locales/sa';
import { kok } from './locales/kok';
import { sd } from './locales/sd';
import { ne } from './locales/ne';
import { doi } from './locales/doi';
import { ks } from './locales/ks';
import { sat } from './locales/sat';
import { mni } from './locales/mni';
import { brx } from './locales/brx';
import { bho } from './locales/bho';
import { mai } from './locales/mai';
import { har } from './locales/har';
import { raj } from './locales/raj';
import { awa } from './locales/awa';
import { hne } from './locales/hne';
import { mag } from './locales/mag';
import { bra } from './locales/bra';
import { bns } from './locales/bns';
import { gbm } from './locales/gbm';

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en,
  hi,
  hinglish,
  bn,
  te,
  mr,
  ta,
  gu,
  ur,
  kn,
  or,
  ml,
  pa,
  as,
  sa,
  kok,
  sd,
  ne,
  doi,
  ks,
  sat,
  mni,
  brx,
  bho,
  mai,
  har,
  raj,
  awa,
  hne,
  mag,
  bra,
  bns,
  gbm,
};

export type TranslationKey = keyof typeof en;
