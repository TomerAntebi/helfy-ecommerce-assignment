const PLACEHOLDER_BASE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30';

export const getPlaceholderImage = (width = 300, height = 300): string =>
  `${PLACEHOLDER_BASE}?w=${width}&h=${height}&fit=crop`;
