import { ImageResponse } from "@vercel/og";

export const runtime = "edge"; // 修正：この書き方が最新の仕様

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
