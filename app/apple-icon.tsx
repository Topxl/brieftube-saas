import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#dc2626",
        borderRadius: "32px",
      }}
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4 4L13 12L4 20V4Z" fill="white" />
        <path d="M13 4L22 12L13 20V4Z" fill="white" />
      </svg>
    </div>,
    {
      ...size,
    },
  );
}
