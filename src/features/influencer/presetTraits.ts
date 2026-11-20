import { TraitSelection } from './traits';

/**
 * Trait tags for the 40 preset characters, read from their character sheets.
 * Picking a preset loads these into the builder so it can be tweaked from there.
 */
type Tag = [
  niche: string,
  age: string,
  heritage: string,
  faceShape: string,
  skinColor: string,
  skinFinish: string,
  eyeShape: string,
  eyeColor: string,
  build: string,
  height: string,
  hairstyle: string,
  hairColor: string,
  coverage: string,
  makeup: string,
  features: string[],
  style: string,
  homeBase: string,
  photoStyle: string,
  palette: string[],
  accessories: string[],
];

const T: Record<string, Tag> = {
  'baja-savage': ['Business & finance', 'Late 20s', 'Gulf Arab', 'Oval', 'Olive', 'Glowy', 'Almond', 'Brown', 'Slim', 'Tall', 'Long waves', 'Jet black', 'None', 'Soft glam', ['Full lips', 'Thick brows'], 'Formal', 'Downtown Dubai', 'Editorial flash', ['Ivory', 'Black', 'Gold'], ['Glasses', 'Gold jewellery']],
  'chloe-tan': ['Beauty & skincare', 'Mid 20s', 'Southeast Asian', 'Oval', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Slim', 'Average', 'Long straight', 'Jet black', 'None', 'Clean girl', ['Full lips'], 'Formal', 'Dubai Marina', 'Soft daylight', ['Ivory', 'Champagne', 'Gold'], ['Gold jewellery']],
  'layla-al-mansoor': ['Modest fashion', 'Mid 20s', 'Gulf Arab', 'Oval', 'Light', 'Glowy', 'Almond', 'Hazel', 'Slim', 'Tall', 'Sleek middle part', 'Dark brown', 'Loose shayla', 'Soft glam', ['High cheekbones', 'Long lashes'], 'Modest', 'Downtown Dubai', 'Soft daylight', ['Ivory', 'Sand', 'Champagne'], ['Gold jewellery']],
  'sienna-o-connor': ['Luxury lifestyle', 'Mid 20s', 'European', 'Heart', 'Fair', 'Natural', 'Almond', 'Green', 'Slim', 'Tall', 'Long waves', 'Copper red', 'None', 'Clean girl', ['High cheekbones'], 'Party', 'Paris', 'Golden hour', ['Ivory', 'Emerald', 'Gold'], ['Diamonds']],
  'ananya-kapoor': ['Bridal & events', 'Late 20s', 'South Asian', 'Oval', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Curvy', 'Average', 'Shoulder-length layers', 'Jet black', 'None', 'Full glam', ['Full lips', 'Thick brows'], 'Formal', 'Downtown Dubai', 'Editorial flash', ['Ivory', 'Gold', 'Champagne'], ['Gold jewellery']],
  'nadia-petrova': ['Luxury lifestyle', 'Late 20s', 'Eastern European', 'Diamond', 'Light', 'Matte', 'Upturned', 'Hazel', 'Slim', 'Tall', 'Sleek middle part', 'Dark brown', 'None', 'Bold red lip', ['High cheekbones', 'Defined jawline'], 'Formal', 'Downtown Dubai', 'Editorial flash', ['Ivory', 'Black', 'Gold'], ['Gold jewellery']],
  'salma-benali': ['Business & finance', 'Late 20s', 'North African', 'Oval', 'Olive', 'Glowy', 'Almond', 'Hazel', 'Slim', 'Tall', 'Sleek middle part', 'Jet black', 'None', 'Soft glam', ['Long lashes', 'High cheekbones'], 'Formal', 'Downtown Dubai', 'Soft daylight', ['Ivory', 'Sand', 'Gold'], ['Diamonds']],
  'rhea-malhotra': ['Luxury lifestyle', 'Mid 20s', 'South Asian', 'Oval', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Slim', 'Tall', 'Long waves', 'Jet black', 'None', 'Soft glam', ['Full lips'], 'Formal', 'Dubai Marina', 'Golden hour', ['Ivory', 'Champagne', 'Gold'], ['Diamonds', 'Gold jewellery']],
  'camila-santos': ['Fitness', 'Mid 20s', 'Latina', 'Oval', 'Brown', 'Glowy', 'Almond', 'Dark brown', 'Athletic', 'Tall', 'Box braids', 'Dark brown', 'None', 'Clean girl', ['High cheekbones'], 'Party', 'Dubai Marina', 'Golden hour', ['Ivory', 'Gold', 'Chocolate'], ['Gold jewellery']],
  'sofia-bellini': ['Luxury lifestyle', 'Late 20s', 'European', 'Oval', 'Olive', 'Glowy', 'Almond', 'Brown', 'Curvy', 'Average', 'Long waves', 'Chestnut', 'None', 'Soft glam', ['Full lips'], 'Party', 'Paris', 'Golden hour', ['Ivory', 'Blush', 'Gold'], ['Gold jewellery']],
  'amira-al-qasimi': ['Luxury lifestyle', 'Mid 20s', 'Gulf Arab', 'Oval', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Slim', 'Tall', 'Sleek middle part', 'Jet black', 'None', 'Full glam', ['Long lashes'], 'Party', 'Downtown Dubai', 'Editorial flash', ['Ivory', 'Champagne', 'Gold'], ['Diamonds']],
  'maya-hassan': ['Travel', 'Early 20s', 'Levantine', 'Heart', 'Olive', 'Natural', 'Almond', 'Brown', 'Slim', 'Average', 'Long waves', 'Jet black', 'None', 'Soft glam', ['Full lips'], 'Party', 'Desert', 'Golden hour', ['Ivory', 'Sand', 'Gold'], ['Gold jewellery']],
  'freya-lindqvist': ['Fitness', 'Late 20s', 'European', 'Diamond', 'Tan', 'Glowy', 'Almond', 'Brown', 'Athletic', 'Tall', 'Sleek bun', 'Dark brown', 'None', 'Bronzed', ['High cheekbones', 'Defined jawline'], 'Party', 'Studio', 'Soft daylight', ['Ivory', 'Sand', 'Black'], []],
  'valeria-mendoza': ['Beauty & skincare', 'Mid 20s', 'Latina', 'Oval', 'Tan', 'Glowy', 'Almond', 'Brown', 'Slim', 'Tall', 'Long waves', 'Dark brown', 'None', 'Soft glam', ['Full lips'], 'Formal', 'Dubai Marina', 'Soft daylight', ['Ivory', 'Blush', 'Gold'], ['Gold jewellery']],
  'kavya-nair': ['Business & finance', 'Late 20s', 'South Asian', 'Oval', 'Brown', 'Natural', 'Almond', 'Dark brown', 'Slim', 'Average', 'Long waves', 'Jet black', 'None', 'Soft glam', ['Full lips'], 'Formal', 'Downtown Dubai', 'Editorial flash', ['Ivory', 'Chocolate', 'Gold'], []],
  'soraya-darwish': ['Luxury lifestyle', 'Late 20s', 'Persian', 'Oval', 'Olive', 'Glowy', 'Almond', 'Brown', 'Curvy', 'Average', 'Voluminous curls', 'Dark brown', 'None', 'Full glam', ['Full lips', 'Thick brows'], 'Party', 'Downtown Dubai', 'Editorial flash', ['Ivory', 'Dusty rose', 'Gold'], ['Gold jewellery']],
  'tara-singhania': ['Business & finance', '30s', 'South Asian', 'Oval', 'Tan', 'Natural', 'Almond', 'Dark brown', 'Slim', 'Average', 'Sleek bun', 'Jet black', 'None', 'Clean girl', ['High cheekbones'], 'Formal', 'Downtown Dubai', 'Soft daylight', ['Ivory', 'Emerald', 'Gold'], ['Gold jewellery']],
  'valentina-cruz': ['Luxury lifestyle', 'Late 20s', 'Latina', 'Oval', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Slim', 'Tall', 'Long straight', 'Jet black', 'None', 'Full glam', ['Long lashes'], 'Everyday', 'Dubai Marina', 'Editorial flash', ['Ivory', 'Black', 'Gold'], ['Gold jewellery']],
  'yasmina-khoury': ['Travel', 'Mid 20s', 'Levantine', 'Heart', 'Olive', 'Glowy', 'Almond', 'Brown', 'Slim', 'Average', 'Sleek bun', 'Jet black', 'None', 'Soft glam', ['Dimples', 'Full lips'], 'Party', 'Desert', 'Golden hour', ['Ivory', 'Gold', 'Sand'], ['Gold jewellery']],
  'amina-nurzhanova': ['Modest fashion', 'Mid 20s', 'Central Asian', 'Oval', 'Light', 'Natural', 'Almond', 'Dark brown', 'Slim', 'Tall', 'Sleek middle part', 'Jet black', 'Loose shayla', 'Clean girl', ['High cheekbones'], 'Modest', 'Studio', 'Soft daylight', ['Ivory', 'Sand', 'Champagne'], []],
  'noura-al-sayegh': ['Luxury lifestyle', 'Mid 20s', 'Gulf Arab', 'Diamond', 'Tan', 'Glowy', 'Almond', 'Brown', 'Slim', 'Tall', 'Sleek bun', 'Dark brown', 'None', 'Bronzed', ['High cheekbones', 'Defined jawline'], 'Formal', 'Downtown Dubai', 'Golden hour', ['Ivory', 'Sand', 'Gold'], ['Gold jewellery']],
  'viktoria-novak': ['Fitness', 'Mid 20s', 'Eastern European', 'Heart', 'Olive', 'Glowy', 'Upturned', 'Brown', 'Athletic', 'Tall', 'Sleek bun', 'Dark brown', 'None', 'Soft glam', ['Full lips'], 'Everyday', 'Dubai Marina', 'Golden hour', ['Ivory', 'Sand', 'Gold'], ['Gold jewellery']],
  'claire-beaumont-lin': ['Beauty & skincare', 'Early 20s', 'Mixed', 'Oval', 'Fair', 'Natural', 'Almond', 'Brown', 'Slim', 'Average', 'Shoulder-length layers', 'Dark brown', 'None', 'Clean girl', [], 'Everyday', 'Paris', 'Soft daylight', ['Ivory', 'Blush', 'Sage'], []],
  'bianca-reyes': ['Luxury lifestyle', 'Mid 20s', 'Latina', 'Oval', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Slim', 'Tall', 'Long waves', 'Jet black', 'None', 'Soft glam', ['Full lips'], 'Party', 'Dubai Marina', 'Golden hour', ['Ivory', 'Champagne', 'Gold'], []],
  'yara-al-harbi': ['Business & finance', 'Late 20s', 'Gulf Arab', 'Diamond', 'Tan', 'Matte', 'Almond', 'Brown', 'Slim', 'Tall', 'Sleek middle part', 'Dark brown', 'None', 'Bronzed', ['High cheekbones'], 'Formal', 'Downtown Dubai', 'Soft daylight', ['Ivory', 'Sand', 'Chocolate'], ['Gold jewellery']],
  'giulia-moretti': ['Luxury lifestyle', 'Late 20s', 'European', 'Oval', 'Light', 'Glowy', 'Almond', 'Hazel', 'Slim', 'Tall', 'Long waves', 'Dark brown', 'None', 'Soft glam', ['High cheekbones', 'Full lips'], 'Formal', 'Paris', 'Editorial flash', ['Ivory', 'Black', 'Gold'], ['Diamonds']],
  'zoe-mansour': ['Business & finance', 'Mid 20s', 'Levantine', 'Oval', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Slim', 'Average', 'Long straight', 'Jet black', 'None', 'Soft glam', ['Full lips'], 'Formal', 'Downtown Dubai', 'Soft daylight', ['Ivory', 'Champagne', 'Gold'], ['Gold jewellery']],
  'katarina-volkov': ['Luxury lifestyle', 'Mid 20s', 'Eastern European', 'Heart', 'Fair', 'Glowy', 'Almond', 'Grey', 'Slim', 'Tall', 'Long waves', 'Jet black', 'None', 'Soft glam', ['Full lips'], 'Formal', 'Downtown Dubai', 'Editorial flash', ['Ivory', 'Black', 'Gold'], ['Gold jewellery']],
  'farah-al-khatib': ['Modest fashion', 'Mid 20s', 'Levantine', 'Heart', 'Light', 'Glowy', 'Almond', 'Brown', 'Slim', 'Average', 'Long waves', 'Jet black', 'None', 'Soft glam', ['Thick brows'], 'Formal', 'Downtown Dubai', 'Soft daylight', ['Ivory', 'Sand', 'Blush'], []],
  'adriana-silva': ['Beauty & skincare', 'Mid 20s', 'Latina', 'Oval', 'Olive', 'Glowy', 'Almond', 'Brown', 'Slim', 'Average', 'Sleek middle part', 'Dark brown', 'None', 'Soft glam', ['Full lips', 'High cheekbones'], 'Everyday', 'Dubai Marina', 'Golden hour', ['Ivory', 'Sand', 'Gold'], ['Gold jewellery']],
  'samira-jaffer': ['Bridal & events', 'Mid 20s', 'South Asian', 'Oval', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Slim', 'Average', 'Long straight', 'Jet black', 'None', 'Full glam', ['Long lashes'], 'Party', 'Downtown Dubai', 'Editorial flash', ['Ivory', 'Champagne', 'Gold'], ['Diamonds']],
  'monica-castellanos': ['Luxury lifestyle', 'Late 20s', 'Latina', 'Oval', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Slim', 'Tall', 'Long waves', 'Jet black', 'None', 'Full glam', ['Full lips'], 'Formal', 'Dubai Marina', 'Editorial flash', ['Ivory', 'Black', 'Gold'], []],
  'astrid-van-der-berg': ['Luxury lifestyle', 'Late 20s', 'European', 'Diamond', 'Fair', 'Matte', 'Almond', 'Grey', 'Slim', 'Very tall', 'Slicked-back', 'Dark brown', 'None', 'Editorial', ['Defined jawline', 'High cheekbones'], 'Formal', 'Paris', 'Editorial flash', ['Ivory', 'Black'], ['Diamonds']],
  'elena-popescu': ['Travel', 'Mid 20s', 'Eastern European', 'Oval', 'Olive', 'Glowy', 'Almond', 'Brown', 'Curvy', 'Average', 'Voluminous curls', 'Dark brown', 'None', 'Soft glam', ['Full lips', 'Thick brows'], 'Party', 'Desert', 'Golden hour', ['Ivory', 'Gold', 'Sand'], ['Gold jewellery']],
  'rania-al-nasser': ['Modest fashion', 'Late 20s', 'Gulf Arab', 'Oval', 'Light', 'Glowy', 'Almond', 'Brown', 'Slim', 'Tall', 'Long waves', 'Dark brown', 'None', 'Soft glam', ['Long lashes'], 'Modest', 'Downtown Dubai', 'Soft daylight', ['Ivory', 'Sand', 'Champagne'], ['Diamonds']],
  'tatiana-morales': ['Fitness', 'Mid 20s', 'Latina', 'Oval', 'Tan', 'Glowy', 'Almond', 'Brown', 'Athletic', 'Tall', 'Long waves', 'Caramel balayage', 'None', 'Bronzed', ['High cheekbones'], 'Everyday', 'Dubai Marina', 'Golden hour', ['Ivory', 'Sand', 'Gold'], ['Gold jewellery']],
  'kyla-wijaya': ['Travel', 'Early 20s', 'Southeast Asian', 'Oval', 'Light', 'Glowy', 'Almond', 'Dark brown', 'Slim', 'Average', 'Long waves', 'Dark brown', 'None', 'Clean girl', [], 'Everyday', 'Dubai Marina', 'Soft daylight', ['Ivory', 'Sage', 'Sand'], []],
  'shirin-farhadi': ['Beauty & skincare', 'Late 20s', 'Persian', 'Oval', 'Olive', 'Glowy', 'Almond', 'Brown', 'Slim', 'Average', 'Bob', 'Dark brown', 'None', 'Soft glam', ['Dimples'], 'Everyday', 'Downtown Dubai', 'Soft daylight', ['Ivory', 'Gold', 'Blush'], ['Gold jewellery']],
  'gabriela-costa': ['Luxury lifestyle', 'Mid 20s', 'Latina', 'Heart', 'Tan', 'Glowy', 'Almond', 'Dark brown', 'Curvy', 'Average', 'Long waves', 'Dark brown', 'None', 'Full glam', ['Full lips'], 'Party', 'Dubai Marina', 'Golden hour', ['Ivory', 'Hot pink', 'Gold'], ['Diamonds']],
  'celine-choueiri': ['Bridal & events', 'Late 20s', 'Levantine', 'Oval', 'Light', 'Glowy', 'Almond', 'Brown', 'Slim', 'Average', 'Hollywood waves', 'Dark brown', 'None', 'Full glam', ['Full lips', 'Long lashes'], 'Formal', 'Downtown Dubai', 'Editorial flash', ['Ivory', 'Champagne', 'Blush'], ['Pearls']],
};

const KEYS = ['niche', 'age', 'heritage', 'faceShape', 'skinColor', 'skinFinish', 'eyeShape', 'eyeColor', 'build', 'height', 'hairstyle', 'hairColor', 'coverage', 'makeup', 'features', 'style', 'homeBase', 'photoStyle', 'palette', 'accessories'] as const;

export const PRESET_TRAITS: Record<string, TraitSelection> = Object.fromEntries(
  Object.entries(T).map(([id, tag]) => {
    const sel: TraitSelection = { gender: ['Female'] };
    KEYS.forEach((k, i) => {
      const v = tag[i];
      const arr = Array.isArray(v) ? v : [v];
      if (arr.length) sel[k] = arr;
    });
    return [id, sel];
  })
);

export const presetTraits = (id: string | null | undefined): TraitSelection | undefined => (id ? PRESET_TRAITS[id] : undefined);
