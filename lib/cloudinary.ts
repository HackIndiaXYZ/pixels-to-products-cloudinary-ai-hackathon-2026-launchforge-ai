
export type CloudAsset = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
  duration?: number;
};

type ResourceType = "auto" | "image" | "video" | "raw";

export async function uploadToCloudinary(
  file: File | Blob,
  filename: string,
  folder = "launchready",
  resourceType: ResourceType = "auto"
): Promise<CloudAsset> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud || !preset) {
    throw new Error(
      "Cloudinary is not configured. Check your cloud name and unsigned upload preset in .env.local."
    );
  }

  if (!file || file.size === 0) {
    throw new Error("Please select a valid file before uploading.");
  }

  const extension = filename.split(".").pop()?.toLowerCase() ?? "";

  const videoExtensions = [
    "mp4",
    "mov",
    "webm",
    "m4v",
    "avi",
    "mpeg",
    "mpg",
    "ogv",
  ];

  const audioExtensions = ["mp3", "wav", "m4a", "aac", "flac", "ogg"];

  const isVideo =
    file.type.startsWith("video/") || videoExtensions.includes(extension);

  const isAudio =
    file.type.startsWith("audio/") || audioExtensions.includes(extension);

  // Cloudinary treats audio assets as video resources.
  const detectedType: ResourceType =
    isVideo || isAudio ? "video" : resourceType;

  const body = new FormData();
  body.append("file", file, filename);
  body.append("upload_preset", preset);
  body.append("folder", folder);
  body.append("tags", "launchready-ai,campaign");

  // Auto detects the correct asset type when no explicit type is required.
  const endpointType =
    detectedType === "auto" ? "auto" : detectedType;

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/${endpointType}/upload`,
    {
      method: "POST",
      body,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        `Cloudinary upload failed (${response.status}). Check your upload preset and allowed formats.`
    );
  }

  if (!data.secure_url || !data.public_id) {
    throw new Error("Cloudinary upload completed without a valid asset URL.");
  }

  return data as CloudAsset;
}

export function transformUrl(
  secureUrl: string,
  width: number,
  height: number,
  mode: "pad" | "fill" = "pad"
): string {
  if (!secureUrl || !secureUrl.includes("/upload/")) {
    return secureUrl;
  }

  const transformation =
    mode === "pad"
      ? `c_pad,w_${width},h_${height},b_rgb:101827,f_auto,q_auto`
      : `c_fill,w_${width},h_${height},g_auto,f_auto,q_auto`;

  return secureUrl.replace(
    "/upload/",
    `/upload/${transformation}/`
  );
}