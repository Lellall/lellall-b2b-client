// Shared chart palette — derived from the app's brand green so every
// analytics chart across modules (restaurant, lounge, perfume) reads as
// one system instead of each page picking its own ad-hoc colors.
export const BRAND_GREEN = '#05431E';
export const BRAND_GREEN_MID = '#0E5D37';
export const BRAND_GOLD = '#D4AF37';

export const CHART_PALETTE = [
  '#05431E', // brand green
  '#D4AF37', // gold accent
  '#3D8361', // mid green
  '#B98B4E', // warm copper
  '#7FA0BE', // soft blue-gray
  '#9CA3AF', // neutral gray (overflow / "other")
  '#0E5D37',
  '#E2C275',
];

export const brandGradient = (ctx: CanvasRenderingContext2D, height = 300) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(5, 67, 30, 0.22)');
  gradient.addColorStop(1, 'rgba(5, 67, 30, 0)');
  return gradient;
};
