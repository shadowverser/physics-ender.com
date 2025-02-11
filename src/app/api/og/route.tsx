import { ImageResponse } from "@vercel/og";

// フォントの設定 (デフォルトのフォント)
export const config = {
    runtime: "edge",
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "No Title";

    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    width: "1200px",
                    height: "630px",
                    backgroundColor: "black",
                    color: "white",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "50px",
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "50px",
                }}
            >
                {title}
            </div>
        )
    );
}
