import "server-only";

export type PrivateReviewMediaDescriptor = {
  blobKey: string;
  bytes: number;
  fileName: string;
  folder: string;
  mimeType: "image/webp" | "video/mp4";
};

const reviewMedia = {
  cover: {
    folder: "cover",
    files: {
      "axe_whaxe_lil_baby_cover_v001.webp": ["image/webp", 18932],
      "amsoil_xpd_wind_grease_cover_v001.webp": ["image/webp", 30102],
      "cable_snake_cover_v001.webp": ["image/webp", 15188],
      "capri_sun_cover_v001.webp": ["image/webp", 57032],
      "wawa_coffee_island_cover_v001.webp": ["image/webp", 31948],
    },
  },
  "axe-whaxe-lil-baby": {
    folder: "axe_whaxe_lil_baby",
    files: {
      "axe_whaxe_campaign_v001.mp4": ["video/mp4", 5013029],
      "axe_whaxe_diamond_still_v001.webp": ["image/webp", 39986],
      "axe_whaxe_hero_poster_v001.webp": ["image/webp", 47478],
      "axe_whaxe_og_1200x630_v001.webp": ["image/webp", 31502],
      "axe_whaxe_product_layer_poster_v001.webp": ["image/webp", 91536],
      "axe_whaxe_product_layer_v001.mp4": ["video/mp4", 3858603],
      "axe_whaxe_product_still_v001.webp": ["image/webp", 82008],
    },
  },
  "vfx-compositing": {
    folder: "vfx_compositing",
    files: {
      "vfx_candy_final_v001.mp4": ["video/mp4", 1051469],
      "vfx_candy_final_v001_poster.webp": ["image/webp", 71800],
      "vfx_candy_original_v001.mp4": ["video/mp4", 1001204],
      "vfx_candy_original_v001_poster.webp": ["image/webp", 63864],
      "vfx_candy_process_v001.webp": ["image/webp", 54154],
      "vfx_geico_final_v001.mp4": ["video/mp4", 2184008],
      "vfx_geico_final_v001_poster.webp": ["image/webp", 26448],
      "vfx_ups_final_v001.mp4": ["video/mp4", 2492582],
      "vfx_ups_final_v001_poster.webp": ["image/webp", 50568],
      "vfx_ups_process_v001.mp4": ["video/mp4", 1702354],
      "vfx_ups_process_v001_poster.webp": ["image/webp", 19878],
      "vfx_va_lottery_final_v001.mp4": ["video/mp4", 478744],
      "vfx_va_lottery_final_v001_poster.webp": ["image/webp", 27664],
      "vfx_va_lottery_original_v001.mp4": ["video/mp4", 480030],
      "vfx_va_lottery_original_v001_poster.webp": ["image/webp", 27746],
    },
  },
  "amsoil-xpd-wind-grease": {
    folder: "amsoil_xpd_wind_grease",
    files: {
      "amsoil_bearing_closeup_v001.webp": ["image/webp", 44466],
      "amsoil_combined_assembly_viewport_v001.webp": ["image/webp", 46848],
      "amsoil_grease_comparison_poster_v001.webp": ["image/webp", 78398],
      "amsoil_grease_comparison_v001.mp4": ["video/mp4", 8231616],
      "amsoil_hero_composite_v001.webp": ["image/webp", 72612],
      "amsoil_model_plan_v001.webp": ["image/webp", 44546],
      "amsoil_trade_show_cutaway_proof_v001.webp": ["image/webp", 49446],
    },
  },
  "capri-sun": {
    folder: "capri_sun",
    files: {
      "capri_sun_noise_tech_hero_v001.webp": ["image/webp", 263624],
      "capri_sun_noise_tech_package_v001.webp": ["image/webp", 231942],
      "capri_sun_noise_tech_process_v001.webp": ["image/webp", 275534],
      "capri_sun_solstice_final_v001.webp": ["image/webp", 226162],
      "capri_sun_trick_treat_final_v001.webp": ["image/webp", 209946],
    },
  },
  "wawa-coffee-island": {
    folder: "wawa_coffee_island",
    files: {
      "wawa_coffee_products_v001.webp": ["image/webp", 110034],
      "wawa_configuration_motion_poster_v001.webp": ["image/webp", 130226],
      "wawa_configuration_motion_v001.mp4": ["video/mp4", 1520738],
      "wawa_front_configuration_v001.webp": ["image/webp", 308892],
      "wawa_hero_island_v001.webp": ["image/webp", 185768],
      "wawa_material_context_v001.webp": ["image/webp", 157322],
      "wawa_material_detail_v001.webp": ["image/webp", 186022],
      "wawa_rear_configuration_v001.webp": ["image/webp", 160242],
      "wawa_result_three_quarter_v001.webp": ["image/webp", 238254],
      "wawa_stocked_detail_v001.webp": ["image/webp", 235242],
    },
  },
  "cable-snake": {
    folder: "cable_snake",
    files: {
      "cable_snake_campaign_context_01.webp": ["image/webp", 81476],
      "cable_snake_case_film_poster_v001.webp": ["image/webp", 22346],
      "cable_snake_case_film_review_v001.mp4": ["video/mp4", 7792100],
      "cable_snake_cg_01.webp": ["image/webp", 48148],
      "cable_snake_final_02.webp": ["image/webp", 59714],
      "cable_snake_hero_poster_v001.webp": ["image/webp", 45650],
      "cable_snake_practical_01.webp": ["image/webp", 49396],
      "cable_snake_process_lookdev_01.webp": ["image/webp", 97594],
      "cable_snake_process_rig_01.webp": ["image/webp", 33840],
      "cable_snake_turnaround_loop_v001.mp4": ["video/mp4", 435955],
      "cable_snake_turnaround_poster_v001.webp": ["image/webp", 16196],
    },
  },
} as const;

export type PrivateReviewMediaCase = keyof typeof reviewMedia;

export function getPrivateReviewMedia(
  caseSlug: string,
  fileName: string,
): PrivateReviewMediaDescriptor | undefined {
  if (!Object.hasOwn(reviewMedia, caseSlug)) {
    return undefined;
  }

  const mediaCase = reviewMedia[caseSlug as PrivateReviewMediaCase];
  if (!Object.hasOwn(mediaCase.files, fileName)) {
    return undefined;
  }

  const [mimeType, bytes] = mediaCase.files[
    fileName as keyof typeof mediaCase.files
  ] as readonly [PrivateReviewMediaDescriptor["mimeType"], number];

  return {
    blobKey: `review/${mediaCase.folder}/${fileName}`,
    bytes,
    fileName,
    folder: mediaCase.folder,
    mimeType,
  };
}
