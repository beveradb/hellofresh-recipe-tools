const config = {
  RECIPES_JSON_URL:
    import.meta.env.VITE_RECIPES_JSON_URL || "https://google.com",
  // Default to HelloFresh URLs if not configured
  RECIPE_CARD_BASE_URL:
    import.meta.env.VITE_RECIPE_CARD_BASE_URL ||
    "https://www.hellofresh.co.uk/recipecards/card/",
  LARGE_IMAGE_BASE_URL:
    import.meta.env.VITE_LARGE_IMAGE_BASE_URL ||
    "https://img.hellofresh.com/w_4000,q_auto,f_auto,c_fit,fl_lossy/hellofresh_s3/",
  SMALL_IMAGE_BASE_URL:
    import.meta.env.VITE_SMALL_IMAGE_BASE_URL ||
    "https://img.hellofresh.com/w_500,q_auto,f_auto,c_fit,fl_lossy/hellofresh_s3/",
};

export default config;
