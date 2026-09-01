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
      "amsoil_xpd_wind_grease_cover_v001.webp": ["image/webp", 30102],
      "cable_snake_cover_v001.webp": ["image/webp", 15188],
      "capri_sun_cover_v001.webp": ["image/webp", 57032],
      "wawa_coffee_island_cover_v001.webp": ["image/webp", 31948],
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
